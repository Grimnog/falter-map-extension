// Geocoding utilities for address to coordinates conversion

import { CONFIG } from './constants.js';
import { CacheManager } from './cache-utils.js';
import { ErrorHandler } from './error-handler.js';

/**
 * Geocode a single address using OpenStreetMap Nominatim API
 * Tries multiple address format variations for Vienna addresses
 * @param {string} address - Address to geocode
 * @returns {Promise<Object|null>} Coordinates {lat, lng} or null if failed
 */
export async function geocodeAddress(address) {
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
        const url = `${CONFIG.NOMINATIM.API_URL}?format=json&q=${query}&limit=1`;

        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': CONFIG.NOMINATIM.USER_AGENT
                }
            });

            // Handle rate limiting (429 Too Many Requests)
            if (response.status === 429) {
                console.warn('Rate limit hit, waiting...');
                ErrorHandler.showRateLimitError(CONFIG.NOMINATIM.RATE_LIMIT_MS / 1000);
                await new Promise(resolve => setTimeout(resolve, CONFIG.NOMINATIM.RATE_LIMIT_MS));
                continue;
            }

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
            // Network errors are silently retried with other variations
            // Only show error if all variations fail (handled in geocodeRestaurants)
        }

        // Small delay between attempts to respect rate limits
        if (i < addressVariations.length - 1) {
            await new Promise(resolve => setTimeout(resolve, CONFIG.NOMINATIM.RETRY_DELAY_MS));
        }
    }

    console.warn('No results for any variation of:', address);
    return null;
}

/**
 * Geocode a list of restaurants with caching and rate limiting
 * @param {Array} restaurantList - Array of restaurant objects with address property
 * @param {Function} progressCallback - Optional callback(current, total, results)
 * @returns {Promise<Array>} Array of restaurants with coords property added
 */
export async function geocodeRestaurants(restaurantList, progressCallback) {
    const cache = await CacheManager.load();
    const results = [];
    let needsGeocoding = [];

    // Separate cached from uncached
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

    // Report cached results
    if (cachedCount > 0 && progressCallback) {
        progressCallback(cachedCount, restaurantList.length, results);
    }

    // Geocode uncached addresses with rate limiting
    if (needsGeocoding.length > 0) {
        for (let i = 0; i < needsGeocoding.length; i++) {
            const restaurant = needsGeocoding[i];

            if (progressCallback) {
                progressCallback(cachedCount + i + 1, restaurantList.length, results);
            }

            const coords = await geocodeAddress(restaurant.address);

            if (coords) {
                await CacheManager.save(restaurant.address, coords);
            }

            results.push({
                ...restaurant,
                coords: coords,
                fromCache: false
            });

            if (progressCallback) {
                progressCallback(cachedCount + i + 1, restaurantList.length, results);
            }

            // Rate limiting: wait before next request
            if (i < needsGeocoding.length - 1) {
                await new Promise(resolve => setTimeout(resolve, CONFIG.NOMINATIM.RATE_LIMIT_MS));
            }
        }
    }

    // Show error summary if addresses failed to geocode
    const failedCount = results.filter(r => !r.coords).length;
    if (failedCount > 0) {
        ErrorHandler.showGeocodingError(failedCount, results.length);
    }

    return results;
}
