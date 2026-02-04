// Content script for Falter Lokalführer pages
// Coordinates restaurant data fetching and map display

(async function() {
    'use strict';

    // Avoid running multiple times
    if (window.falterMapExtensionLoaded) return;
    window.falterMapExtensionLoaded = true;

    console.log('Falter Map Extension: Content script loaded');

    // Dynamically import modules
    const { CONFIG } = await import(chrome.runtime.getURL('modules/constants.js'));
    const { CacheManager } = await import(chrome.runtime.getURL('modules/cache-utils.js'));
    const { parseRestaurantsFromDOM, getPaginationInfo, fetchAllPages, fetchUpToLimit } = await import(chrome.runtime.getURL('modules/dom-parser.js'));
    const { geocodeAddress, geocodeRestaurants } = await import(chrome.runtime.getURL('modules/geocoder.js'));
    const { MapModal } = await import(chrome.runtime.getURL('modules/MapModal.js'));
    const { Navigation } = await import(chrome.runtime.getURL('modules/Navigation.js'));

    let mapModal = null;
    let navigation = null;

    // Start geocoding process and display results in the modal
    async function startGeocoding(restaurants) {
        // Show initial state
        const cache = await CacheManager.load();
        let currentResults = [];

        // First, show cached results
        for (const restaurant of restaurants) {
            const cacheKey = restaurant.address.toLowerCase().trim();
            if (cache[cacheKey]) {
                const cached = cache[cacheKey];
                currentResults.push({
                    ...restaurant,
                    coords: cached.coords || cached // Support both old and new format
                });
            } else {
                currentResults.push({
                    ...restaurant,
                    coords: null
                });
            }
        }

        // Display initial results with skeleton
        mapModal.updateResultsList([]);
        setTimeout(() => {
            mapModal.updateResultsList(currentResults);
            mapModal.updateMapMarkers(currentResults.filter(r => r.coords), false);

            // Update navigation with current results
            if (navigation) {
                navigation.updateNavigableRestaurants(currentResults);
            }
        }, CONFIG.UI.SKELETON_DELAY_MS);

        const initialLocatedCount = currentResults.filter(r => r.coords).length;

        // Check if we need to geocode anything
        const needsGeocoding = restaurants.filter(r => {
            const cacheKey = r.address.toLowerCase().trim();
            return !cache[cacheKey];
        });

        // Update progress - mark as final if all restaurants are already cached
        const allCached = needsGeocoding.length === 0;
        mapModal.updateProgress(restaurants.length, restaurants.length, initialLocatedCount, allCached);

        if (needsGeocoding.length > 0) {
            mapModal.showLoadingStatus();

            let lastMarkerCount = currentResults.filter(r => r.coords).length;
            let hasAutoZoomed = false; // Track if we've done initial auto-zoom

            try {
                const results = await geocodeRestaurants(restaurants, (current, total, progressResults) => {
                    const locatedCount = progressResults.filter(r => r.coords).length;
                    mapModal.updateProgress(current, total, locatedCount);
                    mapModal.updateResultsList(progressResults);

                    // Update navigation with current results
                    if (navigation) {
                        navigation.updateNavigableRestaurants(progressResults);
                    }

                    // Add new markers immediately without staggered animation (prevents visual glitch)
                    const newMarkersAdded = locatedCount > lastMarkerCount;
                    if (newMarkersAdded) {
                        mapModal.updateMapMarkers(progressResults.filter(r => r.coords), false);
                    }
                    lastMarkerCount = locatedCount;

                    // Auto-zoom after first 5 restaurants for better initial view
                    if (!hasAutoZoomed && locatedCount >= 5) {
                        hasAutoZoomed = true;
                        const map = mapModal.getMap();
                        const markerClusterGroup = mapModal.getMarkerClusterGroup();
                        if (map && markerClusterGroup) {
                            const bounds = markerClusterGroup.getBounds();
                            if (bounds.isValid()) {
                                map.fitBounds(bounds.pad(0.2)); // 20% padding for breathing room
                            }
                        }
                    }
                });

                const locatedCount = results.filter(r => r.coords).length;
                mapModal.updateProgress(restaurants.length, restaurants.length, locatedCount, true); // Mark as final
                mapModal.hideLoadingStatus();
                mapModal.updateResultsList(results);

                // Update navigation with final results
                if (navigation) {
                    navigation.updateNavigableRestaurants(results);
                }

                // Don't auto-zoom after geocoding - let user explore or click to zoom
            } catch (error) {
                console.error('Geocoding failed:', error);

                // Show error status in modal but keep restaurant list functional
                mapModal.showGeocodingError('Geokodierung fehlgeschlagen');

                // Ensure restaurant list is displayed even without coordinates
                // (already shown from cache check, but update to show all restaurants)
                const resultsWithoutCoords = restaurants.map(r => {
                    const cacheKey = r.address.toLowerCase().trim();
                    const cached = cache[cacheKey];
                    return {
                        ...r,
                        coords: cached ? (cached.coords || cached) : null
                    };
                });
                mapModal.updateResultsList(resultsWithoutCoords);

                // Update navigation with available results
                if (navigation) {
                    navigation.updateNavigableRestaurants(resultsWithoutCoords);
                }

                // Show user-friendly error notification
                const { ErrorHandler } = await import(chrome.runtime.getURL('modules/error-handler.js'));
                const { ERROR_MESSAGES } = await import(chrome.runtime.getURL('modules/error-messages.js'));
                ErrorHandler.showToast(ERROR_MESSAGES.geocodingCompleteFailure, {
                    type: 'error',
                    duration: 8000
                });
            }
        } else {
            // All results cached - mark as complete immediately
            mapModal.hideLoadingStatus();
        }
    }

    // Inject the map button
    function injectMapButton() {
        if (document.getElementById('falter-map-btn-container')) {
            return;
        }

        const entriesDiv = document.getElementById('entries');
        if (!entriesDiv) return;

        // Create floating button container
        const container = document.createElement('div');
        container.id = 'falter-map-btn-container';

        const btn = document.createElement('button');
        btn.id = 'falter-map-btn';
        btn.type = 'button';
        btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>Auf Karte anzeigen</span>
        `;

        container.appendChild(btn);

        // Insert at the top of entries div for better visibility
        entriesDiv.insertBefore(container, entriesDiv.firstChild);

        btn.addEventListener('click', handleMapButtonClick);
    }

    // Handle map button click
    async function handleMapButtonClick() {
        console.log('Map button clicked');
        const btn = document.getElementById('falter-map-btn');
        if (!btn) return;

        const originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span>Checking results...</span>`;

        try {
            // Get pagination info to estimate result count
            const pagination = getPaginationInfo();
            const currentPageRestaurants = parseRestaurantsFromDOM(document);
            const avgPerPage = currentPageRestaurants.length || 15;
            const estimatedTotal = avgPerPage * pagination.total;

            console.log(`Pagination: ${pagination.total} pages, estimated ~${estimatedTotal} restaurants`);

            let restaurants = [];
            let shouldLimit = estimatedTotal > CONFIG.GEOCODING.MAX_RESULTS;

            // Automatically limit if needed (no confirmation popup - silent limiting)
            if (shouldLimit) {
                console.log(`Auto-limiting: Fetching first ${CONFIG.GEOCODING.MAX_RESULTS} of ~${estimatedTotal} restaurants`);
                const result = await fetchUpToLimit(CONFIG.GEOCODING.MAX_RESULTS, (current, total) => {
                    btn.innerHTML = `<span>Loading page ${current}/${total}...</span>`;
                });
                restaurants = result.restaurants;
                console.log(`Fetched ${restaurants.length} of estimated ${result.estimatedTotal} total`);
            } else {
                restaurants = await fetchAllPages((current, total) => {
                    btn.innerHTML = `<span>Loading page ${current}/${total}...</span>`;
                });
            }

            if (restaurants.length === 0) {
                // Show empty state modal
                const emptyModal = document.createElement('div');
                emptyModal.id = 'falter-map-modal';
                emptyModal.innerHTML = `
                    <div class="modal-overlay"></div>
                    <div class="modal-content">
                        <button class="modal-close" title="Close">&times;</button>
                        <div class="modal-body">
                            <div class="empty-state">
                                <div class="empty-state-icon">🔍</div>
                                <div class="empty-state-title">No Restaurants Found</div>
                                <div class="empty-state-message">
                                    We couldn't find any restaurants matching your filters.<br>
                                    Try adjusting your search criteria and try again.
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(emptyModal);

                const closeBtn = emptyModal.querySelector('.modal-close');
                const overlay = emptyModal.querySelector('.modal-overlay');
                const closeEmpty = () => emptyModal.remove();
                closeBtn.addEventListener('click', closeEmpty);
                overlay.addEventListener('click', closeEmpty);

                btn.innerHTML = originalHTML;
                btn.disabled = false;
                return;
            }

            // Check cache to estimate how many need geocoding
            const cache = await CacheManager.load();
            let needsGeocoding = 0;
            for (const restaurant of restaurants) {
                const cacheKey = restaurant.address.toLowerCase().trim();
                if (!cache[cacheKey]) {
                    needsGeocoding++;
                }
            }

            // Create and show modal with map (pass estimatedTotal if we limited results)
            const displayTotal = (shouldLimit && estimatedTotal) ? estimatedTotal : null;
            mapModal = new MapModal(restaurants, displayTotal);
            mapModal.show(btn);

            // Create and enable navigation
            navigation = new Navigation(restaurants, mapModal);
            navigation.enable();

            // Register navigation callbacks
            navigation.onClose(() => {
                navigation.destroy();
                navigation = null;
                mapModal.destroy();
            });

            // Register callback for modal close
            mapModal.onClose(() => {
                if (navigation) {
                    navigation.destroy();
                    navigation = null;
                }
                mapModal = null;
            });

            // Register callback for restaurant list clicks to sync with navigation
            mapModal.onRestaurantClick((restaurant, navigableIndex) => {
                if (navigation) {
                    navigation.setIndex(navigableIndex);
                }
            });

            // Start geocoding process
            startGeocoding(restaurants);

            btn.innerHTML = originalHTML;
            btn.disabled = false;

        } catch (error) {
            console.error('Error:', error);
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            alert('Error: ' + error.message);
        }
    }

    // Initialize
    function init() {
        setTimeout(injectMapButton, CONFIG.ANIMATION.BUTTON_INJECT_DELAY_MS);

        const observer = new MutationObserver(() => {
            if (!document.getElementById('falter-map-btn-container') && document.getElementById('entries')) {
                injectMapButton();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Listen for URL changes (filter changes, pagination)
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                console.log('URL changed');
            }
        }).observe(document, { subtree: true, childList: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
