// Geocoding utilities for address to coordinates conversion

import { CONFIG } from './constants.js';
import { CacheManager } from './cache-utils.js';
import { ErrorHandler } from './error-handler.js';

// ============================================
// CONSTANTS & PATTERNS
// ============================================

const PATTERNS = {
    // Address format: "1040 Wien, Wiedner Hauptstraße 15"
    address: /^(\d{4})\s+([^,]+),\s*(.+)$/,

    // Street cleaning patterns
    locationPrefix: /^(Strombad|Nord|Süd|Ost|West|Alt|Neu)\s+/i,
    parenthesized: /\s*\([^)]*\)/g,
    blockDescriptor: /\b(Block|Gebäude|Halle|Stand|Standplatz|Trakt|Sektor)\s+[IVX0-9A-Za-z]+/gi,
    romanNumeral: /\b[IVX]+\.\s+/g,
    multipleSpaces: /\s+/g
};

// Amenity types to try when restaurant name fails
const AMENITY_TYPES = ['restaurant', 'cafe', 'bar', 'fast_food', 'pub'];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parse address into components for structured queries
 * @param {string} address - Full address string
 * @returns {Object} { zip, city, street } or null if parsing fails
 */
function parseAddress(address) {
    const match = address.match(PATTERNS.address);

    if (match) {
        return {
            zip: match[1],
            city: match[2].trim(),
            street: match[3].trim()
        };
    }

    return null;
}

/**
 * Clean street name by removing common descriptors that confuse geocoding
 * @param {string} street - Street name to clean
 * @returns {string} Cleaned street name
 */
function cleanStreetName(street) {
    return street
        .replace(PATTERNS.locationPrefix, '')      // Remove "Strombad", "Nord", etc.
        .replace(PATTERNS.parenthesized, '')       // Remove "(Seepark)", etc.
        .replace(PATTERNS.blockDescriptor, '')     // Remove "Block VI", "Stand 19", etc.
        .replace(PATTERNS.romanNumeral, '')        // Remove "II.", "III.", etc.
        .replace(PATTERNS.multipleSpaces, ' ')     // Clean up spaces
        .trim();
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
 * Build free-form query URL for Nominatim
 * @param {string} query - Free-form search query
 * @returns {string} Full URL
 */
function buildFreeFormQueryURL(query) {
    return `${CONFIG.NOMINATIM.API_URL}?format=json&q=${encodeURIComponent(query)}&limit=1`;
}

/** Rate limit delay between geocoding attempts */
const delay = () => new Promise(resolve => setTimeout(resolve, CONFIG.NOMINATIM.RETRY_DELAY_MS));

/**
 * Try a structured geocoding query with common parameters
 * @param {Object} params - Query params (will add city and postalcode)
 * @param {string} city - City name
 * @param {string} zip - Postal code
 * @param {string} description - Description for logging
 * @returns {Promise<Object|null>} Coordinates or null
 */
async function tryStructuredQuery(params, city, zip, description) {
    const url = buildStructuredQueryURL({ ...params, city, postalcode: zip });
    return tryGeocodingQuery(url, description);
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
    const parsed = parseAddress(address);

    // Fallback for unparseable addresses
    if (!parsed) {
        return tryGeocodingQuery(buildFreeFormQueryURL(`${address}, Austria`), 'free-form (unparseable)');
    }

    const { zip, city, street } = parsed;
    let coords;

    // Tier 1: Restaurant name (PRIMARY - ~70-80% success)
    if (restaurantName) {
        coords = await tryStructuredQuery({ amenity: restaurantName }, city, zip, `Tier 1: amenity="${restaurantName}"`);
        if (coords) return coords;
        await delay();
    }

    // Tier 2: Street address
    coords = await tryStructuredQuery({ street }, city, zip, `Tier 2: street="${street}"`);
    if (coords) return coords;
    await delay();

    // Tier 3: Combined street + amenity
    if (restaurantName) {
        coords = await tryStructuredQuery({ street, amenity: restaurantName }, city, zip, 'Tier 3: street + amenity');
        if (coords) return coords;
        await delay();
    }

    // Tier 4: Try amenity types (restaurant, cafe, bar, etc.)
    for (const amenityType of AMENITY_TYPES) {
        coords = await tryStructuredQuery({ street, amenity: amenityType }, city, zip, `Tier 4: amenity="${amenityType}"`);
        if (coords) return coords;
        await delay();
    }

    // Tier 5: Cleaned street name (remove prefixes like "Strombad")
    const cleanedStreet = cleanStreetName(street);
    if (cleanedStreet !== street) {
        coords = await tryStructuredQuery({ street: cleanedStreet }, city, zip, `Tier 5: cleaned="${cleanedStreet}"`);
        if (coords) return coords;
        await delay();
    }

    // Tier 6: Free-form query
    coords = await tryGeocodingQuery(buildFreeFormQueryURL(`${address}, Austria`), 'Tier 6: free-form');
    if (coords) return coords;
    await delay();

    // Tier 7: City-level only (approximate - last resort)
    coords = await tryStructuredQuery({}, city, zip, 'Tier 7: city-level (approximate)');
    if (coords) {
        coords.approximate = true;
        return coords;
    }

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
        const cacheKey = CacheManager.normalizeKey(restaurant.address);

        if (cache[cacheKey]) {
            const cached = cache[cacheKey];
            results.push({
                ...restaurant,
                coords: cached.coords,
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
