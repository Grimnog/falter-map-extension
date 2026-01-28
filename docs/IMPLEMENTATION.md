# Falter Map Implementation Plan

This document tracks the actionable tickets for the Falter Map extension project. It serves as our sprint board and backlog.

- **`docs/REFACTORING_ANALYSIS.md`**: Our long-term architectural guide and technical debt registry.
- **`docs/IMPLEMENTATION.md`**: Our short-term list of tasks to be done.

---

## 🏛️ Epics

An Epic represents a large body of work that can be broken down into smaller tickets.

-   **E01: Foundational Refactoring:** Tasks related to improving the core architecture, eliminating tech debt, and preparing the codebase for new features.

---

## Sprint 1 ✅ Done

-   **FALTMAP-01:** Centralize Configuration into `constants.js`
-   **FALTMAP-02:** Create Shared `CacheManager` Module
-   **FALTMAP-03:** Refactor `popup.js` and `background.js` to Use `CacheManager`
-   **FALTMAP-04:** Implement Event Delegation for Restaurant List
-   **FALTMAP-05:** Cache DOM Element Queries in Variables
-   **FALTMAP-06:** Implement Visual Progress Bar (previously completed)
-   **FALTMAP-07:** Introduce Basic Testing Strategy for Critical Modules

---

## Backlog

### 🎟️ **TICKET: FALTMAP-07 - Introduce Basic Testing Strategy for Critical Modules (ARCHIVED - COMPLETED)**
- Epic: E01
- Status: Open

**Objective:** To improve reliability and reduce manual testing effort by implementing a lightweight testing strategy for critical modules.
**Priority:** 🟡 High

**Scope of Work:**

1.  **Create Test Runner HTML:**
    -   **File to Create:** `tests/test-runner.html`
    -   **Content:**
        ```html
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cache Manager Tests</title>
            <style>
                body { font-family: sans-serif; margin: 20px; background-color: #f4f4f4; }
                h1 { color: #333; }
                #test-results { background-color: #fff; border: 1px solid #ddd; padding: 15px; margin-top: 20px; white-space: pre-wrap; font-family: monospace; }
                .pass { color: green; }
                .fail { color: red; }
                .info { color: blue; }
            </style>
        </head>
        <body>
            <h1>Cache Manager Tests</h1>
            <p>Open the browser's developer console (F12) to view detailed test output.</p>
            <div id="test-results">Running tests...</div>

            <script type="module" src="./cache-utils.test.js"></script>
        </body>
        </html>
        ```

2.  **Create Test Script for CacheManager:**
    -   **File to Create:** `tests/cache-utils.test.js`
    -   **Content:**
        ```javascript
        import { CacheManager } from '../modules/cache-utils.js';
        import { CONFIG } from '../modules/constants.js';

        const resultsDiv = document.getElementById('test-results');
        const log = (msg, className = 'info') => {
            const p = document.createElement('p');
            p.className = className;
            p.textContent = msg;
            resultsDiv.appendChild(p);
            console.log(msg);
        };

        const assert = (condition, message) => {
            if (condition) {
                log(`✅ Pass: ${message}`, 'pass');
                return true;
            } else {
                log(`❌ Fail: ${message}`, 'fail');
                console.error(`Assertion Failed: ${message}`);
                return false;
            }
        };

        async function runCacheTests() {
            log('Starting CacheManager tests...');

            // Clear cache before each test run
            await CacheManager.clear();
            log('Cache cleared for fresh test run.');

            // Test 1: Load empty cache
            log('\n--- Test 1: Load Empty Cache ---');
            let emptyCache = await CacheManager.load();
            assert(Object.keys(emptyCache).length === 0, 'Empty cache should return an empty object');

            // Test 2: Save and retrieve a single entry
            log('\n--- Test 2: Save and Retrieve Single Entry ---');
            const testAddress1 = '1010 wien, teststrasse 1';
            const testCoords1 = { lat: 48.2, lng: 16.3 };
            await CacheManager.save(testAddress1, testCoords1);
            let loadedCache1 = await CacheManager.load();
            assert(Object.keys(loadedCache1).length === 1, 'Cache should contain one entry after saving');
            assert(loadedCache1[testAddress1.toLowerCase().trim()].coords.lat === testCoords1.lat, 'Saved latitude should match');
            assert(loadedCache1[testAddress1.toLowerCase().trim()].coords.lng === testCoords1.lng, 'Saved longitude should match');

            // Test 3: Overwrite an existing entry
            log('\n--- Test 3: Overwrite Existing Entry ---');
            const newCoords1 = { lat: 48.3, lng: 16.4 };
            await CacheManager.save(testAddress1, newCoords1);
            let loadedCache2 = await CacheManager.load();
            assert(Object.keys(loadedCache2).length === 1, 'Cache should still contain one entry after overwriting');
            assert(loadedCache2[testAddress1.toLowerCase().trim()].coords.lat === newCoords1.lat, 'Overwritten latitude should match');

            // Test 4: Save multiple entries and check count
            log('\n--- Test 4: Save Multiple Entries ---');
            const testAddress2 = '1020 wien, testgasse 2';
            const testCoords2 = { lat: 48.4, lng: 16.5 };
            await CacheManager.save(testAddress2, testCoords2);
            let loadedCache3 = await CacheManager.load();
            assert(Object.keys(loadedCache3).length === 2, 'Cache should contain two entries after saving a second unique address');

            // Test 5: Get cache stats
            log('\n--- Test 5: Get Cache Stats ---');
            const stats = await CacheManager.getStats();
            assert(stats.count === 2, 'Stats count should be 2');
            assert(typeof stats.sizeKB === 'string' && parseFloat(stats.sizeKB) >= 0, 'Stats sizeKB should be a string and a valid number');

            // Test 6: Clear all entries
            log('\n--- Test 6: Clear All Entries ---');
            await CacheManager.clear();
            let loadedCache4 = await CacheManager.load();
            assert(Object.keys(loadedCache4).length === 0, 'Cache should be empty after clearing');

            // Test 7: Test TTL migration (simulated old format)
            log('\n--- Test 7: TTL Migration from Old Format ---');
            const oldFormatAddress = 'old strasse 1';
            // Directly set an entry without expiresAt (simulating old format)
            await new Promise(r => chrome.storage.local.set({
                [CONFIG.CACHE.KEY]: {
                    [oldFormatAddress]: { lat: 48.0, lng: 16.0 }
                }
            }, r));
            let migratedCache = await CacheManager.load();
            assert(migratedCache[oldFormatAddress] && migratedCache[oldFormatAddress].expiresAt !== undefined, 'Old format entry should be migrated with expiresAt');
            assert(migratedCache[oldFormatAddress].coords.lat === 48.0, 'Migrated coords lat should be correct');

            // Test 8: Test expired entry filtering
            log('\n--- Test 8: Expired Entry Filtering ---');
            const expiredAddress = 'expired strasse 1';
            const now = Date.now();
            // Manually set an expired entry
            await CacheManager.clear(); // Ensure clear slate
            await new Promise(r => chrome.storage.local.set({
                [CONFIG.CACHE.KEY]: {
                    [expiredAddress]: {
                        coords: { lat: 48.1, lng: 16.1 },
                        cachedAt: now - (CONFIG.CACHE.TTL_MS * 2), // 2x TTL ago
                        expiresAt: now - (CONFIG.CACHE.TTL_MS / 2) // Expired relative to now
                    }
                }
            }, r));
            let filteredCache = await CacheManager.load();
            assert(filteredCache[expiredAddress] === undefined, 'Expired entry should be filtered out during load');
            log('All CacheManager tests completed.');
        }

        // Run tests when the DOM is ready
        document.addEventListener('DOMContentLoaded', runCacheTests);
        ```

3.  **Update `manifest.json`:**
    -   **File to Modify:** `manifest.json`
    -   **Action:** Add the following entry to the `web_accessible_resources` array to ensure the test runner and test scripts can be loaded by the extension. If `web_accessible_resources` does not exist, create it.
        ```json
        "web_accessible_resources": [
            {
                "resources": ["modules/*.js", "tests/test-runner.html", "tests/*.js"],
                "matches": ["<all_urls>"]
            }
        ],
        ```

4.  **Instructions for Running Tests:**
    -   **Action:** To run the tests, first load the extension in Chrome (if not already loaded).
    -   **Action:** Open a new browser tab and navigate to `chrome-extension://<YOUR_EXTENSION_ID>/tests/test-runner.html`. You can find `YOUR_EXTENSION_ID` on the `chrome://extensions/` page.
    -   **Action:** Open the developer console (F12) to see detailed test results.

**Acceptance Criteria (AC):**
- [ ] `tests/test-runner.html` is created with the specified content.
- [ ] `tests/cache-utils.test.js` is created with the specified content.
- [ ] `manifest.json` is updated to include `"tests/test-runner.html"` and `"tests/*.js"` in `web_accessible_resources`.
- [ ] The test page can be opened at `chrome-extension://<YOUR_EXTENSION_ID>/tests/test-runner.html`.
- [ ] Running the tests in the browser console shows all tests for `CacheManager` passing.
- [ ] The commit message follows the format: `feat: implement HTML test runner for cache-utils`.
- [ ] The ticket is moved to the "Done" section in this document.