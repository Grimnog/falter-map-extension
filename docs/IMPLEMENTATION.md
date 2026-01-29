# Falter Map Implementation Plan

This document tracks the actionable tickets for the Falter Map extension project. It serves as our sprint board and backlog.

- **`docs/REFACTORING_ANALYSIS.md`**: Our long-term architectural guide and technical debt registry.
- **`docs/IMPLEMENTATION.md`**: Our short-term list of tasks to be done.

---

## 📝 Ticket Template & Guidelines

All tickets in this document MUST follow this standardized template. This ensures consistency and provides all necessary information for implementation.

### **Template Structure:**

```markdown
### 🎟️ **TICKET: FALTMAP-XX - [Title in Imperative Form]**
- Epic: [E01|E02|E03|E04|E05]
- Status: [Open|In Progress|Blocked|Done]
- Story Points: [1|2|3|5|8|13|21]

**User Story:**
As a [role/persona], I want [feature/capability] so that [business value/benefit].

**Context:**
[2-4 sentences explaining the background, current problem, and why this ticket exists.
Reference technical debt items from REFACTORING_ANALYSIS.md if applicable.]

**Priority:** [🔴 Critical | 🟡 High | 🟢 Medium | ⚪ Low]

**Technical Debt Reference:** [Optional: DEBT-XX in `docs/REFACTORING_ANALYSIS.md`]

**Dependencies:** [Optional: FALTMAP-XX must be completed first]

**Scope of Work:**

1.  **[Action 1 - e.g., Create Module]:**
    -   **File to Create:** `path/to/file.js`
    -   **Responsibilities:**
        -   Bullet point list of what this file/component does
    -   **Public API:** [Optional: Code snippet showing interface]
    -   **Changes:** [For modifications, describe what changes]

2.  **[Action 2 - e.g., Refactor Existing Code]:**
    -   **File to Modify:** `path/to/file.js`
    -   **Changes:**
        -   Specific changes to make
    -   **Expected Impact:** [e.g., "Reduce file by ~100 lines"]

3.  **[Action 3 - e.g., Update Configuration]:**
    -   **File to Modify:** `path/to/config.json`
    -   **Changes:** Describe config changes

4.  **Manual Testing Checklist:**
    -   [ ] Test scenario 1
    -   [ ] Test scenario 2
    -   [ ] Edge case testing
    -   [ ] Performance verification (if applicable)

**Acceptance Criteria (AC):**
- [ ] Files are created/modified as specified in Scope of Work
- [ ] All functionality described in User Story works correctly
- [ ] Manual testing checklist is completed with all items passing
- [ ] No console errors or warnings introduced
- [ ] Code follows existing style conventions
- [ ] No regressions in existing functionality
- [ ] [Specific measurable outcomes for this ticket]
- [ ] The commit message follows the format: `[type]: [description]`
- [ ] The ticket is moved to the "Done" section in this document
```

---

### **Field Definitions:**

| Field | Required | Description | Guidelines |
|-------|----------|-------------|------------|
| **Title** | ✅ Yes | Brief summary in imperative mood | Max 60 chars. Format: "Extract MapModal Component" |
| **Epic** | ✅ Yes | Parent epic reference | Must match an epic defined in Epics section |
| **Status** | ✅ Yes | Current ticket state | Open → In Progress → Done (or Blocked) |
| **Story Points** | ✅ Yes | Effort estimation | Use Fibonacci: 1, 2, 3, 5, 8, 13, 21 |
| **User Story** | ✅ Yes | Feature description from user perspective | Format: "As a [role], I want [feature] so that [benefit]" |
| **Context** | ✅ Yes | Background and rationale | 2-4 sentences. Link to tech debt if applicable |
| **Priority** | ✅ Yes | Business/technical importance | 🔴 Critical, 🟡 High, 🟢 Medium, ⚪ Low |
| **Technical Debt Reference** | ⚪ Optional | Link to REFACTORING_ANALYSIS.md | Use when ticket resolves documented debt |
| **Dependencies** | ⚪ Optional | Prerequisite tickets | "Requires FALTMAP-XX to be completed first" |
| **Scope of Work** | ✅ Yes | Detailed implementation steps | Number each action. Specify exact files and changes |
| **Manual Testing Checklist** | ✅ Yes | Test scenarios | Must be within Scope of Work. Specific, actionable items |
| **Acceptance Criteria** | ✅ Yes | Definition of done | Checkbox format. Measurable. Include commit format |

---

### **Story Point Guidelines:**

| Points | Complexity | Time Estimate | Example |
|--------|-----------|---------------|---------|
| **1** | Trivial | ~1 hour | Update constant value, fix typo in docs |
| **2** | Simple | ~2-3 hours | Add CSS styling, simple config change |
| **3** | Easy | ~4-6 hours | Extract small utility function, add simple test |
| **5** | Medium | ~1-2 days | Create new module, implement feature with tests |
| **8** | Complex | ~3-4 days | Major refactoring, complex feature with edge cases |
| **13** | Very Complex | ~5-7 days | Architectural change, multiple modules affected |
| **21** | Epic-level | ~2 weeks | Consider breaking into smaller tickets |

---

### **Priority Guidelines:**

| Priority | Icon | When to Use | Example |
|----------|------|-------------|---------|
| **Critical** | 🔴 | Blocks other work, major UX issue, data loss risk | Architecture refactoring that enables future work |
| **High** | 🟡 | Important for upcoming release, significant improvement | Error handling, test coverage expansion |
| **Medium** | 🟢 | Nice to have, improves UX but not urgent | Performance optimization, new features |
| **Low** | ⚪ | Future consideration, minor improvement | Power user features, cosmetic changes |

---

### **Best Practices:**

#### **DO:**
✅ Write user stories from the user's or developer's perspective
✅ Be specific about which files to create/modify
✅ Include code snippets for APIs or complex changes
✅ Reference line numbers or sections when modifying existing code
✅ Add manual testing checklists with specific scenarios
✅ Link to related technical debt items
✅ Specify expected outcomes (e.g., "Reduce file by ~100 lines")
✅ Include commit message format in acceptance criteria
✅ Use checkbox format `- [ ]` for all checklist items

#### **DON'T:**
❌ Make vague or ambiguous scope descriptions
❌ Skip the user story or context
❌ Forget to specify exact file paths
❌ Leave acceptance criteria unmeasurable
❌ Create tickets larger than 13 story points (split them)
❌ Mix multiple unrelated changes in one ticket
❌ Forget to update ticket status as work progresses

---

### **Example: Minimal Valid Ticket**

```markdown
### 🎟️ **TICKET: FALTMAP-99 - Add Logging Utility Module**
- Epic: E01
- Status: Open
- Story Points: 2

**User Story:**
As a developer, I want a centralized logging utility so that I can debug issues consistently across all modules.

**Context:**
Currently, console.log statements are scattered throughout the codebase with inconsistent formatting. A logging utility will provide consistent output and make it easier to enable/disable debug logs in production.

**Priority:** 🟢 Medium

**Scope of Work:**

1.  **Create Logging Module:**
    -   **File to Create:** `modules/logger.js`
    -   **Public API:**
        ```javascript
        export const Logger = {
            debug(message, data),
            info(message, data),
            warn(message, data),
            error(message, data)
        }
        ```

2.  **Manual Testing Checklist:**
    -   [ ] Logger methods output to console correctly
    -   [ ] Debug logs can be disabled via config

**Acceptance Criteria (AC):**
- [ ] `modules/logger.js` is created with specified API
- [ ] All log methods work correctly
- [ ] Manual testing checklist is completed
- [ ] The commit message follows the format: `feat: add logging utility module`
- [ ] The ticket is moved to the "Done" section in this document
```

---

## 🏛️ Epics

An Epic represents a large body of work that can be broken down into smaller tickets.

-   **E01: Foundational Refactoring:** Tasks related to improving the core architecture, eliminating tech debt, and preparing the codebase for new features.
-   **E02: UI Modularization:** Extract all UI-related logic from `content.js` into dedicated, stateful modules to achieve a true component-based architecture.
-   **E03: Testing & Reliability:** Expand test coverage across all critical modules and implement robust error handling mechanisms.
-   **E04: Performance & Polish:** Optimize rendering performance and user experience for large datasets.
-   **E05: Feature Enhancements:** Add new user-facing features to improve usability and engagement.

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

## Sprint 2 📋 In Progress

**Focus:** Complete UI modularization and improve error handling
**Total:** 16 story points

### ✅ Done (11/16 pts):
-   **FALTMAP-08:** Extract MapModal Component from content.js (8 pts, Critical) ✅
-   **FALTMAP-09:** Extract Navigation Module for Keyboard Handling (3 pts, High) ✅

### 🔄 Remaining:
-   **FALTMAP-11:** Implement User-Facing Error Notification System (5 pts, Critical)

### ⚠️ Critical Sequencing (from Gemini Review):

**FALTMAP-08 MUST be completed first.** Both FALTMAP-09 and FALTMAP-11 have implicit dependencies on MapModal.js:
- FALTMAP-09's Navigation constructor takes `mapModal` as an argument
- FALTMAP-11's ErrorHandler needs to integrate with MapModal for UI alerts/toasts

**Recommended Order:**
1. **FALTMAP-08** → Complete and stabilize MapModal.js
2. **FALTMAP-09** → Extract Navigation (depends on stable MapModal API)
3. **FALTMAP-11** → Integrate ErrorHandler (can start with FALTMAP-09, but UI integration requires MapModal)

**Rationale:** Working on FALTMAP-09 or FALTMAP-11 before FALTMAP-08 is complete will cause inefficiency and rework. Prioritize FALTMAP-08 completion above all else.

---

## Sprint 3 🎯 Recommended (from Gemini Review)

**Focus:** Stability through testing, then critical UX improvements
**Estimated:** 18 story points

### Recommended Tickets (in priority order):

1. **FALTMAP-10:** Expand Test Coverage to All Critical Modules (5 pts, High)
   - **Why first:** Provides safety net for all subsequent development
   - **Impact:** Prevents regressions, enables confident refactoring
   - **Target:** 80% line coverage for critical modules

2. **FALTMAP-13:** Add Marker Clustering for Dense Map Areas (5 pts, Medium)
   - **Why second:** Directly addresses #1 UX pain point (overlapping markers)
   - **Impact:** Makes map usable in dense areas (Innere Stadt)
   - **User Value:** Immediate, tangible improvement

3. **FALTMAP-12:** Implement Virtual Scrolling for Large Result Lists (8 pts, Medium)
   - **Why third:** Addresses list performance for large datasets
   - **Impact:** Smooth 60 FPS scrolling with 500+ restaurants
   - **Complexity:** More complex than clustering, benefits from FALTMAP-10 tests

**Justification:** Testing first ensures stability before adding complex features. Clustering provides immediate user value. Virtual scrolling complements clustering for complete performance optimization.

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

---

### 🎟️ **TICKET: FALTMAP-08 - Extract MapModal Component from content.js**
- Epic: E02
- Status: Done ✅
- Story Points: 8

**User Story:**
As a developer, I want the map modal UI logic extracted into a dedicated module so that the codebase has clear separation of concerns and the UI becomes testable.

**Context:**
Currently, `content.js` (571 lines) contains all UI logic including modal creation, map initialization, marker management, and event handling. This violates the Single Responsibility Principle and makes the code difficult to test and maintain. By extracting UI logic into `MapModal.js`, we achieve a cleaner architecture where `content.js` acts purely as a coordinator.

**Priority:** 🔴 Critical

**Technical Debt Reference:** DEBT-01 in `docs/REFACTORING_ANALYSIS.md`

**Scope of Work:**

1.  **Create `modules/MapModal.js`:**
    -   **File to Create:** `modules/MapModal.js`
    -   **Responsibilities:**
        -   Modal DOM creation and lifecycle management
        -   Leaflet map initialization and configuration
        -   Marker placement, updates, and animations
        -   Results list rendering and updates
        -   Progress bar state management
        -   Map zoom and bounds calculation
    -   **Public API:**
        ```javascript
        export class MapModal {
            constructor(restaurants)
            show()
            hide()
            destroy()
            updateProgress(processed, total, located)
            setStatus(message, type) // type: 'info'|'success'|'error'
            addMarker(restaurant, index, isNew)
            selectRestaurant(index)
            getMap() // Returns Leaflet map instance
            onRestaurantClick(callback) // User clicks restaurant in list
            onMarkerClick(callback) // User clicks marker on map (Gemini refinement)
            onClose(callback)
        }
        ```
    -   **API Refinement Note (from Gemini Review):** Added `onMarkerClick(callback)` to propagate direct user interaction with map markers back to the coordinator, enabling synchronization between map and results list selection.

2.  **Refactor `content.js`:**
    -   **File to Modify:** `content.js`
    -   **Changes:**
        -   Import `MapModal` class
        -   Replace inline modal creation with `new MapModal(restaurants)`
        -   Remove all map initialization code (delegate to MapModal)
        -   Remove all marker creation code (delegate to MapModal)
        -   Remove all progress bar update code (delegate to MapModal)
        -   Remove all results list rendering code (delegate to MapModal)
        -   Keep only orchestration logic (button injection, geocoding coordination)
    -   **Expected Line Reduction:** ~300 lines removed from content.js

3.  **Preserve Existing Functionality:**
    -   **Critical:** All existing features must continue to work:
        -   Modal open/close
        -   Map rendering and centering
        -   Marker animations for new pins
        -   Progress bar updates
        -   Results list click-to-zoom
        -   Restaurant selection highlighting

4.  **Update CSS if Needed:**
    -   **File to Modify (if needed):** `content.css`
    -   Ensure all modal-related styles remain functional

5.  **Manual Testing Checklist:**
    -   [ ] Open modal with "Auf Karte anzeigen" button
    -   [ ] Verify map renders correctly centered on Vienna
    -   [ ] Verify progress bar animates during geocoding
    -   [ ] Verify markers appear with correct numbers
    -   [ ] Verify new markers have animation (pin drop)
    -   [ ] Click restaurant in list → map zooms to marker
    -   [ ] Verify ESC closes modal
    -   [ ] Verify close button (×) works
    -   [ ] Open modal twice in a row (test cleanup)

**Acceptance Criteria (AC):**
- [ ] `modules/MapModal.js` is created with the specified public API (including `onMarkerClick`)
- [ ] `MapModal` class handles all modal DOM creation and lifecycle
- [ ] `MapModal` class initializes and manages the Leaflet map instance
- [ ] `MapModal.destroy()` properly calls `map.remove()` to prevent memory leaks (Gemini warning)
- [ ] All Leaflet event listeners are cleaned up in `destroy()` method
- [ ] `MapModal` class handles all marker placement and animations
- [ ] `MapModal` class handles all results list rendering
- [ ] `MapModal` class manages progress bar state and updates
- [ ] `content.js` is refactored to use `MapModal` and reduced by ~300 lines
- [ ] `content.js` no longer contains any direct DOM manipulation for the modal
- [ ] All existing modal functionality works identically to before
- [ ] Manual testing checklist is completed with all items passing
- [ ] No console errors when opening/closing modal
- [ ] No memory leaks when opening/closing modal repeatedly (test with Chrome DevTools Memory tab)
- [ ] Code follows existing style conventions (ESLint/Prettier if configured)
- [ ] The commit message follows the format: `refactor: extract MapModal component from content.js`
- [ ] The ticket is moved to the "Done" section in this document

---

### 🎟️ **TICKET: FALTMAP-09 - Extract Navigation Module for Keyboard Handling**
- Epic: E02
- Status: Done ✅
- Story Points: 3

**User Story:**
As a developer, I want keyboard navigation logic extracted into a dedicated module so that navigation behavior is isolated, testable, and easy to extend with new shortcuts.

**Context:**
Keyboard navigation (arrow keys, ESC, '?' help overlay) is currently mixed with other logic in `content.js`. Extracting this into a dedicated `Navigation.js` module completes the UI modularization effort started in FALTMAP-08 and provides a clear interface for managing navigation state.

**Priority:** 🟡 High

**Technical Debt Reference:** DEBT-01 in `docs/REFACTORING_ANALYSIS.md`

**Scope of Work:**

1.  **Create `modules/Navigation.js`:**
    -   **File to Create:** `modules/Navigation.js`
    -   **Responsibilities:**
        -   Register and manage keyboard event listeners
        -   Track current selected restaurant index
        -   Handle arrow key navigation (up/down)
        -   Handle ESC key (close modal)
        -   Handle '?' key (toggle help overlay)
        -   Notify consumers of navigation events
    -   **Public API:**
        ```javascript
        export class Navigation {
            constructor(restaurants, mapModal)
            enable()
            disable()
            destroy()
            selectNext()
            selectPrevious()
            getCurrentIndex()
            setIndex(index)
            toggleHelp()
            onNavigate(callback) // Fires when selection changes
            onClose(callback) // Fires when ESC pressed
        }
        ```

2.  **Refactor `content.js`:**
    -   **File to Modify:** `content.js`
    -   **Changes:**
        -   Import `Navigation` class
        -   Replace inline keyboard event listeners with `new Navigation(restaurants, mapModal)`
        -   Remove `selectedRestaurantIndex` state variable (delegate to Navigation)
        -   Remove `navigableRestaurants` array management (delegate to Navigation)
        -   Remove all keyboard handler functions
        -   Hook Navigation events to MapModal updates
    -   **Expected Line Reduction:** ~100 lines removed from content.js

3.  **Preserve Existing Functionality:**
    -   **Critical:** All existing keyboard shortcuts must continue to work:
        -   ↑/↓ arrow keys navigate through restaurants
        -   ESC closes modal (or help overlay if open)
        -   '?' toggles help overlay
        -   Selected restaurant is highlighted in list and map zoomed

4.  **Manual Testing Checklist:**
    -   [ ] Press ↓ arrow → next restaurant selected, map zooms
    -   [ ] Press ↑ arrow → previous restaurant selected, map zooms
    -   [ ] Navigate to first restaurant, press ↑ → wraps to last
    -   [ ] Navigate to last restaurant, press ↓ → wraps to first
    -   [ ] Press '?' → help overlay appears
    -   [ ] Press '?' again → help overlay disappears
    -   [ ] Press ESC with help open → help closes, modal stays open
    -   [ ] Press ESC with help closed → modal closes
    -   [ ] Verify selected restaurant is highlighted in results list

**Acceptance Criteria (AC):**
- [ ] `modules/Navigation.js` is created with the specified public API
- [ ] `Navigation` class handles all keyboard event registration and management
- [ ] `Navigation` class tracks selected restaurant index internally
- [ ] `Navigation` class provides callbacks for navigation events
- [ ] `content.js` is refactored to use `Navigation` and reduced by ~100 lines
- [ ] `content.js` no longer contains keyboard event handling code
- [ ] All existing keyboard navigation works identically to before
- [ ] Arrow key wrapping (first↔last) works correctly
- [ ] Help overlay toggle works correctly with ESC priority handling
- [ ] Manual testing checklist is completed with all items passing
- [ ] No console errors when using keyboard shortcuts
- [ ] The commit message follows the format: `refactor: extract Navigation module for keyboard handling`
- [ ] The ticket is moved to the "Done" section in this document

---

### 🎟️ **TICKET: FALTMAP-10 - Expand Test Coverage to All Critical Modules**
- Epic: E03
- Status: Open
- Story Points: 5

**User Story:**
As a developer, I want comprehensive test coverage for all critical modules so that I can refactor with confidence and catch regressions before they reach users.

**Context:**
Currently, only `cache-utils.js` has tests (implemented in FALTMAP-07). To ensure reliability and enable safe refactoring, we need test coverage for `geocoder.js`, `dom-parser.js`, and the newly created `MapModal.js` (from FALTMAP-08). This ticket establishes a solid testing foundation for the entire codebase.

**Priority:** 🟡 High

**Technical Debt Reference:** DEBT-04 in `docs/REFACTORING_ANALYSIS.md`

**Scope of Work:**

1.  **Create Test Suite for `geocoder.js`:**
    -   **File to Create:** `tests/geocoder.test.js`
    -   **Test Cases:**
        -   Address variation generation for Vienna addresses
        -   Rate limiting enforcement (verify 1-second delay between calls)
        -   Successful geocoding with API response
        -   Failed geocoding with API error
        -   Retry logic for transient failures
        -   Cache hit scenario (no API call made)
        -   Batch geocoding with progress callbacks
    -   **Mocking Strategy:** Mock `fetch` API and `setTimeout` for rate limiting tests

2.  **Create Test Suite for `dom-parser.js`:**
    -   **File to Create:** `tests/dom-parser.test.js`
    -   **Test Cases:**
        -   Parse restaurant data from valid HTML
        -   Handle missing fields gracefully (name, address, etc.)
        -   Extract pagination info (current page, total pages)
        -   Detect "no pagination" scenario
        -   Handle malformed HTML without crashing
        -   Parse empty results list
        -   Extract all restaurant fields (name, address, cuisine, price)
    -   **Test Data:** Create sample HTML fixtures in `tests/fixtures/`

3.  **Create Test Suite for `MapModal.js` (after FALTMAP-08):**
    -   **File to Create:** `tests/map-modal.test.js`
    -   **Test Cases:**
        -   Modal creation and DOM injection
        -   Modal show/hide functionality
        -   Progress bar updates with correct percentages
        -   Status message updates (info, success, error states)
        -   Marker addition with correct numbering
        -   Restaurant selection highlighting
        -   Cleanup on destroy (no memory leaks)
        -   Multiple show/hide cycles work correctly
    -   **Mocking Strategy:** Mock Leaflet.js map instance

4.  **Update Test Runner:**
    -   **File to Modify:** `tests/test-runner.html`
    -   **Changes:**
        -   Add links to run each test suite individually
        -   Add "Run All Tests" button that executes all suites
        -   Display aggregate pass/fail statistics
        -   Improve styling for better readability

5.  **Create Test Utilities:**
    -   **File to Create:** `tests/test-utils.js`
    -   **Content:**
        -   Shared assertion library
        -   Mock helpers for Chrome APIs
        -   Mock helpers for Leaflet
        -   Test fixture loaders
        -   Async test helpers

6.  **Documentation:**
    -   **File to Modify:** `README.md`
    -   Add "Running Tests" section with instructions

**Acceptance Criteria (AC):**
- [ ] `tests/geocoder.test.js` is created with all specified test cases
- [ ] `tests/dom-parser.test.js` is created with all specified test cases
- [ ] `tests/map-modal.test.js` is created with all specified test cases
- [ ] `tests/test-utils.js` is created with shared test utilities
- [ ] All geocoder tests pass (minimum 7 test cases)
- [ ] All dom-parser tests pass (minimum 7 test cases)
- [ ] All map-modal tests pass (minimum 8 test cases)
- [ ] Test coverage target: 80% line coverage for all critical modules (Gemini recommendation)
- [ ] Test runner is updated to execute all test suites
- [ ] Test runner displays aggregate pass/fail statistics
- [ ] HTML fixtures are created in `tests/fixtures/` directory
- [ ] README.md includes "Running Tests" section
- [ ] All tests can be run at `chrome-extension://<ID>/tests/test-runner.html`
- [ ] No test failures in any suite
- [ ] The commit message follows the format: `test: expand coverage to geocoder, dom-parser, and map-modal`
- [ ] The ticket is moved to the "Done" section in this document

---

### 🎟️ **TICKET: FALTMAP-11 - Implement User-Facing Error Notification System**
- Epic: E03
- Status: Open
- Story Points: 5

**User Story:**
As a user, I want to see clear, actionable error messages when something goes wrong so that I understand what happened and what I can do about it.

**Context:**
Currently, errors (network failures, API rate limits, geocoding failures) fail silently to the console. Users have no visibility into problems, leading to confusion when the map doesn't show expected results. This ticket implements a user-facing notification system with different severity levels and actionable messages.

**Priority:** 🔴 Critical

**Technical Debt Reference:** DEBT-03 in `docs/REFACTORING_ANALYSIS.md`

**Scope of Work:**

1.  **Create Error Handler Module:**
    -   **File to Create:** `modules/error-handler.js`
    -   **Responsibilities:**
        -   Display toast notifications for non-critical errors
        -   Display modal alerts for critical failures
        -   Queue multiple notifications
        -   Auto-dismiss after timeout (configurable)
        -   Provide retry mechanisms where applicable
    -   **Public API:**
        ```javascript
        export class ErrorHandler {
            static showToast(message, options) // { duration, type: 'error'|'warning'|'info' }
            static showAlert(message, options) // { title, actions: [{ label, callback }] }
            static showGeocodingError(failedCount, totalCount)
            static showNetworkError(retryCallback)
            static showRateLimitError(waitSeconds)
            static dismissAll()
        }
        ```

2.  **Create Notification UI Styles:**
    -   **File to Modify:** `content.css`
    -   **Add Styles for:**
        -   Toast notification container (bottom-right)
        -   Toast notification (slide-in animation)
        -   Toast variants (error, warning, info)
        -   Alert modal (overlay + centered dialog)
        -   Alert action buttons

3.  **Integrate Error Handling in Geocoder:**
    -   **File to Modify:** `modules/geocoder.js`
    -   **Changes:**
        -   Wrap API calls in try-catch blocks
        -   Call `ErrorHandler.showNetworkError()` on network failure
        -   Call `ErrorHandler.showRateLimitError()` on 429 responses
        -   Call `ErrorHandler.showToast()` for individual address failures
        -   Provide summary error at end: "X of Y restaurants couldn't be located"

4.  **Integrate Error Handling in DOM Parser:**
    -   **File to Modify:** `modules/dom-parser.js`
    -   **Changes:**
        -   Call `ErrorHandler.showToast()` when pagination fails to fetch
        -   Call `ErrorHandler.showAlert()` if no restaurants found unexpectedly

5.  **Integrate Error Handling in MapModal:**
    -   **File to Modify:** `modules/MapModal.js` (requires FALTMAP-08)
    -   **Changes:**
        -   Call `ErrorHandler.showAlert()` if Leaflet map fails to initialize
        -   Display inline error state in results list for failed geocoding

6.  **User-Friendly Error Messages:**
    -   **Create:** `modules/error-messages.js`
    -   **Content:** Centralized error message templates with placeholders
    -   **Examples:**
        -   "Unable to connect to geocoding service. Check your internet connection."
        -   "Geocoding service is rate-limited. Waiting {seconds} seconds..."
        -   "{count} of {total} addresses couldn't be located. This is normal for unusual address formats."
        -   "Map failed to load. Please refresh the page and try again."

7.  **Manual Testing Checklist:**
    -   [ ] Simulate network failure → user sees network error with retry option
    -   [ ] Trigger API rate limit (rapid requests) → user sees rate limit message
    -   [ ] Some addresses fail to geocode → user sees summary toast at end
    -   [ ] All addresses fail → user sees prominent error alert
    -   [ ] Multiple errors queue correctly (don't overlap)
    -   [ ] Toasts auto-dismiss after 5 seconds
    -   [ ] Alerts remain until user dismisses
    -   [ ] Error styling is consistent with extension design

**Acceptance Criteria (AC):**
- [ ] `modules/error-handler.js` is created with the specified public API
- [ ] `modules/error-messages.js` is created with centralized error templates
- [ ] Toast notification system is implemented and styled in `content.css`
- [ ] Alert modal system is implemented and styled in `content.css`
- [ ] `geocoder.js` integrates error handling for network and API failures
- [ ] `dom-parser.js` integrates error handling for parsing failures
- [ ] `MapModal.js` integrates error handling for map initialization failures
- [ ] All error messages are user-friendly and actionable (no technical jargon)
- [ ] Toasts auto-dismiss after 5 seconds (configurable)
- [ ] Alerts require explicit user dismissal
- [ ] Multiple toasts queue correctly (stack vertically)
- [ ] Manual testing checklist is completed with all items passing
- [ ] Errors no longer fail silently to console (all user-facing)
- [ ] Network error provides retry mechanism
- [ ] Geocoding summary error shows X/Y format
- [ ] The commit message follows the format: `feat: implement user-facing error notification system`
- [ ] The ticket is moved to the "Done" section in this document

---

### 🎟️ **TICKET: FALTMAP-12 - Implement Virtual Scrolling for Large Result Lists**
- Epic: E04
- Status: Open
- Story Points: 8

**User Story:**
As a user viewing 500+ restaurant results, I want the results list to scroll smoothly without lag so that I can browse efficiently.

**Context:**
When displaying 100+ restaurants, rendering all list items causes UI lag and high memory usage. Virtual scrolling (rendering only visible items + buffer) significantly improves performance for large datasets. This is especially important for searches that span multiple districts or have broad criteria.

**Priority:** 🟢 Medium

**Scope of Work:**

1.  **Create Virtual Scroll Module:**
    -   **File to Create:** `modules/virtual-scroll.js`
    -   **Responsibilities:**
        -   Calculate visible item range based on scroll position
        -   Render only visible items + buffer (e.g., 20 above/below)
        -   Update rendered items on scroll
        -   Maintain scroll position consistency
        -   Handle item height variations
    -   **Public API:**
        ```javascript
        export class VirtualScroll {
            constructor(container, items, renderItem, options)
            render()
            scrollToIndex(index)
            updateItems(items)
            destroy()
        }
        ```

2.  **Integrate into MapModal:**
    -   **File to Modify:** `modules/MapModal.js`
    -   **Changes:**
        -   Replace static results list rendering with `VirtualScroll`
        -   Pass restaurant render function to VirtualScroll
        -   Update scroll handling to work with virtual scrolling
        -   Ensure `scrollToIndex()` works for restaurant selection

3.  **Performance Benchmarking:**
    -   **Create:** `tests/performance/benchmark.html`
    -   **Tests:**
        -   Measure render time: 50, 100, 500, 1000 restaurants
        -   Measure memory usage before/after virtual scrolling
        -   Measure scroll FPS (frames per second)
    -   **Target:** <100ms initial render for 1000 items, 60 FPS scrolling

4.  **Handle Edge Cases:**
    -   Empty results list
    -   Single item
    -   Very tall items (addresses with multiple lines)
    -   Rapid scrolling
    -   Programmatic scrollToIndex during navigation

5.  **Manual Testing Checklist:**
    -   [ ] Load 500+ restaurants → smooth initial render
    -   [ ] Scroll through list → smooth 60 FPS scrolling
    -   [ ] Click restaurant in middle → correct restaurant zoomed
    -   [ ] Use arrow key navigation → list scrolls to keep selected item visible
    -   [ ] Verify no "white space" flashing during scroll
    -   [ ] Test with empty results → graceful handling
    -   [ ] Test with 1 restaurant → no errors

**Acceptance Criteria (AC):**
- [ ] `modules/virtual-scroll.js` is created with the specified public API
- [ ] VirtualScroll renders only visible items + buffer (configurable)
- [ ] `MapModal.js` integrates VirtualScroll for results list
- [ ] Initial render time for 1000 items is <100ms (measured)
- [ ] Scrolling maintains 60 FPS (measured with performance tools)
- [ ] Memory usage is significantly reduced vs. full rendering (measured)
- [ ] `scrollToIndex()` works correctly for keyboard navigation
- [ ] Performance benchmark page created and passing targets
- [ ] Manual testing checklist is completed with all items passing
- [ ] No visual glitches during scrolling (no white space flashing)
- [ ] Edge cases (empty, single item) handled gracefully
- [ ] The commit message follows the format: `perf: implement virtual scrolling for large result lists`
- [ ] The ticket is moved to the "Done" section in this document

---

### 🎟️ **TICKET: FALTMAP-13 - Add Marker Clustering for Dense Map Areas**
- Epic: E04
- Status: Open
- Story Points: 5

**User Story:**
As a user viewing restaurants in dense areas like Innere Stadt, I want overlapping markers to be grouped into clusters so that I can see individual markers clearly when zoomed out and individual restaurants when zoomed in.

**Context:**
Vienna's 1st district often has 50+ restaurants in a small area, causing marker overlap and making individual pins unclickable. Marker clustering groups nearby markers at low zoom levels and splits them apart as the user zooms in, providing a much better user experience.

**Priority:** 🟢 Medium

**Scope of Work:**

1.  **Add Leaflet.markercluster Library:**
    -   **File to Download:** `leaflet.markercluster.js` and `leaflet.markercluster.css`
    -   **Source:** https://github.com/Leaflet/Leaflet.markercluster
    -   **Action:** Download latest stable version and add to extension root

2.  **Update Manifest:**
    -   **File to Modify:** `manifest.json`
    -   **Changes:**
        -   Add `leaflet.markercluster.js` to content_scripts.js array
        -   Add `leaflet.markercluster.css` to content_scripts.css array

3.  **Integrate Clustering in MapModal:**
    -   **File to Modify:** `modules/MapModal.js`
    -   **Changes:**
        -   Create `L.markerClusterGroup()` instead of individual markers
        -   Add markers to cluster group instead of map directly
        -   Configure cluster options (max cluster radius, spiderfy on click)
        -   Preserve marker click handlers
        -   Preserve marker animations for new pins

4.  **Configure Clustering Behavior:**
    -   **Settings in constants.js:**
        ```javascript
        MAP: {
            CLUSTER: {
                MAX_RADIUS: 80,        // pixels
                SPIDERFY: true,        // spread out overlapping markers
                DISABLE_AT_ZOOM: 18,   // disable clustering at max zoom
                SHOW_COVERAGE: false   // don't show cluster coverage polygon
            }
        }
        ```

5.  **Style Cluster Icons:**
    -   **File to Modify:** `content.css`
    -   **Add Styles:**
        -   Custom cluster icon (circle with count)
        -   Color-code by size (small: green, medium: yellow, large: red)
        -   Smooth transitions

6.  **Manual Testing Checklist:**
    -   [ ] Search for Innere Stadt restaurants → markers clustered
    -   [ ] Zoom out → more markers cluster together
    -   [ ] Zoom in → clusters split into individual markers
    -   [ ] Click cluster → map zooms to cluster bounds
    -   [ ] At max zoom → no clustering, all individual markers
    -   [ ] Marker click handlers still work
    -   [ ] New marker animations still work
    -   [ ] Performance with 500+ markers is acceptable

**Acceptance Criteria (AC):**
- [ ] `leaflet.markercluster.js` library is added to the extension
- [ ] `leaflet.markercluster.css` is added and styled
- [ ] `manifest.json` includes marker cluster library
- [ ] `MapModal.js` uses `L.markerClusterGroup()` for markers
- [ ] Clustering configuration is centralized in `constants.js`
- [ ] Cluster icons are styled with color-coded sizes
- [ ] Click on cluster zooms to show individual markers
- [ ] At maximum zoom, clustering is disabled
- [ ] All marker click handlers continue to work
- [ ] New marker animations are preserved
- [ ] Manual testing checklist is completed with all items passing
- [ ] Performance with 500+ markers is smooth (60 FPS)
- [ ] The commit message follows the format: `feat: add marker clustering for dense map areas`
- [ ] The ticket is moved to the "Done" section in this document

---

### 🎟️ **TICKET: FALTMAP-14 - Optimize Extension Bundle Size**
- Epic: E04
- Status: Open
- Story Points: 2

**User Story:**
As a user installing the extension, I want it to load quickly so that I can start using it without delay.

**Context:**
The extension currently includes Leaflet.js (147KB unminified) directly. By optimizing the bundle size through minification, CDN usage, or tree-shaking, we can reduce load times and improve the user experience during installation and updates.

**Priority:** 🟢 Low

**Scope of Work:**

1.  **Analyze Current Bundle Size:**
    -   **Create:** `scripts/analyze-bundle.js`
    -   **Action:** Calculate total extension size and identify largest files
    -   **Document:** Current sizes in a baseline report

2.  **Option A: Use CDN for Leaflet (Recommended):**
    -   **File to Modify:** `manifest.json`
    -   **Changes:**
        -   Remove local `leaflet.js` and `leaflet.css`
        -   Add CDN URLs to content_scripts
        -   Update CSP to allow Leaflet CDN
    -   **Trade-offs:**
        -   ✅ Reduces extension size by ~150KB
        -   ✅ Browser can cache Leaflet across sites
        -   ❌ Requires internet connection
        -   ❌ External dependency

3.  **Option B: Minify and Bundle (Alternative):**
    -   **Action:** Use Rollup or Webpack to:
        -   Minify all JavaScript files
        -   Tree-shake unused Leaflet features
        -   Combine modules into optimized bundles
    -   **Trade-offs:**
        -   ✅ No external dependencies
        -   ✅ Works offline
        -   ❌ More complex build process
        -   ❌ Only ~30% size reduction

4.  **Decision Matrix:**
    -   **Create:** `docs/BUNDLE_OPTIMIZATION.md`
    -   **Content:** Compare options with size impact, pros/cons
    -   **Recommendation:** Likely Option A (CDN) for simplicity

5.  **Implementation:**
    -   Implement chosen option (A or B)
    -   Test extension loading speed before/after
    -   Verify all functionality works identically

6.  **Update Documentation:**
    -   **File to Modify:** `README.md`
    -   Note if using CDN (requires internet connection)

**Acceptance Criteria (AC):**
- [ ] Bundle size analysis script is created
- [ ] Baseline bundle size is documented
- [ ] Decision matrix document is created with recommendation
- [ ] Chosen optimization strategy is implemented
- [ ] Extension size is reduced by at least 100KB
- [ ] All functionality works identically after optimization
- [ ] Extension loads faster (measured and documented)
- [ ] README.md is updated with any new requirements (e.g., internet for CDN)
- [ ] Manual smoke test: all features work correctly
- [ ] The commit message follows the format: `perf: optimize bundle size with [CDN|minification]`
- [ ] The ticket is moved to the "Done" section in this document

---

### 🎟️ **TICKET: FALTMAP-15 - Add Filter/Search Functionality in Results List**
- Epic: E05
- Status: Open
- Story Points: 5

**User Story:**
As a user viewing 200+ restaurants, I want to filter or search the results by name or cuisine so that I can quickly find specific restaurants of interest.

**Context:**
When searches return many results, manually scrolling through the list is tedious. Adding a filter/search input at the top of the results list allows users to quickly narrow down results, improving usability for large result sets.

**Priority:** 🟢 Medium

**Scope of Work:**

1.  **Add Search Input to Modal UI:**
    -   **File to Modify:** `modules/MapModal.js`
    -   **Changes:**
        -   Add search input field at top of results list
        -   Add clear button (×) in search input
        -   Add placeholder text: "Search by name or cuisine..."

2.  **Implement Filter Logic:**
    -   **File to Modify:** `modules/MapModal.js`
    -   **Functionality:**
        -   Filter restaurants by name (case-insensitive)
        -   Filter restaurants by cuisine (case-insensitive)
        -   Update visible restaurants in real-time as user types
        -   Update map markers to show only filtered restaurants
        -   Show count: "Showing X of Y restaurants"

3.  **Add Filter State Management:**
    -   Track current filter query
    -   Track filtered restaurant list
    -   Update navigation to work with filtered list (arrow keys)
    -   Reset filter when modal is closed

4.  **Style Search Input:**
    -   **File to Modify:** `content.css`
    -   **Styles:**
        -   Prominent search box with icon
        -   Clear button styling
        -   Smooth transitions
        -   Match existing modal design

5.  **Handle Edge Cases:**
    -   No results match filter → show "No matches found"
    -   Empty filter → show all results
    -   Filter while navigating with keyboard → maintain selection
    -   Clear button resets filter instantly

6.  **Manual Testing Checklist:**
    -   [ ] Type in search box → results filter in real-time
    -   [ ] Search for cuisine (e.g., "italian") → correct results shown
    -   [ ] Search for partial name → matching restaurants shown
    -   [ ] Map markers update to match filtered results
    -   [ ] Arrow key navigation works with filtered list
    -   [ ] Clear button (×) resets filter
    -   [ ] "No matches found" shown for zero results
    -   [ ] Counter shows "Showing X of Y restaurants"

**Acceptance Criteria (AC):**
- [ ] Search input is added at top of results list in modal
- [ ] Search filters by restaurant name (case-insensitive, partial match)
- [ ] Search filters by cuisine type (case-insensitive, partial match)
- [ ] Filtered results update in real-time as user types
- [ ] Map markers are filtered to match visible results
- [ ] Counter displays "Showing X of Y restaurants" format
- [ ] Clear button (×) resets filter immediately
- [ ] "No matches found" message shown for zero results
- [ ] Arrow key navigation works with filtered list
- [ ] Filter state resets when modal closes
- [ ] Search input styling matches modal design
- [ ] Manual testing checklist is completed with all items passing
- [ ] Performance is smooth with real-time filtering (no lag)
- [ ] The commit message follows the format: `feat: add filter/search functionality in results list`
- [ ] The ticket is moved to the "Done" section in this document

---

### 🎟️ **TICKET: FALTMAP-16 - Add Save Favorites Feature**
- Epic: E05
- Status: Open
- Story Points: 8

**User Story:**
As a frequent user, I want to save my favorite restaurants so that I can quickly access them in future searches without remembering their names.

**Context:**
Power users who regularly search for Vienna restaurants would benefit from a favorites system. This feature allows users to star/bookmark restaurants, which are then persisted in chrome.storage and displayed prominently in future searches. This increases user engagement and personalizes the experience.

**Priority:** 🟢 Low

**Scope of Work:**

1.  **Create Favorites Manager Module:**
    -   **File to Create:** `modules/favorites-manager.js`
    -   **Responsibilities:**
        -   Load favorites from chrome.storage
        -   Save/remove favorites
        -   Check if restaurant is favorited
        -   Export favorites list
    -   **Storage Format:**
        ```javascript
        {
            favorites: {
                'restaurant-id-or-hash': {
                    name: 'Restaurant Name',
                    address: 'Address',
                    addedAt: timestamp
                }
            }
        }
        ```

2.  **Add Star Button to Restaurant List Items:**
    -   **File to Modify:** `modules/MapModal.js`
    -   **Changes:**
        -   Add star icon (☆/★) to each restaurant item
        -   Toggle star on click
        -   Persist state via FavoritesManager
        -   Show favorited restaurants with filled star (★)

3.  **Add Favorites Filter Tab:**
    -   **File to Modify:** `modules/MapModal.js`
    -   **Changes:**
        -   Add tabs: "All Results" | "Favorites Only"
        -   Clicking "Favorites Only" shows only starred restaurants
        -   Show count: "X favorites"

4.  **Add Favorites Management in Popup:**
    -   **File to Modify:** `popup.html` and `popup.js`
    -   **Changes:**
        -   Add "Favorites" section
        -   List all favorited restaurants
        -   Allow removing favorites from popup
        -   Show "No favorites yet" if empty

5.  **Add Favorites Marker Style:**
    -   **File to Modify:** `content.css`
    -   **Changes:**
        -   Give favorited restaurant markers a different color (e.g., gold)
        -   Or add a small star badge to favorited markers

6.  **Generate Unique Restaurant IDs:**
    -   **Strategy:** Hash of normalized name + address
    -   Handles duplicate names across locations
    -   Stable across sessions

7.  **Manual Testing Checklist:**
    -   [ ] Click star on restaurant → saved to favorites
    -   [ ] Click star again → removed from favorites
    -   [ ] Star state persists after closing modal
    -   [ ] Open popup → favorites list shown
    -   [ ] Remove favorite from popup → removed everywhere
    -   [ ] Click "Favorites Only" tab → only favorites shown
    -   [ ] Favorited markers have distinct styling
    -   [ ] Favorites survive browser restart
    -   [ ] Test with 50+ favorites (performance)

**Acceptance Criteria (AC):**
- [ ] `modules/favorites-manager.js` is created with CRUD operations
- [ ] Star icon (☆/★) is added to each restaurant list item
- [ ] Clicking star toggles favorite state and persists via chrome.storage
- [ ] "Favorites Only" filter tab is added to modal
- [ ] Favorites filter correctly shows only favorited restaurants
- [ ] Popup displays list of all favorited restaurants
- [ ] Favorites can be removed from popup
- [ ] Favorited markers have distinct visual styling (color or badge)
- [ ] Restaurant IDs are stable (hash-based) across sessions
- [ ] Favorite state persists after browser restart
- [ ] Manual testing checklist is completed with all items passing
- [ ] Performance with 50+ favorites is acceptable
- [ ] "No favorites yet" state handled gracefully
- [ ] The commit message follows the format: `feat: add save favorites feature`
- [ ] The ticket is moved to the "Done" section in this document

---

### 🎟️ **TICKET: FALTMAP-17 - Add Export Results to CSV/JSON**
- Epic: E05
- Status: Open
- Story Points: 3

**User Story:**
As a power user, I want to export current search results to CSV or JSON so that I can analyze the data externally or share it with others.

**Context:**
Some users may want to perform custom analysis on restaurant data, create custom maps in other tools, or share curated lists. Providing an export feature adds value for power users and data enthusiasts without adding complexity for casual users.

**Priority:** 🟢 Low

**Scope of Work:**

1.  **Add Export Button to Modal:**
    -   **File to Modify:** `modules/MapModal.js`
    -   **Changes:**
        -   Add "Export" button (⬇ icon) in modal header
        -   Clicking opens dropdown: "Export as CSV" | "Export as JSON"

2.  **Implement CSV Export:**
    -   **File to Create:** `modules/export-utils.js`
    -   **Function:** `exportAsCSV(restaurants)`
    -   **Fields:**
        -   Name, Address, Cuisine, Price Range, Coordinates (lat, lng)
        -   Geocoding Status (Success/Failed)
    -   **Format:** UTF-8 with BOM for Excel compatibility
    -   **Filename:** `falter-restaurants-YYYY-MM-DD.csv`

3.  **Implement JSON Export:**
    -   **File to Create:** `modules/export-utils.js`
    -   **Function:** `exportAsJSON(restaurants)`
    -   **Format:**
        ```json
        {
            "exportedAt": "2025-01-28T12:00:00Z",
            "totalCount": 150,
            "restaurants": [...]
        }
        ```
    -   **Filename:** `falter-restaurants-YYYY-MM-DD.json`

4.  **Trigger Browser Download:**
    -   Use `Blob` and `URL.createObjectURL()`
    -   Create temporary `<a>` element with `download` attribute
    -   Programmatically click to trigger download
    -   Clean up object URL after download

5.  **Add Export Button Styling:**
    -   **File to Modify:** `content.css`
    -   Style export button and dropdown menu

6.  **Manual Testing Checklist:**
    -   [ ] Click "Export" button → dropdown appears
    -   [ ] Click "Export as CSV" → CSV file downloads
    -   [ ] Open CSV in Excel → data displays correctly
    -   [ ] CSV includes all restaurants with coordinates
    -   [ ] Click "Export as JSON" → JSON file downloads
    -   [ ] JSON is valid and well-formatted
    -   [ ] Filename includes current date
    -   [ ] Test with 500+ restaurants (performance)

**Acceptance Criteria (AC):**
- [ ] `modules/export-utils.js` is created with export functions
- [ ] "Export" button with dropdown is added to modal header
- [ ] "Export as CSV" triggers CSV download
- [ ] "Export as JSON" triggers JSON download
- [ ] CSV includes headers: Name, Address, Cuisine, Price, Lat, Lng, Status
- [ ] CSV is UTF-8 with BOM (opens correctly in Excel)
- [ ] JSON is valid and includes metadata (exportedAt, totalCount)
- [ ] Filenames include current date in YYYY-MM-DD format
- [ ] Export works correctly with 500+ restaurants
- [ ] Manual testing checklist is completed with all items passing
- [ ] Export button styling matches modal design
- [ ] No memory leaks (object URLs cleaned up)
- [ ] The commit message follows the format: `feat: add export results to CSV/JSON`
- [ ] The ticket is moved to the "Done" section in this document
---

## 📋 Gemini Review Insights (2026-01-29)

This section documents key insights from Gemini's comprehensive review of the implementation plan, filtered through a KISS (Keep It Simple, Stupid) lens appropriate for a Chrome extension.

### ✅ Validated Approach

Gemini's review confirmed:
- **Strong Foundation:** Engineering principles (CLAUDE.md) and modular architecture are sound
- **Sprint 2 Scope:** 16 story points is reasonable and well-structured
- **Story Points:** Current estimates are accurate (with minor adjustments)
- **Ticket Template:** Comprehensive and excellent for consistency
- **Architecture Direction:** Coordinator pattern with service modules is correct

### 🎯 Key Recommendations Adopted

#### **1. Sprint 2 Sequencing (Critical)**
- FALTMAP-08 MUST complete first before FALTMAP-09 and FALTMAP-11
- Both tickets have implicit dependencies on MapModal.js
- Working out of order causes inefficiency and rework

#### **2. Sprint 3 Priority**
Recommended order (see Sprint 3 section above):
1. FALTMAP-10: Testing (provides safety net)
2. FALTMAP-13: Marker Clustering (critical UX fix)
3. FALTMAP-12: Virtual Scrolling (performance optimization)

**Justification:** Testing first enables confident development. Clustering addresses the #1 UX pain point. Virtual scrolling complements clustering for complete performance optimization.

#### **3. MapModal API Refinement**
- Added `onMarkerClick(callback)` to MapModal public API
- Enables synchronization between map clicks and results list
- See FALTMAP-08 for details

#### **4. Leaflet Memory Leak Warning**
- FALTMAP-08 acceptance criteria now includes explicit cleanup verification
- `destroy()` must call `map.remove()` and clean up all event listeners
- Test with Chrome DevTools Memory tab

#### **5. Test Coverage Target**
- Aim for 80% line coverage for critical modules
- Focus on meaningful coverage (logic paths, branches, error conditions)
- See FALTMAP-10 for details

#### **6. UX Priority Ranking**
Based on user impact and addressing fundamental issues:
1. **Marker Clustering (FALTMAP-13)** - Makes map usable in dense areas
2. **Error Notifications (FALTMAP-11)** - Builds user trust and transparency
3. **Virtual Scrolling (FALTMAP-12)** - Smooth performance with large datasets
4. **Filter/Search (FALTMAP-15)** - Convenience feature for efficiency

**Rationale:** Foundation first (clustering, errors) before convenience features (filtering).

### ⚠️ Architecture Warnings

#### **Avoid Premature Complexity:**
- **No EventBus/PubSub yet:** Direct method calls are simpler for 3-4 modules. Only add if coordination becomes painful.
- **No Redux/Zustand:** Overkill for a Chrome extension. Vanilla JS with clear APIs is sufficient.
- **Watch MapModal complexity:** If it exceeds 500 lines, consider subdividing into smaller components.
- **Monitor content.js:** Should remain a coordinator. If it becomes a "god object," reassess architecture.

#### **When to Add Complexity:**
Only introduce EventBus/PubSub or state management if:
1. Global state becomes deeply nested and hard to trace
2. Many components need to react to identical state changes simultaneously
3. Debugging state-related issues becomes excessively time-consuming

**Philosophy:** Wait for pain, don't add before you need it.

---

## 🚫 Deferred Considerations (KISS Filter Applied)

The following recommendations from Gemini are **deferred** as they add complexity without proportional value for a Chrome extension. Document here for future reference if needs change.

### **Not Adding Now:**

#### **1. Internationalization (i18n) - Deferred**
- **What:** FALTMAP-18: Implement i18n framework (5 pts)
- **Why Deferred:** Vienna-only extension, German UI. No user demand for other languages.
- **When to Reconsider:** If expanding to other cities or receiving language requests.
- **KISS Verdict:** YAGNI (You Aren't Gonna Need It)

#### **2. Full ARIA/Accessibility - Deferred**
- **What:** FALTMAP-19: Full ARIA attributes and screen reader support (5 pts)
- **Why Deferred:** Keyboard navigation (FALTMAP-09) covers 80% of accessibility needs.
- **When to Reconsider:** If receiving accessibility complaints or legal requirements.
- **KISS Verdict:** Keyboard nav is sufficient for now. Don't over-engineer.

#### **3. Security Audit Ticket - Deferred**
- **What:** FALTMAP-20: XSS/content injection audit (3 pts)
- **Why Deferred:** Scraping from trusted source (Falter.at). Low risk. Can do quick review without full ticket.
- **When to Reconsider:** If scraping untrusted sources or user-generated content.
- **KISS Verdict:** Quick review sufficient, not full ticket.

#### **4. EventBus/PubSub Pattern - Deferred**
- **What:** Central event bus for module communication
- **Why Deferred:** Direct method calls are simpler and more debuggable for 3-4 modules.
- **When to Reconsider:** If coordination becomes fragile or state management painful.
- **KISS Verdict:** Wait for actual pain. Don't add indirection prematurely.

#### **5. Jest Migration - Deferred**
- **What:** FALTMAP-24: Migrate from HTML tests to Jest (3 pts)
- **Why Deferred:** HTML tests work fine. Jest adds Node.js dependency and build complexity.
- **When to Reconsider:** If HTML tests become truly unwieldy or CI integration needed.
- **KISS Verdict:** Continue HTML tests. Simple and sufficient.

#### **6. E2E Testing - Deferred**
- **What:** FALTMAP-25: Playwright/Cypress E2E tests (8 pts)
- **Why Deferred:** Manual testing is fast and sufficient for a small extension. 8 pts is huge overhead.
- **When to Reconsider:** If frequent regressions occur or team grows.
- **KISS Verdict:** Manual testing sufficient. Don't over-test.

#### **7. Split FALTMAP-16 (Favorites) - Not Doing**
- **What:** Split into two tickets (5 pts + 3 pts)
- **Why Not:** 8 pts is manageable. Splitting creates ticket overhead.
- **KISS Verdict:** Keep as one cohesive ticket.

#### **8. Bundle Optimization (FALTMAP-14) - Very Low Priority**
- **What:** Optimize extension size (2 pts)
- **Why Low Priority:** Extensions download once. 150KB Leaflet is not a real problem.
- **When to Reconsider:** If users complain about load times (unlikely).
- **KISS Verdict:** Nice-to-have, not urgent.

### **New Epics NOT Created:**
- **E06: Internationalization & Localization** - No tickets to fill it
- **E08: Security & Privacy** - Handled with quick reviews, not full tickets

---

## 🎯 Post-Gemini Review Summary

### **What Changed:**
✅ Added Sprint 2 sequencing guidance (FALTMAP-08 first!)
✅ Added Sprint 3 recommendations (Testing → Clustering → Virtual Scroll)
✅ Refined MapModal API with `onMarkerClick(callback)`
✅ Added Leaflet memory leak warnings to FALTMAP-08
✅ Added 80% test coverage target to FALTMAP-10
✅ Documented UX priority ranking for future reference
✅ Documented architecture warnings (avoid premature complexity)

### **What We Kept Simple:**
❌ No new tickets for i18n, full ARIA, security audit, Jest, E2E
❌ No EventBus/PubSub architecture (yet)
❌ No Redux/Zustand state management
❌ No splitting FALTMAP-16
❌ No new Epics E06, E08

### **Philosophy:**
This is a Chrome extension for Vienna restaurants, not an enterprise SaaS platform. We adopt Gemini's strategic wisdom while maintaining KISS principles appropriate for:
- Solo developer + AI assistance
- Small, focused use case
- Quality over complexity
- Ship features users want
- Add complexity only when pain is felt

### **Total Backlog:**
- **Sprint 2:** 16 story points (3 tickets)
- **Sprint 3 (Recommended):** 18 story points (3 tickets)
- **Remaining Backlog:** 36 story points (7 tickets)
- **Grand Total:** 70 story points across ~5-6 sprints

---

**Last Updated:** 2026-01-29 (Post-Gemini Review with KISS Filter)
