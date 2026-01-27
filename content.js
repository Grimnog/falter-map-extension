// Content script for Falter Lokalführer pages
// Extracts restaurant data and displays map modal

(function() {
    'use strict';

    // Avoid running multiple times
    if (window.falterMapExtensionLoaded) return;
    window.falterMapExtensionLoaded = true;

    console.log('Falter Map Extension: Content script loaded');

    let map = null;
    let markers = [];
    let mapModal = null;
    let selectedRestaurantIndex = -1;
    let navigableRestaurants = [];

    // Parse restaurant entries from a document
    function parseRestaurantsFromDOM(doc) {
        const restaurants = [];

        const links = doc.querySelectorAll('a.group.block[href*="/lokal/"]');

        console.log('Found restaurant links:', links.length);

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;

            const idMatch = href.match(/\/lokal\/(\d+)\//);
            if (!idMatch) return;

            const id = idMatch[1];
            const text = link.innerText || link.textContent || '';

            let name = '';
            const h2 = link.querySelector('h2');
            if (h2) {
                name = h2.textContent.trim();
            } else {
                const lines = text.split('\n').map(l => l.trim()).filter(l => l && l.length > 2);
                for (const line of lines) {
                    if (!line.match(/^\d{4}\s*Wien/i) && !line.match(/^(derzeit|Jetzt|öffnet|geschlossen|bis\s)/i)) {
                        name = line;
                        break;
                    }
                }
            }

            const addressMatch = text.match(/(\d{4})\s*Wien,?\s*([A-Za-zäöüÄÖÜßéèê\s\-\.]+?)[\s\n]+(\d+[A-Za-z\/\-]*)/i);

            if (name && addressMatch) {
                const district = addressMatch[1];
                const street = addressMatch[2].trim();
                const number = addressMatch[3].trim();

                const restaurant = {
                    id: id,
                    name: name.split('\n')[0].trim(),
                    district: district,
                    street: `${street} ${number}`,
                    address: `${district} Wien, ${street} ${number}`,
                    url: href.startsWith('http') ? href : `https://www.falter.at${href}`
                };

                if (!restaurants.find(r => r.id === id)) {
                    restaurants.push(restaurant);
                    console.log('Parsed:', restaurant.name, '-', restaurant.address);
                }
            }
        });

        return restaurants;
    }

    // Get pagination info
    function getPaginationInfo() {
        const pageText = document.body.innerText || '';
        // Match both "Seite" and "SEITE" (case-insensitive)
        const pageMatch = pageText.match(/seite\s+(\d+)\s*\/\s*(\d+)/i);

        if (pageMatch) {
            return {
                current: parseInt(pageMatch[1]),
                total: parseInt(pageMatch[2])
            };
        }
        return { current: 1, total: 1 };
    }

    // Get search URL base
    function getSearchUrlBase() {
        const url = new URL(window.location.href);
        url.searchParams.delete('page');
        return url.toString();
    }

    // Fetch a specific page
    async function fetchPage(pageNum) {
        const baseUrl = getSearchUrlBase();
        const separator = baseUrl.includes('?') ? '&' : '?';
        const url = pageNum > 1 ? `${baseUrl}${separator}page=${pageNum}` : baseUrl;

        console.log('Fetching page:', pageNum);

        try {
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            return parseRestaurantsFromDOM(doc);
        } catch (error) {
            console.error(`Error fetching page ${pageNum}:`, error);
            return [];
        }
    }

    // Fetch all pages
    async function fetchAllPages(progressCallback) {
        const pagination = getPaginationInfo();
        console.log('Pagination:', pagination);

        const allRestaurants = [];
        const seenIds = new Set();

        for (let page = 1; page <= pagination.total; page++) {
            if (progressCallback) progressCallback(page, pagination.total);

            const restaurants = (page === pagination.current)
                ? parseRestaurantsFromDOM(document)
                : await fetchPage(page);

            restaurants.forEach(r => {
                if (!seenIds.has(r.id)) {
                    seenIds.add(r.id);
                    allRestaurants.push(r);
                }
            });

            if (page < pagination.total) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }

        console.log('Total restaurants:', allRestaurants.length);
        return allRestaurants;
    }

    // Geocoding functions
    async function loadGeocodeCache() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['geocodeCache'], (result) => {
                const cache = result.geocodeCache || {};
                const now = Date.now();
                const validCache = {};

                // Filter out expired entries and migrate old format
                for (const [address, data] of Object.entries(cache)) {
                    // Handle old format (no expiresAt) - migrate it
                    if (!data.expiresAt) {
                        // Old format: { lat, lng }
                        validCache[address] = {
                            coords: data,
                            cachedAt: now,
                            expiresAt: now + (30 * 24 * 60 * 60 * 1000) // 30 days
                        };
                    } else if (data.expiresAt > now) {
                        // New format and not expired
                        validCache[address] = data;
                    }
                    // Skip expired entries (implicit cleanup)
                }

                resolve(validCache);
            });
        });
    }

    async function saveToCache(address, coords) {
        const cache = await loadGeocodeCache();
        const ttlDays = 30; // 30-day expiration
        const expiresAt = Date.now() + (ttlDays * 24 * 60 * 60 * 1000);

        cache[address.toLowerCase().trim()] = {
            coords: coords,
            cachedAt: Date.now(),
            expiresAt: expiresAt
        };

        return new Promise((resolve) => {
            chrome.storage.local.set({ geocodeCache: cache }, resolve);
        });
    }

    // Clean expired cache entries and save back to storage
    async function cleanExpiredCache() {
        console.log('Cleaning expired geocode cache...');
        const cache = await loadGeocodeCache(); // Already filters expired

        return new Promise((resolve) => {
            chrome.storage.local.set({ geocodeCache: cache }, () => {
                console.log('Cache cleanup complete');

                // Log cache stats
                chrome.storage.local.getBytesInUse(['geocodeCache'], (bytes) => {
                    const kb = (bytes / 1024).toFixed(2);
                    const count = Object.keys(cache).length;
                    console.log(`Cache: ${count} addresses, ${kb} KB`);

                    if (bytes > 5_000_000) { // 5MB warning
                        console.warn('Cache size exceeds 5MB - consider clearing');
                    }
                });

                resolve();
            });
        });
    }

    async function geocodeAddress(address) {
        console.log('Geocoding:', address);

        // Build list of address variations to try
        const addressVariations = [];

        const match = address.match(/^(\d{4})\s*Wien,\s*(.+)$/i);
        if (match) {
            const district = match[1];
            const streetPart = match[2].trim();

            // Try original format first
            addressVariations.push(`${streetPart}, Wien, Austria`);

            // Handle market stalls: "Karmelitermarkt Stand 65" -> "Karmelitermarkt"
            const standMatch = streetPart.match(/^(.+?)\s+(Stand|Box|Platz|Nr\.?)\s+\d+/i);
            if (standMatch) {
                const mainLocation = standMatch[1].trim();
                addressVariations.push(`${mainLocation}, ${district} Wien, Austria`);
                addressVariations.push(`${mainLocation}, Wien, Austria`);
            }

            // Try with district
            addressVariations.push(`${streetPart}, ${district} Wien, Austria`);

            // Try just the main part before any numbers/special characters
            const simplifiedMatch = streetPart.match(/^([A-Za-zäöüÄÖÜß\s\-]+)/);
            if (simplifiedMatch) {
                const simplified = simplifiedMatch[1].trim();
                addressVariations.push(`${simplified}, Wien, Austria`);
            }
        } else {
            addressVariations.push(address + ', Austria');
        }

        // Try each variation until we find one that works
        for (let i = 0; i < addressVariations.length; i++) {
            const formattedAddress = addressVariations[i];
            console.log(`Trying variation ${i + 1}: ${formattedAddress}`);

            const query = encodeURIComponent(formattedAddress);
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;

            try {
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'FalterMapExtension/1.0'
                    }
                });

                if (!response.ok) {
                    console.error(`HTTP error: ${response.status}`);
                    continue;
                }

                const data = await response.json();

                if (data && data.length > 0) {
                    const coords = {
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon)
                    };
                    console.log('Found coords:', coords, 'using:', formattedAddress);
                    return coords;
                }
            } catch (error) {
                console.error('Geocoding error for', formattedAddress, ':', error);
            }

            // Small delay between attempts to respect rate limits
            if (i < addressVariations.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }

        console.warn('No results for any variation of:', address);
        return null;
    }

    async function geocodeRestaurants(restaurantList, progressCallback) {
        const cache = await loadGeocodeCache();
        const results = [];
        let needsGeocoding = [];

        for (const restaurant of restaurantList) {
            const cacheKey = restaurant.address.toLowerCase().trim();

            if (cache[cacheKey]) {
                const cached = cache[cacheKey];
                results.push({
                    ...restaurant,
                    coords: cached.coords || cached, // Support both old and new format
                    fromCache: true
                });
            } else {
                needsGeocoding.push(restaurant);
            }
        }

        const cachedCount = results.length;

        if (cachedCount > 0 && progressCallback) {
            progressCallback(cachedCount, restaurantList.length, results);
        }

        if (needsGeocoding.length > 0) {
            for (let i = 0; i < needsGeocoding.length; i++) {
                const restaurant = needsGeocoding[i];

                if (progressCallback) {
                    progressCallback(cachedCount + i + 1, restaurantList.length, results);
                }

                const coords = await geocodeAddress(restaurant.address);

                if (coords) {
                    await saveToCache(restaurant.address, coords);
                }

                results.push({
                    ...restaurant,
                    coords: coords,
                    fromCache: false
                });

                if (progressCallback) {
                    progressCallback(cachedCount + i + 1, restaurantList.length, results);
                }

                if (i < needsGeocoding.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1100));
                }
            }
        }

        return results;
    }

    // Create numbered marker
    function createNumberedMarker(number) {
        return L.divIcon({
            className: 'custom-marker',
            html: `<div class="marker-pin">
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
            map = L.map('modal-map').setView([48.2082, 16.3719], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);

            // Start geocoding
            startGeocoding(restaurants);
        }, 100);
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

    function handleKeyboardNavigation(event) {
        // Only process if modal is open
        if (!mapModal) return;

        const items = document.querySelectorAll('#modal-results .result-item:not(.no-coords)');
        if (items.length === 0) return;

        switch(event.key) {
            case 'Escape':
                event.preventDefault();
                closeMapModal();
                break;
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
            map.setView([restaurant.coords.lat, restaurant.coords.lng], 16);
            const marker = markers.find(m => m.restaurantId === restaurant.id);
            if (marker) marker.openPopup();
        }
    }

    async function startGeocoding(restaurants) {
        const statusEl = document.getElementById('modal-geocode-status');
        const noteEl = document.getElementById('status-note');
        const resultsEl = document.getElementById('modal-results');

        // Show initial state
        const cache = await loadGeocodeCache();
        let currentResults = [];

        // First, show cached results
        for (const restaurant of restaurants) {
            const cacheKey = restaurant.address.toLowerCase().trim();
            if (cache[cacheKey]) {
                currentResults.push({
                    ...restaurant,
                    coords: cache[cacheKey]
                });
            } else {
                currentResults.push({
                    ...restaurant,
                    coords: null
                });
            }
        }

        // Display initial results
        updateResultsList(currentResults);
        updateMapMarkers(currentResults.filter(r => r.coords));

        const initialLocatedCount = currentResults.filter(r => r.coords).length;
        statusEl.textContent = `${initialLocatedCount}/${restaurants.length} located`;

        // Check if we need to geocode anything
        const needsGeocoding = restaurants.filter(r => {
            const cacheKey = r.address.toLowerCase().trim();
            return !cache[cacheKey];
        });

        if (needsGeocoding.length > 0) {
            noteEl.style.display = 'block';
            statusEl.classList.add('loading');

            const results = await geocodeRestaurants(restaurants, (current, total, progressResults) => {
                const locatedCount = progressResults.filter(r => r.coords).length;
                statusEl.textContent = `${locatedCount}/${total} located`;
                updateResultsList(progressResults);
                updateMapMarkers(progressResults.filter(r => r.coords));
            });

            const locatedCount = results.filter(r => r.coords).length;
            statusEl.textContent = `${locatedCount}/${restaurants.length} located`;
            statusEl.classList.remove('loading');
            noteEl.style.display = 'none';
            updateResultsList(results);
            updateMapMarkers(results.filter(r => r.coords));
        }
    }

    function updateResultsList(restaurantList) {
        const resultsEl = document.getElementById('modal-results');
        if (!resultsEl) return;

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

                    map.setView([restaurant.coords.lat, restaurant.coords.lng], 16);

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

    function updateMapMarkers(restaurantList) {
        if (!map) return;

        markers.forEach(m => map.removeLayer(m));
        markers = [];

        restaurantList.forEach((restaurant, index) => {
            if (!restaurant.coords) return;

            const googleMapsQuery = encodeURIComponent(`${restaurant.name}, ${restaurant.address}, Austria`);
            const marker = L.marker([restaurant.coords.lat, restaurant.coords.lng], {
                icon: createNumberedMarker(index + 1)
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
            map.fitBounds(group.getBounds().pad(0.1));
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
                alert('No restaurants found.');
                btn.innerHTML = originalHTML;
                btn.disabled = false;
                return;
            }

            // Check cache to estimate how many need geocoding
            const cache = await loadGeocodeCache();
            let needsGeocoding = 0;
            for (const restaurant of restaurants) {
                const cacheKey = restaurant.address.toLowerCase().trim();
                if (!cache[cacheKey]) {
                    needsGeocoding++;
                }
            }

            // Nominatim API threshold warning (100+ uncached addresses)
            if (needsGeocoding >= 100) {
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
        cleanExpiredCache().catch(err => {
            console.error('Cache cleanup error:', err);
        });

        setTimeout(injectMapButton, 500);

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
