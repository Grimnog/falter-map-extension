// Background service worker for Falter Map Extension
import { CacheManager } from './modules/cache-utils.js';
import { CONFIG } from './modules/constants.js';

// Geocode a single address
async function geocodeAddress(address) {
    const query = encodeURIComponent(address + ', Austria');
    const url = `${CONFIG.NOMINATIM.API_URL}?format=json&q=${query}&limit=1`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': CONFIG.NOMINATIM.USER_AGENT
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                displayName: data[0].display_name
            };
        }
    } catch (error) {
        console.error('Geocoding error:', error);
    }

    return null;
}

// Geocode multiple addresses with rate limiting and caching
async function geocodeRestaurants(restaurants, sendProgress) {
    const cache = await CacheManager.load();
    const results = [];
    let geocodedCount = 0;
    let cachedCount = 0;

    for (let i = 0; i < restaurants.length; i++) {
        const restaurant = restaurants[i];
        const cacheKey = restaurant.address.toLowerCase().trim();

        let coords = null;

        // Check cache first
        if (cache[cacheKey]) {
            coords = cache[cacheKey].coords || cache[cacheKey]; // Support both formats
            cachedCount++;
        } else {
            // Geocode with rate limiting
            coords = await geocodeAddress(restaurant.address);

            if (coords) {
                await CacheManager.save(restaurant.address, coords);
                geocodedCount++;
            }

            // Wait before next request (only if we made an API call and have more to do)
            if (i < restaurants.length - 1) {
                // Check if next one is cached
                const nextCacheKey = restaurants[i + 1].address.toLowerCase().trim();
                if (!cache[nextCacheKey]) {
                    await new Promise(resolve => setTimeout(resolve, CONFIG.NOMINATIM.RATE_LIMIT_MS));
                }
            }
        }

        results.push({
            ...restaurant,
            coords: coords
        });

        // Send progress update
        if (sendProgress) {
            sendProgress({
                current: i + 1,
                total: restaurants.length,
                cached: cachedCount,
                geocoded: geocodedCount
            });
        }
    }

    return results;
}

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'openMap') {
        // Store restaurants data - popup will read it
        chrome.storage.local.set({
            falterRestaurants: message.restaurants,
            falterTimestamp: Date.now()
        });

        return true;
    }

    if (message.action === 'geocodeRestaurants') {
        // Handle geocoding request from popup
        const restaurants = message.restaurants;

        geocodeRestaurants(restaurants, null)
            .then(results => {
                sendResponse({ success: true, results });
            })
            .catch(error => {
                sendResponse({ success: false, error: error.message });
            });

        return true; // Keep channel open for async response
    }

    if (message.action === 'geocodeSingle') {
        geocodeAddress(message.address)
            .then(coords => {
                sendResponse({ success: true, coords });
            })
            .catch(error => {
                sendResponse({ success: false, error: error.message });
            });

        return true;
    }

    if (message.action === 'clearCache') {
        CacheManager.clear()
            .then(() => {
                sendResponse({ success: true });
            })
            .catch(error => {
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }

    if (message.action === 'getCacheStats') {
        CacheManager.getStats()
            .then(stats => {
                sendResponse({
                    success: true,
                    count: stats.count
                });
            })
            .catch(error => {
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }
});

// Log when extension loads
console.log('Falter Map Extension background worker loaded');
