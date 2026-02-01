/**
 * Tests for geocoder.js
 * Tests address geocoding, caching, rate limiting, and error handling
 */

import { geocodeAddress, geocodeRestaurants } from '../modules/geocoder.js';
import { CONFIG } from '../modules/constants.js';
import { CacheManager } from '../modules/cache-utils.js';
import { assert, MockChrome, AsyncHelpers, initializeTestRunner, finalizeTestRunner } from './test-utils.js';

// Install chrome.storage mock
MockChrome.installStorageMock();

// Mock fetch API
let fetchMock = null;

function installFetchMock(responses = []) {
    let callCount = 0;
    fetchMock = {
        callCount: 0,
        responses: responses,
        lastUrl: null
    };

    window.fetch = async (url, options) => {
        fetchMock.callCount++;
        fetchMock.lastUrl = url;

        const response = responses[callCount] || responses[responses.length - 1];
        callCount++;

        if (response.error) {
            throw new Error(response.error);
        }

        return {
            ok: response.ok !== false,
            status: response.status || 200,
            json: async () => response.data || []
        };
    };
}

async function runTests() {
    initializeTestRunner('Geocoder Tests');

    // Clear cache before tests
    await CacheManager.clear();

    // Test 1: Address variation generation for Vienna addresses
    assert.info('\n--- Test 1: Address Variation Generation ---');
    installFetchMock([
        { ok: true, data: [{ lat: '48.2', lon: '16.3' }] }
    ]);

    const coords1 = await geocodeAddress('1010 Wien, Stephansplatz 1');
    assert.exists(coords1, 'Should geocode Vienna address');
    assert.equals(coords1?.lat, 48.2, 'Latitude should match');
    assert.equals(coords1?.lng, 16.3, 'Longitude should match');
    assert.isTrue(fetchMock.callCount > 0, 'Should call fetch API');

    // Test 2: Handle market stalls (simplified address)
    assert.info('\n--- Test 2: Market Stall Address Handling ---');
    installFetchMock([
        { ok: true, data: [{ lat: '48.21', lon: '16.38' }] }
    ]);

    const coords2 = await geocodeAddress('1020 Wien, Karmelitermarkt Stand 65');
    assert.exists(coords2, 'Should geocode market stall address');
    assert.exists(fetchMock.lastUrl, 'Should make API request');

    // Test 3: Failed geocoding returns null
    assert.info('\n--- Test 3: Failed Geocoding ---');
    installFetchMock([
        { ok: true, data: [] } // Empty results
    ]);

    const coords3 = await geocodeAddress('Invalid Address 99999');
    assert.equals(coords3, null, 'Should return null for failed geocoding');

    // Test 4: Network error handling
    assert.info('\n--- Test 4: Network Error Handling ---');
    installFetchMock([
        { error: 'Network error' }
    ]);

    const coords4 = await geocodeAddress('1010 Wien, Test 1');
    assert.equals(coords4, null, 'Should return null on network error');

    // Test 5: Rate limiting (429 status)
    assert.info('\n--- Test 5: Rate Limit Detection ---');
    installFetchMock([
        { ok: false, status: 429 }, // Rate limited on first variation
        { ok: true, data: [{ lat: '48.2', lon: '16.3' }] } // Second variation succeeds
    ]);

    const coords5 = await geocodeAddress('1010 Wien, Test 2');
    // Note: geocodeAddress tries multiple address variations
    assert.isTrue(fetchMock.callCount >= 2, 'Should retry after rate limit');
    assert.exists(coords5, 'Should eventually succeed');

    // Test 6: Batch geocoding with cache
    assert.info('\n--- Test 6: Batch Geocoding with Cache ---');
    await CacheManager.clear();

    // Pre-cache one address
    await CacheManager.save('1010 Wien, Cached Street 1', { lat: 48.5, lng: 16.5 });

    installFetchMock([
        { ok: true, data: [{ lat: '48.6', lon: '16.6' }] },
        { ok: true, data: [] } // Second one fails
    ]);

    const restaurants = [
        { id: '1', name: 'Test 1', address: '1010 Wien, Cached Street 1' },
        { id: '2', name: 'Test 2', address: '1020 Wien, New Street 2' },
        { id: '3', name: 'Test 3', address: '1030 Wien, Failed Street 3' }
    ];

    let progressCallbacks = 0;
    const results = await geocodeRestaurants(restaurants, (current, total, results) => {
        progressCallbacks++;
    });

    assert.arrayLength(results, 3, 'Should return all restaurants');
    assert.isTrue(progressCallbacks > 0, 'Should call progress callback');

    // Check cached result
    assert.exists(results[0].coords, 'Cached address should have coords');
    assert.equals(results[0].coords.lat, 48.5, 'Cached coords should match');
    assert.isTrue(results[0].fromCache === true, 'Should mark as from cache');

    // Check newly geocoded result
    assert.exists(results[1].coords, 'New address should be geocoded');
    assert.equals(results[1].coords.lat, 48.6, 'New coords should match');

    // Check failed result
    assert.equals(results[2].coords, null, 'Failed address should have null coords');

    // Test 7: Cache persistence
    assert.info('\n--- Test 7: Cache Persistence ---');
    const cache = await CacheManager.load();
    const cacheKey = '1020 wien, new street 2';
    assert.exists(cache[cacheKey], 'Newly geocoded address should be cached');
    assert.equals(cache[cacheKey].coords.lat, 48.6, 'Cached coords should match');

    // ===== NEW TESTS FOR STRUCTURED QUERY API =====

    // Test 8: Tier 1 - Amenity Name (Restaurant Name)
    assert.info('\n--- Test 8: Tier 1 - Amenity Name (80/20 Solution) ---');
    installFetchMock([
        { ok: true, data: [{ lat: '47.7981', lon: '13.0465' }] }
    ]);

    const coords8 = await geocodeAddress('5020 Salzburg, Getreidegasse 9', 'Stiftskeller St. Peter');
    assert.exists(coords8, 'Should geocode with restaurant name');
    assert.isTrue(fetchMock.lastUrl.includes('amenity=Stiftskeller'), 'Should use amenity parameter');
    assert.isTrue(fetchMock.lastUrl.includes('city=Salzburg'), 'Should use city parameter');
    assert.isTrue(fetchMock.lastUrl.includes('postalcode=5020'), 'Should use postalcode parameter');

    // Test 9: Tier 2 - Street Address (Fallback)
    assert.info('\n--- Test 9: Tier 2 - Street Address (Structured Query) ---');
    installFetchMock([
        { ok: true, data: [] }, // Tier 1 fails (no amenity found)
        { ok: true, data: [{ lat: '48.3059', lon: '14.2862' }] } // Tier 2 succeeds
    ]);

    const coords9 = await geocodeAddress('4020 Linz, Hauptplatz 1', 'Unknown Restaurant');
    assert.exists(coords9, 'Should fallback to street address');
    assert.isTrue(fetchMock.callCount >= 2, 'Should try multiple tiers');

    // Test 10: Multi-Word Cities
    assert.info('\n--- Test 10: Multi-Word City Names ---');
    installFetchMock([
        { ok: true, data: [{ lat: '47.9119', lon: '16.6966' }] }
    ]);

    const coords10 = await geocodeAddress('7083 Purbach am Neusiedler See, Hauptgasse 64', 'Gut Purbach');
    assert.exists(coords10, 'Should handle multi-word city names');
    assert.isTrue(fetchMock.lastUrl.includes('Purbach'), 'Should parse multi-word city');

    // Test 11: Street Name Cleaning (Tier 5)
    assert.info('\n--- Test 11: Tier 5 - Street Name Cleaning ---');
    installFetchMock([
        { ok: true, data: [] }, // Tier 1 fails
        { ok: true, data: [] }, // Tier 2 fails (original street)
        { ok: true, data: [] }, // Tier 3 fails
        { ok: true, data: [] }, // Tier 4 fails (restaurant)
        { ok: true, data: [] }, // Tier 4 fails (cafe)
        { ok: true, data: [] }, // Tier 4 fails (bar)
        { ok: true, data: [] }, // Tier 4 fails (fast_food)
        { ok: true, data: [] }, // Tier 4 fails (pub)
        { ok: true, data: [{ lat: '48.3', lon: '15.6' }] } // Tier 5 succeeds (cleaned street)
    ]);

    const coords11 = await geocodeAddress('3420 Klosterneuburg, Strombad Donaulände 15', 'Test Restaurant');
    assert.exists(coords11, 'Should clean street name and succeed');
    // Tier 5 should try "Donaulände 15" instead of "Strombad Donaulände 15"

    // Test 12: Parenthesized Location Descriptors
    assert.info('\n--- Test 12: Parenthesized Location Descriptors ---');
    installFetchMock([
        { ok: true, data: [] }, // Tier 1 fails
        { ok: true, data: [] }, // Tier 2 fails
        { ok: true, data: [] }, // Tier 3 fails
        { ok: true, data: [] }, // Tier 4 fails (restaurant)
        { ok: true, data: [] }, // Tier 4 fails (cafe)
        { ok: true, data: [] }, // Tier 4 fails (bar)
        { ok: true, data: [] }, // Tier 4 fails (fast_food)
        { ok: true, data: [] }, // Tier 4 fails (pub)
        { ok: true, data: [{ lat: '47.8455', lon: '16.5249' }] } // Tier 5 succeeds
    ]);

    const coords12 = await geocodeAddress('7121 Weiden am See, (Göschl Tourismusprojekte – Seepark)', 'Restaurant Zur Blauen Gans');
    assert.exists(coords12, 'Should clean parenthesized descriptors');
    // Tier 5 should remove parentheses and try cleaned version

    // Test 13: Building/Block Descriptors
    assert.info('\n--- Test 13: Building/Block Descriptor Cleaning ---');
    installFetchMock([
        { ok: true, data: [] }, // Tier 1 fails
        { ok: true, data: [] }, // Tier 2 fails (original street)
        { ok: true, data: [] }, // Tier 3 fails
        { ok: true, data: [] }, // Tier 4 restaurant
        { ok: true, data: [] }, // Tier 4 cafe
        { ok: true, data: [] }, // Tier 4 bar
        { ok: true, data: [] }, // Tier 4 fast_food
        { ok: true, data: [] }, // Tier 4 pub
        { ok: true, data: [{ lat: '47.85', lon: '16.52' }] } // Tier 5 succeeds
    ]);

    const coords13 = await geocodeAddress('7011 Siegendorf, Trausdorfer Straße II. Block VI', 'La Rosa Blu');
    assert.exists(coords13, 'Should clean Block/Building descriptors');
    // Tier 5 should try "Trausdorfer Straße" instead of "Trausdorfer Straße II. Block VI"

    // Test 14: Free-Form Fallback (Tier 6)
    assert.info('\n--- Test 14: Tier 6 - Free-Form Fallback ---');
    installFetchMock([
        { ok: true, data: [] }, // Tier 1 fails
        { ok: true, data: [] }, // Tier 2 fails
        { ok: true, data: [] }, // Tier 3 fails
        { ok: true, data: [] }, // Tier 4 restaurant
        { ok: true, data: [] }, // Tier 4 cafe
        { ok: true, data: [] }, // Tier 4 bar
        { ok: true, data: [] }, // Tier 4 fast_food
        { ok: true, data: [] }, // Tier 4 pub
        { ok: true, data: [] }, // Tier 5 fails (no cleaning applied)
        { ok: true, data: [{ lat: '46.62', lon: '14.31' }] } // Tier 6 free-form succeeds
    ]);

    const coords14 = await geocodeAddress('9020 Klagenfurt, Complex Address 123', 'Test Café');
    assert.exists(coords14, 'Should fallback to free-form query');
    assert.isTrue(fetchMock.callCount >= 10, 'Should exhaust structured queries before free-form');

    // Test 15: City-Level Approximate (Tier 7)
    assert.info('\n--- Test 15: Tier 7 - City-Level Approximate (Last Resort) ---');
    installFetchMock([
        { ok: true, data: [] }, // Tier 1 fails
        { ok: true, data: [] }, // Tier 2 fails
        { ok: true, data: [] }, // Tier 3 fails
        { ok: true, data: [] }, // Tier 4 restaurant
        { ok: true, data: [] }, // Tier 4 cafe
        { ok: true, data: [] }, // Tier 4 bar
        { ok: true, data: [] }, // Tier 4 fast_food
        { ok: true, data: [] }, // Tier 4 pub
        { ok: true, data: [] }, // Tier 5 fails
        { ok: true, data: [] }, // Tier 6 free-form fails
        { ok: true, data: [{ lat: '47.50', lon: '9.75' }] } // Tier 7 city-level succeeds
    ]);

    const coords15 = await geocodeAddress('6900 Bregenz, Nonexistent Street 999', null);
    assert.exists(coords15, 'Should fallback to city-level as last resort');
    assert.equals(coords15.approximate, true, 'Should flag as approximate');

    // Test 16: Complete Failure (All Tiers Fail)
    assert.info('\n--- Test 16: Complete Failure (All Tiers Exhausted) ---');
    installFetchMock([
        { ok: true, data: [] }, // All tiers return empty
        { ok: true, data: [] },
        { ok: true, data: [] },
        { ok: true, data: [] },
        { ok: true, data: [] },
        { ok: true, data: [] },
        { ok: true, data: [] },
        { ok: true, data: [] },
        { ok: true, data: [] },
        { ok: true, data: [] },
        { ok: true, data: [] }
    ]);

    const coords16 = await geocodeAddress('99999 Invalid City, Invalid Street 999', null);
    assert.equals(coords16, null, 'Should return null when all tiers fail');

    // Test 17: Hyphenated City Names
    assert.info('\n--- Test 17: Hyphenated City Names ---');
    installFetchMock([
        { ok: true, data: [{ lat: '47.16', lon: '16.43' }] }
    ]);

    const coords17 = await geocodeAddress('7474 Deutsch Schützen-Eisenberg, Am Ratschen 5', 'Ratschens Restaurant');
    assert.exists(coords17, 'Should handle hyphenated city names');
    assert.isTrue(fetchMock.lastUrl.includes('Deutsch'), 'Should parse hyphenated city');

    finalizeTestRunner();
}

// Run tests when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTests);
} else {
    runTests();
}
