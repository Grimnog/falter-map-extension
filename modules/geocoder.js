// Geocoding utilities for address to coordinates conversion

import { CONFIG } from './constants.js';
import { CacheManager } from './cache-utils.js';
import { ErrorHandler } from './error-handler.js';

/**
 * Parse address into components for structured queries
 * @param {string} address - Full address string
 * @returns {Object} { zip, city, street } or null if parsing fails
 */
function parseAddress(address) {
    // Pattern: "{ZIP} {City}, {Street}"
    // Examples: "3420 Klosterneuburg, Donaulände 15"
    //           "8010 Graz, Heinrichstraße 56"
    //           "1040 Wien, Rechte Wienzeile 1"
    const match = address.match(/^(\d{4})\s+([^,]+),\s*(.+)$/);

    if (match) {
        return {
            zip: match[1],
            city: match[2].trim(),
            street: match[3].trim()
        };
    }

    console.warn('Could not parse address:', address);
    return null;
}

/**
 * Clean street name by removing location prefixes
 * @param {string} street - Street name to clean
 * @returns {string} Cleaned street name
 */
function cleanStreetName(street) {
    // Remove location prefixes: "Strombad Donaulände 15" → "Donaulände 15"
    const cleaned = street.replace(/^(Strombad|Nord|Süd|Ost|West)\s+/i, '');

    // Note: Don't drop "Stand" here - try full name first in query
    // Market stalls like "Vorgartenmarkt Stand 19" need special handling

    return cleaned.trim();
}

/**
 * Build structured query URL for Nominatim
 * @param {Object} params - Query parameters
 * @returns {string} Full URL with parameters
 */
function buildStructuredQueryURL(params) {
    const queryParams = new URLSearchParams({
        ...params,
        country: 'Austria',
        format: 'json',
        limit: 1
    });

    return `${CONFIG.NOMINATIM.API_URL}?${queryParams}`;
}

/**
 * Try a single geocoding query
 * @param {string} url - Nominatim API URL
 * @param {string} description - Description of query for logging
 * @returns {Promise<Object|null>} Coordinates {lat, lng} or null if failed
 */
async function tryGeocodingQuery(url, description) {
    console.log(`Trying: ${description}`);

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
            return null; // Retry will happen in fallback chain
        }

        if (!response.ok) {
            console.error(`HTTP error: ${response.status}`);
            return null;
        }

        const data = await response.json();

        if (data && data.length > 0) {
            const coords = {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
            console.log('✓ Found coords:', coords, 'using:', description);
            return coords;
        }
    } catch (error) {
        console.error('Geocoding error for', description, ':', error);
    }

    return null;
}

/**
 * Geocode a single address using OpenStreetMap Nominatim API with structured queries
 * Implements multi-tier fallback strategy for maximum success rate
 *
 * @param {string} address - Full address to geocode
 * @param {string} restaurantName - Restaurant name from Falter (optional but recommended)
 * @returns {Promise<Object|null>} Coordinates {lat, lng} or null if all attempts failed
 */
export async function geocodeAddress(address, restaurantName = null) {
    console.log('Geocoding:', address, restaurantName ? `(${restaurantName})` : '');

    const parsed = parseAddress(address);

    if (!parsed) {
        // Fallback: try free-form query for unparseable addresses
        const query = encodeURIComponent(`${address}, Austria`);
        const url = `${CONFIG.NOMINATIM.API_URL}?format=json&q=${query}&limit=1`;
        return await tryGeocodingQuery(url, 'free-form (unparseable address)');
    }

    const { zip, city, street } = parsed;

    // Tier 1: Restaurant name (PRIMARY - 80/20 solution! ~70-80% success)
    if (restaurantName) {
        const url = buildStructuredQueryURL({
            amenity: restaurantName,
            city: city,
            postalcode: zip
        });
        const result = await tryGeocodingQuery(url, `Tier 1: amenity="${restaurantName}"`);
        if (result) return result;

        // Small delay before next tier
        await new Promise(resolve => setTimeout(resolve, CONFIG.NOMINATIM.RETRY_DELAY_MS));
    }

    // Tier 2: Street address (reliable fallback for new/untagged restaurants)
    const url2 = buildStructuredQueryURL({
        street: street,
        city: city,
        postalcode: zip
    });
    const result2 = await tryGeocodingQuery(url2, `Tier 2: street="${street}"`);
    if (result2) return result2;

    await new Promise(resolve => setTimeout(resolve, CONFIG.NOMINATIM.RETRY_DELAY_MS));

    // Tier 3: Combined street + amenity name (disambiguation)
    if (restaurantName) {
        const url3 = buildStructuredQueryURL({
            street: street,
            amenity: restaurantName,
            city: city,
            postalcode: zip
        });
        const result3 = await tryGeocodingQuery(url3, `Tier 3: street + amenity`);
        if (result3) return result3;

        await new Promise(resolve => setTimeout(resolve, CONFIG.NOMINATIM.RETRY_DELAY_MS));
    }

    // Tier 4: Try amenity types (restaurant, cafe, bar, fast_food)
    const amenityTypes = ['restaurant', 'cafe', 'bar', 'fast_food', 'pub'];
    for (const type of amenityTypes) {
        const url4 = buildStructuredQueryURL({
            street: street,
            amenity: type,
            city: city,
            postalcode: zip
        });
        const result4 = await tryGeocodingQuery(url4, `Tier 4: amenity="${type}"`);
        if (result4) return result4;

        await new Promise(resolve => setTimeout(resolve, CONFIG.NOMINATIM.RETRY_DELAY_MS));
    }

    // Tier 5: Cleaned street name (drop prefixes like "Strombad")
    const cleanedStreet = cleanStreetName(street);
    if (cleanedStreet !== street) {
        const url5 = buildStructuredQueryURL({
            street: cleanedStreet,
            city: city,
            postalcode: zip
        });
        const result5 = await tryGeocodingQuery(url5, `Tier 5: cleaned street="${cleanedStreet}"`);
        if (result5) return result5;

        await new Promise(resolve => setTimeout(resolve, CONFIG.NOMINATIM.RETRY_DELAY_MS));
    }

    // Tier 6: City-level only (approximate - last resort)
    const url6 = buildStructuredQueryURL({
        city: city,
        postalcode: zip
    });
    const result6 = await tryGeocodingQuery(url6, `Tier 6: city-level (approximate)`);
    if (result6) {
        result6.approximate = true; // Flag for user warning
        console.warn('⚠ Approximate location (city-level) for:', address);
        return result6;
    }

    await new Promise(resolve => setTimeout(resolve, CONFIG.NOMINATIM.RETRY_DELAY_MS));

    // Tier 7: Free-form query (absolute last resort)
    const query7 = encodeURIComponent(`${address}, Austria`);
    const url7 = `${CONFIG.NOMINATIM.API_URL}?format=json&q=${query7}&limit=1`;
    const result7 = await tryGeocodingQuery(url7, `Tier 7: free-form fallback`);
    if (result7) return result7;

    console.warn('✗ No results for any variation of:', address);
    return null;
}

/**
 * Geocode a list of restaurants with caching and rate limiting
 * @param {Array} restaurantList - Array of restaurant objects with name and address properties
 * @param {Function} progressCallback - Optional callback(current, total, results)
 * @returns {Promise<Array>} Array of restaurants with coords property added
 */
export async function geocodeRestaurants(restaurantList, progressCallback) {
    // Clean expired cache entries just-in-time (only when extension is used)
    await CacheManager.cleanExpired().catch(err => {
        console.error('Cache cleanup error:', err);
    });

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

            // Pass restaurant name to geocoder (CRITICAL for Tier 1 optimization!)
            const coords = await geocodeAddress(restaurant.address, restaurant.name);

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
