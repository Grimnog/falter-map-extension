/**
 * Tests for cache-utils.js
 * Tests caching functionality, TTL migration, and storage operations
 */

import { CacheManager } from '../modules/cache-utils.js';
import { CONFIG } from '../modules/constants.js';
import { assert, MockChrome, initializeTestRunner, finalizeTestRunner } from './test-utils.js';

// Install chrome.storage mock
MockChrome.installStorageMock();

async function runTests() {
    try {
        initializeTestRunner('Cache Manager Tests');

        // Clear cache before tests
        console.log('Clearing cache before tests...');
        await CacheManager.clear();

        // Test 1: Load empty cache
        console.log('Starting Test 1...');
        assert.info('\n--- Test 1: Load Empty Cache ---');
        let emptyCache = await CacheManager.load();
        assert.equals(Object.keys(emptyCache).length, 0, 'Empty cache should return an empty object');

        // Test 2: Save and retrieve a single entry
        console.log('Starting Test 2...');
        assert.info('\n--- Test 2: Save and Retrieve Single Entry ---');
        const testAddress1 = '1010 wien, teststrasse 1';
        const testCoords1 = { lat: 48.2, lng: 16.3 };
        await CacheManager.save(testAddress1, testCoords1);
        let loadedCache1 = await CacheManager.load();
        assert.equals(Object.keys(loadedCache1).length, 1, 'Cache should contain one entry after saving');
        assert.equals(loadedCache1[testAddress1.toLowerCase().trim()].coords.lat, testCoords1.lat, 'Saved latitude should match');
        assert.equals(loadedCache1[testAddress1.toLowerCase().trim()].coords.lng, testCoords1.lng, 'Saved longitude should match');

        // Test 3: Overwrite an existing entry
        console.log('Starting Test 3...');
        assert.info('\n--- Test 3: Overwrite Existing Entry ---');
        const newCoords1 = { lat: 48.3, lng: 16.4 };
        await CacheManager.save(testAddress1, newCoords1);
        let loadedCache2 = await CacheManager.load();
        assert.equals(Object.keys(loadedCache2).length, 1, 'Cache should still contain one entry after overwriting');
        assert.equals(loadedCache2[testAddress1.toLowerCase().trim()].coords.lat, newCoords1.lat, 'Overwritten latitude should match');

        // Test 4: Save multiple entries and check count
        console.log('Starting Test 4...');
        assert.info('\n--- Test 4: Save Multiple Entries ---');
        const testAddress2 = '1020 wien, testgasse 2';
        const testCoords2 = { lat: 48.4, lng: 16.5 };
        await CacheManager.save(testAddress2, testCoords2);
        let loadedCache3 = await CacheManager.load();
        assert.equals(Object.keys(loadedCache3).length, 2, 'Cache should contain two entries after saving a second unique address');

        // Test 5: Get cache stats
        console.log('Starting Test 5...');
        assert.info('\n--- Test 5: Get Cache Stats ---');
        const stats = await CacheManager.getStats();
        assert.equals(stats.count, 2, 'Stats count should be 2');
        assert.exists(stats.sizeKB, 'Stats should have sizeKB');

        // Test 6: Clear all entries
        console.log('Starting Test 6...');
        assert.info('\n--- Test 6: Clear All Entries ---');
        await CacheManager.clear();
        let loadedCache4 = await CacheManager.load();
        assert.equals(Object.keys(loadedCache4).length, 0, 'Cache should be empty after clearing');

        // Test 7: TTL migration (simulated old format)
        console.log('Starting Test 7...');
        assert.info('\n--- Test 7: TTL Migration from Old Format ---');
        const oldFormatAddress = 'old strasse 1';
        // Directly set an entry without expiresAt (simulating old format)
        await new Promise(r => chrome.storage.local.set({
            [CONFIG.CACHE.KEY]: {
                [oldFormatAddress]: { lat: 48.0, lng: 16.0 }
            }
        }, r));
        let migratedCache = await CacheManager.load();
        assert.exists(migratedCache[oldFormatAddress], 'Old format entry should be migrated');
        assert.exists(migratedCache[oldFormatAddress].expiresAt, 'Migrated entry should have expiresAt');
        assert.equals(migratedCache[oldFormatAddress].coords.lat, 48.0, 'Migrated coords lat should be correct');

        // Test 8: Test expired entry filtering
        console.log('Starting Test 8...');
        assert.info('\n--- Test 8: Expired Entry Filtering ---');
        const expiredAddress = 'expired strasse 1';
        const now = Date.now();
        // Manually set an expired entry
        await CacheManager.clear();
        await new Promise(r => chrome.storage.local.set({
            [CONFIG.CACHE.KEY]: {
                [expiredAddress]: {
                    coords: { lat: 48.1, lng: 16.1 },
                    cachedAt: now - (CONFIG.CACHE.TTL_MS * 2),
                    expiresAt: now - (CONFIG.CACHE.TTL_MS / 2)
                }
            }
        }, r));
        let filteredCache = await CacheManager.load();
        assert.equals(filteredCache[expiredAddress], undefined, 'Expired entry should be filtered out during load');

        console.log('All tests complete, finalizing...');
        finalizeTestRunner();
    } catch (error) {
        console.error('Cache Manager test error:', error);
        assert.fail(`Test suite crashed: ${error.message}`);
        finalizeTestRunner();
    }
}

// Run tests when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTests);
} else {
    runTests();
}
