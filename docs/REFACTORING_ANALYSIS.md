# Refactoring Analysis & Improvement Suggestions

## Executive Summary

**Current State**: The extension is functional and achieves its core goal well. However, at ~905 lines in `content.js`, there are opportunities to improve maintainability, reduce duplication, and enhance performance.

**Goal Alignment**: All suggestions maintain the lightweight nature while improving code quality and user experience.

---

## 1. Code Duplication Issues

### 🔴 **Critical: Cache Management Duplication**

The `loadGeocodeCache()` function and cache migration logic appears in **three files**:
- `content.js` (lines 151-178)
- `popup.js` (lines 5-32)
- `background.js` (lines 8-14)

**Problem**:
- Maintenance burden: updating cache format requires changes in 3 places
- Risk of inconsistency if one implementation diverges
- ~80 lines of duplicated code

**Solution**: Create shared cache utility

```javascript
// cache-utils.js (new file)
export const CacheManager = {
    TTL_DAYS: 30,
    CACHE_KEY: 'geocodeCache',

    async load() {
        return new Promise((resolve) => {
            chrome.storage.local.get([this.CACHE_KEY], (result) => {
                const cache = result[this.CACHE_KEY] || {};
                const now = Date.now();
                const validCache = {};

                for (const [address, data] of Object.entries(cache)) {
                    if (!data.expiresAt) {
                        // Migrate old format
                        validCache[address] = {
                            coords: data,
                            cachedAt: now,
                            expiresAt: now + (this.TTL_DAYS * 24 * 60 * 60 * 1000)
                        };
                    } else if (data.expiresAt > now) {
                        validCache[address] = data;
                    }
                }

                resolve(validCache);
            });
        });
    },

    async save(address, coords) {
        const cache = await this.load();
        const expiresAt = Date.now() + (this.TTL_DAYS * 24 * 60 * 60 * 1000);

        cache[address.toLowerCase().trim()] = {
            coords,
            cachedAt: Date.now(),
            expiresAt
        };

        return new Promise((resolve) => {
            chrome.storage.local.set({ [this.CACHE_KEY]: cache }, resolve);
        });
    },

    async clear() {
        return new Promise((resolve) => {
            chrome.storage.local.remove([this.CACHE_KEY], resolve);
        });
    },

    async getStats() {
        const cache = await this.load();
        return new Promise((resolve) => {
            chrome.storage.local.getBytesInUse([this.CACHE_KEY], (bytes) => {
                resolve({
                    count: Object.keys(cache).length,
                    sizeKB: (bytes / 1024).toFixed(1),
                    sizeBytes: bytes
                });
            });
        });
    }
};
```

**Impact**:
- ✅ Removes ~70 lines of duplication
- ✅ Single source of truth for cache logic
- ✅ Easier to add features (e.g., selective cache expiry)
- ✅ More testable

---

## 2. Architecture Improvements

### 🟡 **Medium Priority: Modularize content.js**

**Current State**: 905 lines in a single IIFE with mixed concerns

**Proposed Structure**:

```
content.js (main entry point - ~100 lines)
  ├── modules/
  │   ├── cache-utils.js        (cache management)
  │   ├── dom-parser.js         (restaurant scraping)
  │   ├── geocoder.js           (address geocoding)
  │   ├── map-modal.js          (modal UI & map)
  │   ├── navigation.js         (keyboard navigation)
  │   └── constants.js          (config values)
```

**Example - Separate DOM Parser**:

```javascript
// modules/dom-parser.js
export function parseRestaurantsFromDOM(doc) {
    const restaurants = [];
    const links = doc.querySelectorAll('a.group.block[href*="/lokal/"]');

    links.forEach(link => {
        const restaurant = extractRestaurantData(link);
        if (restaurant && !restaurants.find(r => r.id === restaurant.id)) {
            restaurants.push(restaurant);
        }
    });

    return restaurants;
}

function extractRestaurantData(link) {
    const href = link.getAttribute('href');
    if (!href) return null;

    const idMatch = href.match(/\/lokal\/(\d+)\//);
    if (!idMatch) return null;

    const id = idMatch[1];
    const text = link.innerText || link.textContent || '';

    // ... extraction logic

    return { id, name, district, street, address, url };
}

export function getPaginationInfo() {
    const pageText = document.body.innerText || '';
    const pageMatch = pageText.match(/seite\s+(\d+)\s*\/\s*(\d+)/i);

    return pageMatch
        ? { current: parseInt(pageMatch[1]), total: parseInt(pageMatch[2]) }
        : { current: 1, total: 1 };
}
```

**Example - Separate Geocoder**:

```javascript
// modules/geocoder.js
import { CacheManager } from './cache-utils.js';
import { NOMINATIM_DELAY, ADDRESS_VARIATIONS_STRATEGIES } from './constants.js';

export class Geocoder {
    constructor() {
        this.cache = CacheManager;
    }

    async geocodeRestaurants(restaurantList, onProgress) {
        const cache = await this.cache.load();
        const results = [];
        const needsGeocoding = [];

        // Separate cached from uncached
        for (const restaurant of restaurantList) {
            const cacheKey = this.getCacheKey(restaurant.address);

            if (cache[cacheKey]) {
                results.push({
                    ...restaurant,
                    coords: cache[cacheKey].coords || cache[cacheKey],
                    fromCache: true
                });
            } else {
                needsGeocoding.push(restaurant);
            }
        }

        // Process uncached with rate limiting
        for (let i = 0; i < needsGeocoding.length; i++) {
            const restaurant = needsGeocoding[i];

            if (onProgress) {
                onProgress(results.length + i + 1, restaurantList.length, results);
            }

            const coords = await this.geocodeAddress(restaurant.address);

            if (coords) {
                await this.cache.save(restaurant.address, coords);
            }

            results.push({
                ...restaurant,
                coords,
                fromCache: false
            });

            if (onProgress) {
                onProgress(results.length, restaurantList.length, results);
            }

            if (i < needsGeocoding.length - 1) {
                await this.delay(NOMINATIM_DELAY);
            }
        }

        return results;
    }

    async geocodeAddress(address) {
        const variations = this.generateAddressVariations(address);

        for (let i = 0; i < variations.length; i++) {
            const coords = await this.tryGeocode(variations[i]);
            if (coords) return coords;

            if (i < variations.length - 1) {
                await this.delay(200);
            }
        }

        return null;
    }

    generateAddressVariations(address) {
        // ... address variation logic from content.js:224-254
    }

    async tryGeocode(formattedAddress) {
        // ... single geocode attempt from content.js:262-285
    }

    getCacheKey(address) {
        return address.toLowerCase().trim();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
```

**Impact**:
- ✅ Improves maintainability (smaller, focused files)
- ✅ Easier to test individual modules
- ✅ Better separation of concerns
- ✅ Can lazy-load modules (reduces initial parse time)

---

## 3. Performance Optimizations

### 🟢 **Low-Hanging Fruit**

#### A. Cache DOM Queries

**Current**:
```javascript
// content.js - repeated queries
document.getElementById('modal-geocode-status')
document.getElementById('modal-results')
document.querySelectorAll('#modal-results .result-item:not(.no-coords)')
```

**Improved**:
```javascript
class MapModal {
    constructor() {
        this.elements = {
            modal: null,
            statusEl: null,
            resultsEl: null,
            noteEl: null
        };
    }

    create(restaurants) {
        this.elements.modal = document.createElement('div');
        // ... create modal
        document.body.appendChild(this.elements.modal);

        // Cache references once
        this.elements.statusEl = this.elements.modal.querySelector('#modal-geocode-status');
        this.elements.resultsEl = this.elements.modal.querySelector('#modal-results');
        this.elements.noteEl = this.elements.modal.querySelector('#status-note');
    }

    updateStatus(text) {
        this.elements.statusEl.textContent = text;
    }
}
```

#### B. Event Delegation for Result Items

**Current**: Creates event listener for each restaurant item (50+ listeners for large results)

```javascript
// content.js:633-651
item.addEventListener('click', () => {
    // ... click handler
});
```

**Improved**: Single delegated listener

```javascript
resultsEl.addEventListener('click', (e) => {
    const item = e.target.closest('.result-item:not(.no-coords)');
    if (!item) return;

    const index = Array.from(resultsEl.children).indexOf(item);
    this.selectRestaurant(index);
});
```

**Impact**:
- ✅ Reduces memory usage (~50 fewer listeners for 50 restaurants)
- ✅ Faster DOM updates when rebuilding list

#### C. Debounce Pagination Fetching

**Current**: Fetches pages with 300ms delay (content.js:142)

**Improved**: Could use Promise.all for parallel fetch with semaphore

```javascript
async function fetchAllPages(progressCallback) {
    const pagination = getPaginationInfo();

    // Fetch first 3 pages in parallel, then sequential
    const initialPages = Math.min(3, pagination.total);
    const pagePromises = [];

    for (let page = 1; page <= initialPages; page++) {
        pagePromises.push(
            page === pagination.current
                ? Promise.resolve(parseRestaurantsFromDOM(document))
                : fetchPage(page)
        );
    }

    const results = await Promise.all(pagePromises);
    const allRestaurants = results.flat();

    // Fetch remaining pages sequentially
    for (let page = initialPages + 1; page <= pagination.total; page++) {
        const restaurants = await fetchPage(page);
        allRestaurants.push(...restaurants);
        await delay(300);
    }

    return allRestaurants;
}
```

**Impact**:
- ✅ Faster initial load for multi-page results
- ⚠️ Risk: Might stress Falter.at server (only first 3 pages)

---

## 4. Code Quality Improvements

### 🟡 **Constants & Configuration**

**Current**: Magic numbers scattered throughout

```javascript
// Various places in content.js
setTimeout(resolve, 1100);      // Line 351
setTimeout(resolve, 300);       // Line 142
setTimeout(resolve, 200);       // Line 292
30 * 24 * 60 * 60 * 1000        // Lines 166, 183
```

**Improved**: Centralized configuration

```javascript
// modules/constants.js
export const CONFIG = {
    CACHE: {
        TTL_DAYS: 30,
        TTL_MS: 30 * 24 * 60 * 60 * 1000,
        WARNING_SIZE_MB: 5,
        KEY: 'geocodeCache'
    },

    NOMINATIM: {
        RATE_LIMIT_MS: 1100,
        RETRY_DELAY_MS: 200,
        USER_AGENT: 'FalterMapExtension/1.0',
        API_URL: 'https://nominatim.openstreetmap.org/search',
        WARNING_THRESHOLD: 100
    },

    PAGINATION: {
        FETCH_DELAY_MS: 300
    },

    MAP: {
        DEFAULT_CENTER: [48.2082, 16.3719],
        DEFAULT_ZOOM: 13,
        SELECTED_ZOOM: 16,
        BOUNDS_PADDING: 0.1
    },

    ANIMATION: {
        MARKER_STAGGER_MS: 50,
        MARKER_PULSE_MS: 600,
        MODAL_INIT_DELAY_MS: 100,
        BUTTON_INJECT_DELAY_MS: 500
    },

    UI: {
        SKELETON_ITEMS: 8,
        SKELETON_DELAY_MS: 300
    }
};
```

### 🟡 **Error Handling Enhancement**

**Current**: Console logs with limited user feedback

**Improved**: User-friendly error messages

```javascript
// modules/error-handler.js
export class ErrorHandler {
    static showError(type, details = {}) {
        const messages = {
            GEOCODING_FAILED: {
                title: 'Geocoding Issue',
                message: `Could not locate ${details.count} restaurant(s). They will be hidden from the map.`,
                severity: 'warning'
            },
            NETWORK_ERROR: {
                title: 'Connection Error',
                message: 'Unable to connect to geocoding service. Please check your internet connection.',
                severity: 'error'
            },
            RATE_LIMIT: {
                title: 'Rate Limit Reached',
                message: 'Too many requests. Please wait a moment and try again.',
                severity: 'warning'
            }
        };

        const error = messages[type] || {
            title: 'Error',
            message: 'An unexpected error occurred.',
            severity: 'error'
        };

        this.showNotification(error.title, error.message, error.severity);
    }

    static showNotification(title, message, severity = 'info') {
        // Create toast notification in modal
        const toast = document.createElement('div');
        toast.className = `toast toast-${severity}`;
        toast.innerHTML = `
            <strong>${title}</strong>
            <p>${message}</p>
        `;
        // ... position and auto-dismiss logic
    }
}
```

### 🟢 **Function Simplification**

**Example: Break down `startGeocoding` (70+ lines)**

```javascript
// Before: content.js:507-576 (monolithic)

// After: Modular approach
class MapModal {
    async startGeocoding(restaurants) {
        const cache = await this.loadCache();

        const initialResults = await this.prepareInitialResults(restaurants, cache);
        await this.renderInitialState(initialResults);

        const needsGeocoding = this.filterUncached(restaurants, cache);

        if (needsGeocoding.length > 0) {
            await this.performGeocoding(restaurants, needsGeocoding);
        }
    }

    async prepareInitialResults(restaurants, cache) {
        return restaurants.map(r => ({
            ...r,
            coords: cache[this.getCacheKey(r.address)]?.coords || null
        }));
    }

    async renderInitialState(results) {
        this.updateResultsList([]);
        await this.delay(300);
        this.updateResultsList(results);
        this.updateMapMarkers(results.filter(r => r.coords), false);
        this.updateStatusText(results);
    }

    // ... smaller focused methods
}
```

---

## 5. User Experience Enhancements

### 🟢 **Progress Indicator Improvements**

**Current**: Text-based status "5/50 located"

**Enhanced**: Visual progress bar

```javascript
// Add to modal HTML
<div class="progress-container">
    <div class="progress-bar" id="progress-bar"></div>
    <div class="progress-text" id="progress-text">0/0 located</div>
</div>

// JavaScript
updateProgress(current, total) {
    const percentage = (current / total) * 100;
    this.elements.progressBar.style.width = `${percentage}%`;
    this.elements.progressText.textContent = `${current}/${total} located`;
}
```

```css
.progress-container {
    position: relative;
    height: 4px;
    background: rgb(240, 240, 240);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 12px;
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, rgb(251, 229, 31), rgb(255, 200, 0));
    transition: width 0.3s ease;
}

.progress-text {
    position: absolute;
    top: 8px;
    left: 0;
    font-size: 11px;
    color: rgb(115, 115, 115);
}
```

### 🟡 **Better Cache Invalidation UX**

**Current**: Asks user to clear entire cache

**Enhanced**: Smart cache management

```javascript
// In popup.js
async showCacheDetails() {
    const cache = await CacheManager.load();
    const now = Date.now();

    // Categorize entries
    const stats = {
        fresh: 0,     // < 7 days old
        aging: 0,     // 7-30 days old
        expired: 0    // > 30 days old (shouldn't happen)
    };

    for (const entry of Object.values(cache)) {
        const ageMs = now - entry.cachedAt;
        const ageDays = ageMs / (24 * 60 * 60 * 1000);

        if (ageDays < 7) stats.fresh++;
        else if (ageDays < 30) stats.aging++;
        else stats.expired++;
    }

    // Show detailed breakdown to user
    // Offer "Clear old entries" vs "Clear all"
}
```

### 🟢 **Keyboard Shortcuts Help**

**Add**: Keyboard shortcut overlay

```javascript
// Show when user presses "?"
showKeyboardHelp() {
    const helpModal = `
        <div class="keyboard-help">
            <h3>Keyboard Shortcuts</h3>
            <dl>
                <dt>↑/↓</dt><dd>Navigate restaurants</dd>
                <dt>ESC</dt><dd>Close map</dd>
                <dt>?</dt><dd>Show this help</dd>
            </dl>
        </div>
    `;
    // ... display logic
}

// In handleKeyboardNavigation
case '?':
    this.showKeyboardHelp();
    break;
```

---

## 6. Testing Strategy

### Current State: No Tests

**Proposed**: Lightweight testing without build complexity

```javascript
// tests/cache-utils.test.js (can run in browser console)
const testCacheManager = async () => {
    console.group('CacheManager Tests');

    // Test 1: Load empty cache
    await chrome.storage.local.clear();
    const empty = await CacheManager.load();
    console.assert(
        Object.keys(empty).length === 0,
        'Empty cache should return {}'
    );

    // Test 2: Save and retrieve
    await CacheManager.save('test address', { lat: 48.2, lng: 16.3 });
    const loaded = await CacheManager.load();
    console.assert(
        loaded['test address'].coords.lat === 48.2,
        'Should save and retrieve coordinates'
    );

    // Test 3: Migration from old format
    await chrome.storage.local.set({
        geocodeCache: {
            'old format': { lat: 48.1, lng: 16.1 }
        }
    });
    const migrated = await CacheManager.load();
    console.assert(
        migrated['old format'].expiresAt !== undefined,
        'Should migrate old format to new format'
    );

    console.groupEnd();
};
```

---

## 7. Bundle Size Analysis

### Current Size Breakdown (estimated):

```
content.js          ~35 KB (unminified)
content.css         ~18 KB
popup.js            ~3 KB
popup.html          ~11 KB
background.js       ~5 KB
leaflet.js          ~145 KB (vendor)
leaflet.css         ~14 KB (vendor)
-----------------------------------
Total (custom)      ~72 KB
Total (with vendor) ~231 KB
```

### After Refactoring (estimated):

```
Modules (total)     ~38 KB (modular but slightly more code due to exports)
content.css         ~18 KB (no change)
popup.js            ~2 KB (simpler with shared utils)
background.js       ~2 KB (minimal)
-----------------------------------
Custom code         ~60 KB (16% reduction via deduplication)
```

**Note**: Module overhead is negligible with modern ES6. Gzip compression reduces actual transfer size by ~70%.

---

## 8. Implementation Priority

### Phase 1: Quick Wins (1-2 hours)
1. ✅ [x] Extract constants to `constants.js`
2. ✅ [x] Create shared `cache-utils.js`
3. ✅ [ ] Add progress bar UI
4. ✅ [ ] Event delegation for result items
5. ✅ [ ] Cache DOM queries

**Impact**: Immediate code quality improvement, ~15% reduction in duplication

### Phase 2: Modularization (3-4 hours)
1. ✅ [x] Extract `dom-parser.js`
2. ✅ [x] Extract `geocoder.js`
3. ✅ [ ] Extract `map-modal.js`
4. ✅ [ ] Extract `navigation.js`
5. ✅ [x] Update manifest for ES6 modules

**Impact**: Better maintainability, easier to test, cleaner architecture

### Phase 3: Enhancements (2-3 hours)
1. ✅ [ ] Better error handling with user notifications
2. ✅ [ ] Keyboard shortcut help overlay
3. ✅ [ ] Smart cache management UI
4. ✅ [ ] Write basic test suite

**Impact**: Better UX, more robust error handling

---

## 9. Risks & Considerations

### Risk: ES6 Module Browser Support
- **Issue**: Manifest V3 supports ES6 modules but requires type="module"
- **Mitigation**: Test thoroughly in Chrome/Edge/Brave (all Chromium-based)
- **Fallback**: Can always bundle with lightweight tool like esbuild if needed

### Risk: Increased File Count
- **Issue**: 8+ files vs 4 currently
- **Mitigation**: Clear folder structure, good documentation
- **Note**: Development complexity vs runtime complexity trade-off

### Risk: Breaking Existing Functionality
- **Issue**: Refactoring always carries regression risk
- **Mitigation**:
  - Incremental changes
  - Test after each phase
  - Keep git history clean with atomic commits

---

## 10. Recommendations Summary

### Must Do (Highest ROI):
1. ✅ [x] **Create shared cache utility** - Eliminates 70 lines of duplication
2. ✅ [x] **Extract constants** - Improves maintainability
3. ✅ [ ] **Event delegation** - Small change, immediate performance gain

### Should Do (High Value):
4. ✅ [x] **Modularize content.js** - Long-term maintainability
5. ✅ [ ] **Better error handling** - Improved UX
6. ✅ [ ] **Progress bar** - Visual feedback enhancement

### Nice to Have (Future):
7. ⚪ **Parallel pagination fetching** - Marginal speed improvement
8. ⚪ **Test suite** - Good practice but adds complexity
9. ⚪ **Keyboard help overlay** - Low priority polish

---

## Conclusion

The extension is already well-designed and achieves its goals. The proposed refactoring:
- **Maintains** the lightweight nature (actually reduces code by ~16%)
- **Improves** maintainability significantly
- **Enhances** user experience with better feedback
- **Preserves** all existing functionality

**Recommendation**: Implement Phase 1 (quick wins) first, then evaluate whether Phase 2 modularization is worth the effort based on your development plans.
