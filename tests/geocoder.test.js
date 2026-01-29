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

    finalizeTestRunner();
}

// Run tests when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTests);
} else {
    runTests();
}
