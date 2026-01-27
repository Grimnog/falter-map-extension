// Popup script for Falter Map Extension
console.log('=== POPUP SCRIPT LOADED ===');

// State
let map = null;
let markers = [];
let restaurants = [];
let selectedRestaurantIndex = -1;
let navigableRestaurants = [];

// Custom numbered marker icon
function createNumberedMarker(number) {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-pin">
            <div class="marker-number">${number}</div>
        </div>`,
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: [0, -40]
    });
}

// DOM elements
const searchInfo = document.getElementById('searchInfo');
const totalCount = document.getElementById('totalCount');
const geocodeStatus = document.getElementById('geocodeStatus');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const resultsList = document.getElementById('resultsList');

// Initialize map
function initMap() {
    console.log('initMap called, L available?', typeof L !== 'undefined');
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded!');
        return;
    }
    map = L.map('map', {
        zoomControl: true
    }).setView([48.2082, 16.3719], 13);
    
    // Light map tiles with good contrast
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
}

// Load cached geocode data
async function loadGeocodeCache() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['geocodeCache'], (result) => {
            resolve(result.geocodeCache || {});
        });
    });
}

// Save to geocode cache
async function saveToCache(address, coords) {
    const cache = await loadGeocodeCache();
    cache[address.toLowerCase().trim()] = coords;
    return new Promise((resolve) => {
        chrome.storage.local.set({ geocodeCache: cache }, resolve);
    });
}

// Geocode a single address via Nominatim
async function geocodeAddress(address) {
    console.log('Geocoding:', address);

    // Reformat address from "1050 Wien, Rainergasse 37" to "Rainergasse 37, Wien, Austria"
    let formattedAddress = address;
    const match = address.match(/^(\d{4})\s*Wien,\s*(.+)$/i);
    if (match) {
        const street = match[2].trim();
        formattedAddress = `${street}, Wien, Austria`;
        console.log('Reformatted to:', formattedAddress);
    } else {
        formattedAddress = address + ', Austria';
    }

    const query = encodeURIComponent(formattedAddress);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'FalterMapExtension/1.0'
            }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            console.error(`HTTP error: ${response.status} ${response.statusText}`);
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('Geocoding result:', data);

        if (data && data.length > 0) {
            const coords = {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
            console.log('Found coords:', coords);
            return coords;
        } else {
            console.warn('No results for:', address);
        }
    } catch (error) {
        console.error('Geocoding error for', address, ':', error);
    }

    return null;
}

// Geocode all restaurants with caching and rate limiting
async function geocodeRestaurants(restaurantList) {
    const cache = await loadGeocodeCache();
    const results = [];
    let needsGeocoding = [];
    
    // First pass: check cache
    for (const restaurant of restaurantList) {
        const cacheKey = restaurant.address.toLowerCase().trim();
        
        if (cache[cacheKey]) {
            results.push({
                ...restaurant,
                coords: cache[cacheKey],
                fromCache: true
            });
        } else {
            needsGeocoding.push(restaurant);
        }
    }
    
    // Update UI with cached results immediately
    const cachedCount = results.length;
    totalCount.textContent = restaurantList.length;
    
    if (cachedCount > 0) {
        geocodeStatus.textContent = `${cachedCount} cached`;
        geocodeStatus.className = 'status-value';
        updateResultsList(results);
        updateMapMarkers(results.filter(r => r.coords));
    }
    
    // Second pass: geocode remaining
    if (needsGeocoding.length > 0) {
        progressBar.style.display = 'block';
        geocodeStatus.className = 'status-value loading';
        
        for (let i = 0; i < needsGeocoding.length; i++) {
            const restaurant = needsGeocoding[i];
            
            geocodeStatus.textContent = `Geocoding ${cachedCount + i + 1}/${restaurantList.length}...`;
            progressFill.style.width = `${((cachedCount + i + 1) / restaurantList.length) * 100}%`;
            
            const coords = await geocodeAddress(restaurant.address);
            
            if (coords) {
                await saveToCache(restaurant.address, coords);
            }
            
            results.push({
                ...restaurant,
                coords: coords,
                fromCache: false
            });
            
            // Update UI progressively
            updateResultsList(results);
            updateMapMarkers(results.filter(r => r.coords));
            
            // Rate limit: 1 request per second
            if (i < needsGeocoding.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1100));
            }
        }
    }
    
    // Done
    const locatedCount = results.filter(r => r.coords).length;
    geocodeStatus.textContent = `${locatedCount}/${restaurantList.length} located`;
    geocodeStatus.className = 'status-value done';
    progressBar.style.display = 'none';
    
    return results;
}

// Update results list in sidebar
function updateResultsList(restaurantList) {
    resultsList.innerHTML = '';

    // Reset navigable restaurants
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
                // Remove active class from all items
                document.querySelectorAll('.result-item').forEach(el => {
                    el.classList.remove('active');
                    el.setAttribute('aria-selected', 'false');
                });
                item.classList.add('active');
                item.setAttribute('aria-selected', 'true');

                // Update selectedRestaurantIndex when clicking
                const navigableItems = Array.from(document.querySelectorAll('#resultsList .result-item:not(.no-coords)'));
                selectedRestaurantIndex = navigableItems.indexOf(item);

                // Pan to marker and open popup
                map.setView([restaurant.coords.lat, restaurant.coords.lng], 16);

                // Find and open the marker's popup
                const marker = markers.find(m => m.restaurantId === restaurant.id);
                if (marker) {
                    marker.openPopup();
                }
            });
        }

        resultsList.appendChild(item);
    });

    // Add ARIA role to container
    resultsList.setAttribute('role', 'listbox');
    resultsList.setAttribute('aria-label', 'Restaurant list');
}

// Update map markers
function updateMapMarkers(restaurantList) {
    // Clear existing markers
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    // Add new markers
    restaurantList.forEach((restaurant, index) => {
        if (!restaurant.coords) return;

        const marker = L.marker([restaurant.coords.lat, restaurant.coords.lng], {
            icon: createNumberedMarker(index + 1)
        })
            .addTo(map)
            .bindPopup(`
                <div class="popup-name">${escapeHtml(restaurant.name)}</div>
                <div class="popup-address">${escapeHtml(restaurant.address)}</div>
                <div class="popup-links">
                    <a href="${restaurant.url}" class="popup-link" data-url="${restaurant.url}">Falter</a>
                    <a href="https://www.google.com/maps?q=${restaurant.coords.lat},${restaurant.coords.lng}" class="popup-link" data-url="https://www.google.com/maps?q=${restaurant.coords.lat},${restaurant.coords.lng}">Google Maps</a>
                </div>
            `);
        
        marker.restaurantId = restaurant.id;
        markers.push(marker);
    });
    
    // Fit bounds if we have markers
    if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Show empty state
function showEmptyState() {
    document.getElementById('mapContainer').innerHTML = `
        <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <h2>No restaurants loaded yet</h2>
            <p>
                1. Go to <strong>falter.at/lokalfuehrer/suche</strong><br>
                2. Apply your filters<br>
                3. Click the red <strong>"Show all on Map"</strong> button<br>
                4. Then click this extension icon again
            </p>
        </div>
    `;
    
    searchInfo.textContent = 'Waiting for data...';
    totalCount.textContent = '0';
    geocodeStatus.textContent = '-';
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load data from storage and initialize
async function init() {
    console.log('Popup: Initializing...');
    
    try {
        // Load stored restaurants
        chrome.storage.local.get(['falterRestaurants', 'falterTimestamp', 'falterSearchUrl'], async (result) => {
            console.log('Popup: Storage result:', result);
            
            if (chrome.runtime.lastError) {
                console.error('Popup: Storage error:', chrome.runtime.lastError);
                showEmptyState();
                return;
            }
            
            if (!result || !result.falterRestaurants || result.falterRestaurants.length === 0) {
                console.log('Popup: No restaurants in storage');
                showEmptyState();
                return;
            }
            
            const storedRestaurants = result.falterRestaurants;
            const timestamp = result.falterTimestamp;
            
            console.log('Popup: Loaded', storedRestaurants.length, 'restaurants');
            
            // Check if data is fresh
            const age = Date.now() - (timestamp || 0);
            const minutes = Math.floor(age / 60000);
            
            if (minutes < 60) {
                searchInfo.textContent = `${storedRestaurants.length} restaurants (${minutes}m ago)`;
            } else if (minutes < 1440) {
                searchInfo.textContent = `${storedRestaurants.length} restaurants (${Math.floor(minutes/60)}h ago)`;
            } else {
                searchInfo.textContent = `${storedRestaurants.length} restaurants`;
            }
            
            totalCount.textContent = storedRestaurants.length;
            geocodeStatus.textContent = 'Starting...';
            
            // Initialize map
            initMap();
            
            // Start geocoding
            restaurants = await geocodeRestaurants(storedRestaurants);
        });
    } catch (error) {
        console.error('Popup: Init error:', error);
        showEmptyState();
    }
}

function handleKeyboardNavigation(event) {
    // Get all navigable restaurant items
    const items = document.querySelectorAll('#resultsList .result-item:not(.no-coords)');
    if (items.length === 0) return;

    switch(event.key) {
        case 'Escape':
            event.preventDefault();
            window.close(); // Close popup window
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

    // Get restaurant from navigableRestaurants
    const restaurant = navigableRestaurants[selectedRestaurantIndex];

    if (restaurant && restaurant.coords) {
        // Zoom map to selected restaurant
        map.setView([restaurant.coords.lat, restaurant.coords.lng], 16);

        // Open marker popup
        const marker = markers.find(m => m.restaurantId === restaurant.id);
        if (marker) {
            marker.openPopup();
        }
    }
}

// Attach keyboard listener
document.addEventListener('keydown', handleKeyboardNavigation);

// Handle link clicks to prevent popup from closing
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('popup-link')) {
        e.preventDefault();
        const url = e.target.getAttribute('data-url');
        if (url) {
            chrome.tabs.create({ url: url });
        }
    }
});

// Start
document.addEventListener('DOMContentLoaded', init);
