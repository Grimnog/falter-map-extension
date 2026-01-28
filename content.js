// Content script for Falter Lokalführer pages
// Extracts restaurant data and displays map modal

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

    let map = null;
    let markers = [];
    let mapModal = null;
    let selectedRestaurantIndex = -1;
    let navigableRestaurants = [];

    // Map marker functions
    // Create numbered marker
    function createNumberedMarker(number, isNew = false) {
        const pinClass = isNew ? 'marker-pin marker-new' : 'marker-pin';
        return L.divIcon({
            className: 'custom-marker',
            html: `<div class="${pinClass}">
                <div class="marker-number">${number}</div>
            </div>`,
            iconSize: [40, 50],
            iconAnchor: [20, 46],
            popupAnchor: [0, -48]
        });
    }

    // Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Create and show map modal
    function createMapModal(restaurants) {
        // Remove existing modal if any
        if (mapModal) {
            mapModal.remove();
            map = null;
            markers = [];
        }

        // Create modal HTML
        mapModal = document.createElement('div');
        mapModal.id = 'falter-map-modal';
        mapModal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close" title="Close">&times;</button>
                <div class="modal-body">
                    <aside class="modal-sidebar">
                        <div class="modal-header">
                            <h1>Falter Restaurant Map</h1>
                            <p id="modal-info">${restaurants.length} restaurants</p>
                        </div>
                        <div class="modal-status">
                            <div class="status-row">
                                <span class="status-label">Geocoding</span>
                                <span class="status-value" id="modal-geocode-status">Starting...</span>
                            </div>
                            <div class="progress-container">
                                <div class="progress-bar" id="progress-bar"></div>
                                <div class="progress-text" id="progress-text">0/0 located</div>
                            </div>
                            <div class="status-note" id="status-note" style="display: none;">Addresses are being located, this may take a moment...</div>
                        </div>
                        <div class="modal-results" id="modal-results"></div>
                    </aside>
                    <div class="modal-map-container">
                        <div id="modal-map"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(mapModal);

        // Close button handler
        mapModal.querySelector('.modal-close').addEventListener('click', closeMapModal);
        mapModal.querySelector('.modal-overlay').addEventListener('click', closeMapModal);

        // Add keyboard navigation listener
        document.addEventListener('keydown', handleKeyboardNavigation);

        // Initialize map
        setTimeout(() => {
            map = L.map('modal-map').setView(CONFIG.MAP.DEFAULT_CENTER, CONFIG.MAP.DEFAULT_ZOOM);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);

            // Start geocoding
            startGeocoding(restaurants);
        }, CONFIG.ANIMATION.MODAL_INIT_DELAY_MS);
    }

    function closeMapModal() {
        if (mapModal) {
            // Remove keyboard listener and reset state
            document.removeEventListener('keydown', handleKeyboardNavigation);

            mapModal.remove();
            mapModal = null;
            map = null;
            markers = [];
            selectedRestaurantIndex = -1;
            navigableRestaurants = [];
        }
    }

    function showKeyboardHelp() {
        // Check if help is already visible
        if (document.getElementById('keyboard-help-overlay')) return;

        const helpOverlay = document.createElement('div');
        helpOverlay.id = 'keyboard-help-overlay';
        helpOverlay.innerHTML = `
            <div class="keyboard-help">
                <h3>⌨️ Keyboard Shortcuts</h3>
                <dl>
                    <dt><kbd>↑</kbd> <kbd>↓</kbd></dt>
                    <dd>Navigate restaurants</dd>
                    <dt><kbd>ESC</kbd></dt>
                    <dd>Close map</dd>
                    <dt><kbd>?</kbd></dt>
                    <dd>Show this help</dd>
                </dl>
                <p class="help-hint">Press any key to close</p>
            </div>
        `;

        mapModal.appendChild(helpOverlay);

        // Close help on any key press
        const closeHelp = () => {
            helpOverlay.remove();
            document.removeEventListener('keydown', closeHelp);
        };
        setTimeout(() => document.addEventListener('keydown', closeHelp), 100);
    }

    function handleKeyboardNavigation(event) {
        // Only process if modal is open
        if (!mapModal) return;

        // Handle help shortcut (works regardless of items)
        if (event.key === '?' || event.key === '/') {
            event.preventDefault();
            showKeyboardHelp();
            return;
        }

        // Handle escape (works regardless of items)
        if (event.key === 'Escape') {
            event.preventDefault();
            // Close help overlay if visible
            const helpOverlay = document.getElementById('keyboard-help-overlay');
            if (helpOverlay) {
                helpOverlay.remove();
                return;
            }
            closeMapModal();
            return;
        }

        // Navigation shortcuts need items
        const items = document.querySelectorAll('#modal-results .result-item:not(.no-coords)');
        if (items.length === 0) return;

        switch(event.key) {
            case 'ArrowDown':
                event.preventDefault();
                navigateRestaurants(1, items);
                break;
            case 'ArrowUp':
                event.preventDefault();
                navigateRestaurants(-1, items);
                break;
        }
    }

    function navigateRestaurants(direction, items) {
        // Initialize or update index with wrap-around
        if (selectedRestaurantIndex === -1) {
            selectedRestaurantIndex = direction > 0 ? 0 : items.length - 1;
        } else {
            selectedRestaurantIndex = (selectedRestaurantIndex + direction + items.length) % items.length;
        }

        // Update visual state and scroll
        items.forEach((item, index) => {
            if (index === selectedRestaurantIndex) {
                item.classList.add('active');
                item.setAttribute('aria-selected', 'true');
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                item.classList.remove('active');
                item.setAttribute('aria-selected', 'false');
            }
        });

        // Zoom map to selected restaurant
        const restaurant = navigableRestaurants[selectedRestaurantIndex];
        if (restaurant && restaurant.coords) {
            map.setView([restaurant.coords.lat, restaurant.coords.lng], CONFIG.MAP.SELECTED_ZOOM);
            const marker = markers.find(m => m.restaurantId === restaurant.id);
            if (marker) marker.openPopup();
        }
    }

    // Helper function to update both status text and progress bar
    function updateProgress(current, total) {
        const statusEl = document.getElementById('modal-geocode-status');
        const progressBarEl = document.getElementById('progress-bar');
        const progressTextEl = document.getElementById('progress-text');

        if (statusEl) statusEl.textContent = `${current}/${total} located`;
        if (progressTextEl) progressTextEl.textContent = `${current}/${total} located`;

        if (progressBarEl) {
            const percentage = total > 0 ? (current / total) * 100 : 0;
            progressBarEl.style.width = `${percentage}%`;
        }
    }

    async function startGeocoding(restaurants) {
        const statusEl = document.getElementById('modal-geocode-status');
        const noteEl = document.getElementById('status-note');
        const resultsEl = document.getElementById('modal-results');

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
        updateResultsList([]);
        setTimeout(() => {
            updateResultsList(currentResults);
            updateMapMarkers(currentResults.filter(r => r.coords), false);
        }, CONFIG.UI.SKELETON_DELAY_MS);

        const initialLocatedCount = currentResults.filter(r => r.coords).length;
        updateProgress(initialLocatedCount, restaurants.length);

        // Check if we need to geocode anything
        const needsGeocoding = restaurants.filter(r => {
            const cacheKey = r.address.toLowerCase().trim();
            return !cache[cacheKey];
        });

        if (needsGeocoding.length > 0) {
            noteEl.style.display = 'block';
            statusEl.classList.add('loading');

            let lastMarkerCount = currentResults.filter(r => r.coords).length;

            const results = await geocodeRestaurants(restaurants, (current, total, progressResults) => {
                const locatedCount = progressResults.filter(r => r.coords).length;
                updateProgress(locatedCount, total);
                updateResultsList(progressResults);

                // During progress, always animate=true to prevent auto-zoom
                const newMarkersAdded = locatedCount > lastMarkerCount;
                if (newMarkersAdded) {
                    updateMapMarkers(progressResults.filter(r => r.coords), true);
                }
                lastMarkerCount = locatedCount;
            });

            const locatedCount = results.filter(r => r.coords).length;
            updateProgress(locatedCount, restaurants.length);
            statusEl.classList.remove('loading');
            noteEl.style.display = 'none';
            updateResultsList(results);

            // Don't auto-zoom after geocoding - let user explore or click to zoom
        }
    }

    // Create loading skeleton
    function createLoadingSkeleton(count = 5) {
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
                <div class="skeleton-item">
                    <div class="skeleton skeleton-number"></div>
                    <div class="skeleton-content">
                        <div class="skeleton skeleton-title"></div>
                        <div class="skeleton skeleton-subtitle"></div>
                    </div>
                </div>
            `;
        }
        return html;
    }

    function updateResultsList(restaurantList) {
        const resultsEl = document.getElementById('modal-results');
        if (!resultsEl) return;

        // Show skeleton if list is empty (during initial load)
        if (restaurantList.length === 0) {
            resultsEl.innerHTML = createLoadingSkeleton(8);
            return;
        }

        resultsEl.innerHTML = '';

        // Reset navigable restaurants array
        navigableRestaurants = [];

        restaurantList.forEach((restaurant, index) => {
            const item = document.createElement('div');
            item.className = 'result-item' + (restaurant.coords ? '' : ' no-coords');

            // Add ARIA attributes
            if (restaurant.coords) {
                item.setAttribute('role', 'option');
                item.setAttribute('aria-selected', 'false');
                item.setAttribute('tabindex', '-1');
            }

            item.innerHTML = `
                <div class="result-number">${index + 1}</div>
                <div class="result-content">
                    <div class="result-name">${escapeHtml(restaurant.name)}</div>
                    <div class="result-address">${escapeHtml(restaurant.address)}</div>
                </div>
            `;

            if (restaurant.coords) {
                // Track for keyboard navigation
                navigableRestaurants.push(restaurant);

                item.addEventListener('click', () => {
                    document.querySelectorAll('.result-item').forEach(el => {
                        el.classList.remove('active');
                        el.setAttribute('aria-selected', 'false');
                    });
                    item.classList.add('active');
                    item.setAttribute('aria-selected', 'true');

                    // Update selectedRestaurantIndex when clicking
                    const navigableItems = Array.from(document.querySelectorAll('#modal-results .result-item:not(.no-coords)'));
                    selectedRestaurantIndex = navigableItems.indexOf(item);

                    map.setView([restaurant.coords.lat, restaurant.coords.lng], CONFIG.MAP.SELECTED_ZOOM);

                    const marker = markers.find(m => m.restaurantId === restaurant.id);
                    if (marker) {
                        marker.openPopup();
                    }
                });
            }

            resultsEl.appendChild(item);
        });

        // Add ARIA role to container
        resultsEl.setAttribute('role', 'listbox');
        resultsEl.setAttribute('aria-label', 'Restaurant list');
    }

    function updateMapMarkers(restaurantList, animate = false) {
        if (!map) return;

        // When animate=false, do a full refresh (remove all and recreate)
        if (!animate) {
            markers.forEach(m => map.removeLayer(m));
            markers = [];

            restaurantList.forEach((restaurant, index) => {
                if (!restaurant.coords) return;

                const googleMapsQuery = encodeURIComponent(`${restaurant.name}, ${restaurant.address}, Austria`);
                const marker = L.marker([restaurant.coords.lat, restaurant.coords.lng], {
                    icon: createNumberedMarker(index + 1, false)
                })
                    .addTo(map)
                    .bindPopup(`
                        <div class="popup-name">${escapeHtml(restaurant.name)}</div>
                        <div class="popup-address">${escapeHtml(restaurant.address)}</div>
                        <div class="popup-links">
                            <a href="${restaurant.url}" target="_blank">Falter</a>
                            <a href="https://www.google.com/maps/search/?api=1&query=${googleMapsQuery}" target="_blank">Google Maps</a>
                        </div>
                    `);

                marker.restaurantId = restaurant.id;
                markers.push(marker);
            });

            if (markers.length > 0) {
                const group = L.featureGroup(markers);
                map.fitBounds(group.getBounds().pad(CONFIG.MAP.BOUNDS_PADDING));
            }
            return;
        }

        // When animate=true, only add NEW markers that don't exist yet
        const existingMarkerIds = new Set(markers.map(m => m.restaurantId));
        let staggerDelay = 0;

        restaurantList.forEach((restaurant, index) => {
            if (!restaurant.coords) return;

            // Skip if marker already exists
            if (existingMarkerIds.has(restaurant.id)) {
                return;
            }

            const googleMapsQuery = encodeURIComponent(`${restaurant.name}, ${restaurant.address}, Austria`);

            // Add new marker with animation
            const addMarker = () => {
                const marker = L.marker([restaurant.coords.lat, restaurant.coords.lng], {
                    icon: createNumberedMarker(index + 1, true)
                })
                    .addTo(map)
                    .bindPopup(`
                        <div class="popup-name">${escapeHtml(restaurant.name)}</div>
                        <div class="popup-address">${escapeHtml(restaurant.address)}</div>
                        <div class="popup-links">
                            <a href="${restaurant.url}" target="_blank">Falter</a>
                            <a href="https://www.google.com/maps/search/?api=1&query=${googleMapsQuery}" target="_blank">Google Maps</a>
                        </div>
                    `);

                marker.restaurantId = restaurant.id;
                markers.push(marker);

                // Add pulse class for newly added markers
                if (marker._icon) {
                    marker._icon.classList.add('marker-pulse');
                    setTimeout(() => {
                        if (marker._icon) marker._icon.classList.remove('marker-pulse');
                    }, CONFIG.ANIMATION.MARKER_PULSE_MS);
                }
            };

            // Stagger each new marker
            setTimeout(addMarker, staggerDelay);
            staggerDelay += CONFIG.ANIMATION.MARKER_STAGGER_MS;
        });

        // Don't adjust zoom during progress updates - only at the very end
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

            // Show modal with map
            createMapModal(restaurants);

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
