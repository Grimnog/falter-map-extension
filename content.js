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
    const { parseRestaurantsFromDOM, getPaginationInfo, fetchAllPages } = await import(chrome.runtime.getURL('modules/dom-parser.js'));
    const { geocodeAddress, geocodeRestaurants } = await import(chrome.runtime.getURL('modules/geocoder.js'));
    const { MapModal } = await import(chrome.runtime.getURL('modules/MapModal.js'));

    let mapModal = null;

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
        }, CONFIG.UI.SKELETON_DELAY_MS);

        const initialLocatedCount = currentResults.filter(r => r.coords).length;
        mapModal.updateProgress(restaurants.length, restaurants.length, initialLocatedCount);

        // Check if we need to geocode anything
        const needsGeocoding = restaurants.filter(r => {
            const cacheKey = r.address.toLowerCase().trim();
            return !cache[cacheKey];
        });

        if (needsGeocoding.length > 0) {
            mapModal.showLoadingStatus();

            let lastMarkerCount = currentResults.filter(r => r.coords).length;

            const results = await geocodeRestaurants(restaurants, (current, total, progressResults) => {
                const locatedCount = progressResults.filter(r => r.coords).length;
                mapModal.updateProgress(current, total, locatedCount);
                mapModal.updateResultsList(progressResults);

                // During progress, always animate=true to prevent auto-zoom
                const newMarkersAdded = locatedCount > lastMarkerCount;
                if (newMarkersAdded) {
                    mapModal.updateMapMarkers(progressResults.filter(r => r.coords), true);
                }
                lastMarkerCount = locatedCount;
            });

            const locatedCount = results.filter(r => r.coords).length;
            mapModal.updateProgress(restaurants.length, restaurants.length, locatedCount);
            mapModal.hideLoadingStatus();
            mapModal.updateResultsList(results);

            // Don't auto-zoom after geocoding - let user explore or click to zoom
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
        btn.innerHTML = `<span>Loading restaurants...</span>`;

        try {
            // Always fetch on-demand
            const restaurants = await fetchAllPages((current, total) => {
                btn.innerHTML = `<span>Loading page ${current}/${total}...</span>`;
            });

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

            // Nominatim API threshold warning (100+ uncached addresses)
            if (needsGeocoding >= CONFIG.NOMINATIM.WARNING_THRESHOLD) {
                const confirmed = confirm(
                    `⚠️ API Usage Notice\n\n` +
                    `You're about to geocode ${needsGeocoding} restaurant addresses using OpenStreetMap's Nominatim API.\n\n` +
                    `To be respectful of this free service:\n` +
                    `• We'll process 1 address per second\n` +
                    `• This will take approximately ${Math.ceil(needsGeocoding / 60)} minutes\n` +
                    `• Results will be cached for 30 days\n\n` +
                    `Continue with geocoding?`
                );

                if (!confirmed) {
                    btn.innerHTML = originalHTML;
                    btn.disabled = false;
                    return;
                }
            }

            // Create and show modal with map
            mapModal = new MapModal(restaurants);
            mapModal.show();

            // Register callback for modal close
            mapModal.onClose(() => {
                mapModal = null;
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
        // Clean expired cache on startup
        CacheManager.cleanExpired().catch(err => {
            console.error('Cache cleanup error:', err);
        });

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
