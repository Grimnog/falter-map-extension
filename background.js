// Background service worker for Falter Map Extension
// Handles geocoding with caching to avoid rate limits

// Geocode cache storage key
const GEOCODE_CACHE_KEY = 'geocodeCache';

// Load geocode cache from storage
async function loadGeocodeCache() {
    return new Promise((resolve) => {
        chrome.storage.local.get([GEOCODE_CACHE_KEY], (result) => {
            resolve(result[GEOCODE_CACHE_KEY] || {});
        });
    });
}

// Save geocode cache to storage
async function saveGeocodeCache(cache) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ [GEOCODE_CACHE_KEY]: cache }, resolve);
    });
}

// Geocode a single address
async function geocodeAddress(address) {
    const query = encodeURIComponent(address + ', Austria');
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'FalterMapExtension/1.0'
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
    const cache = await loadGeocodeCache();
    const results = [];
    let geocodedCount = 0;
    let cachedCount = 0;
    
    for (let i = 0; i < restaurants.length; i++) {
        const restaurant = restaurants[i];
        const cacheKey = restaurant.address.toLowerCase().trim();
        
        let coords = null;
        
        // Check cache first
        if (cache[cacheKey]) {
            coords = cache[cacheKey];
            cachedCount++;
        } else {
            // Geocode with rate limiting (1 request per second for Nominatim)
            coords = await geocodeAddress(restaurant.address);
            
            if (coords) {
                cache[cacheKey] = coords;
                geocodedCount++;
            }
            
            // Wait before next request (only if we made an API call and have more to do)
            if (i < restaurants.length - 1) {
                // Check if next one is cached
                const nextCacheKey = restaurants[i + 1].address.toLowerCase().trim();
                if (!cache[nextCacheKey]) {
                    await new Promise(resolve => setTimeout(resolve, 1100));
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
    
    // Save updated cache
    await saveGeocodeCache(cache);
    
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
        
        // Can't programmatically open popup, but data is ready
        return true;
    }
    
    if (message.action === 'geocodeRestaurants') {
        // Handle geocoding request from popup
        const restaurants = message.restaurants;
        
        // Use a port for streaming progress
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
        chrome.storage.local.remove([GEOCODE_CACHE_KEY], () => {
            sendResponse({ success: true });
        });
        return true;
    }
    
    if (message.action === 'getCacheStats') {
        loadGeocodeCache().then(cache => {
            sendResponse({ 
                success: true, 
                count: Object.keys(cache).length 
            });
        });
        return true;
    }
});

// Log when extension loads
console.log('Falter Map Extension background worker loaded');
