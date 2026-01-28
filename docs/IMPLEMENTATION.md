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

---

## Backlog

### 🎟️ **TICKET: FALTMAP-04 - Implement Event Delegation for Restaurant List**
- Epic: E01
- Status: Open

**Objective:** To improve performance and reduce memory usage by replacing multiple event listeners with a single delegated listener on the parent container.
**Priority:** 🟡 High

**Scope of Work:**
1.  **File to Modify:** `content.js`
    - Action: Locate the `updateResultsList` function. Inside the loop that creates each `item`, **remove** the entire `item.addEventListener('click', ...)` block.
    - Action: In the `createModal` function, after the `resultsEl` is created, add a *single* click event listener to it.
    - Action: The listener's logic should check if the clicked element's ancestor matches a result item, determine its index, and call `selectRestaurant(index)`.

**Acceptance Criteria (AC):**
- [ ] The `item.addEventListener('click', ...)` block is removed from the loop in `updateResultsList`.
- [ ] A single `click` listener is attached to the results list's parent element.
- [ ] Clicking a restaurant item in the list still correctly highlights it and pans the map.
- [ ] The commit message follows the format: `refactor(perf): use event delegation for results list`
- [ ] The ticket is moved to the "Done" section in this document.

### 🎟️ **TICKET: FALTMAP-05 - Cache DOM Element Queries in Variables**
- Epic: E01
- Status: Open

**Objective:** To improve rendering performance by querying for frequently-used DOM elements once and storing their references.
**Priority:** 🟡 High

**Scope of Work:**
1.  **File to Modify:** `content.js`
    - Action: Create a shared object (e.g., `dom`) to hold DOM element references.
    - Action: In `createModal`, populate this `dom` object by finding each key element *once*.
    - Action: Replace all `document.getElementById(...)` calls in helper functions with direct references from the `dom` object.
    - Action: In `closeModal`, reset the `dom` object's properties to `null`.

**Acceptance Criteria (AC):**
- [ ] Repeated `document.getElementById` calls are removed from helper functions.
- [ ] A central `dom` object is used to reference modal elements.
- [ ] The modal UI continues to update correctly.
- [ ] The commit message follows the format: `refactor(perf): cache DOM element queries`
- [ ] The ticket is moved to the "Done" section in this document.

### 🎟️ **TICKET: FALTMAP-06 - Implement Visual Progress Bar**
- Epic: E01
- Status: Open

**Objective:** To enhance user experience with a more intuitive visual progress bar during geocoding.
**Priority:** 🟢 Medium

**Scope of Work:**
1.  **File to Modify:** `content.js`
    - Action: In `createModal`, add the HTML for the progress bar structure.
    - Action: In `updateGeocodeProgress`, add logic to update the width of the progress bar element based on the percentage of completion.
2.  **File to Modify:** `content.css`
    - Action: Add the CSS rules for the new progress bar elements as defined in the analysis.

**Acceptance Criteria (AC):**
- [ ] The progress bar HTML is present in the modal.
- [ ] The progress bar CSS is added to `content.css`.
- [ ] During geocoding, a visual bar fills up in the UI.
- [ ] The status text (e.g., "15/50 located") is still visible.
- [ ] The commit message follows the format: `feat: add visual progress bar for geocoding`
- [ ] The ticket is moved to the "Done" section in this document.

### 🎟️ **TICKET: FALTMAP-07 - Introduce Basic Testing Strategy for Critical Modules**
- Epic: E01
- Status: Open

**Objective:** To improve reliability and reduce manual testing effort by implementing a lightweight testing strategy for critical modules.
**Priority:** 🟡 High

**Scope of Work:**
1.  **File to Create:** `tests/cache-utils.test.js`
    - Action: Create this file.
    - Action: Implement basic unit tests for `modules/cache-utils.js` focusing on `load()`, `save()`, `clear()`, and `getStats()` methods.
2.  **Action:** The tests should be executable directly in the browser console for simplicity (as described in the original `REFACTORING_ANALYSIS.md` "Lightweight testing without build complexity" section).
3.  **Action:** Provide clear instructions on how to run these tests.

**Acceptance Criteria (AC):**
- [ ] `tests/cache-utils.test.js` is created and contains tests for `CacheManager`.
- [ ] The tests can be run in the browser console.
- [ ] The tests cover `load()`, `save()`, `clear()`, and `getStats()`.
- [ ] All tests pass.
- [ ] The commit message follows the format: `feat: introduce basic testing for cache-utils`.
- [ ] The ticket is moved to the "Done" section in this document.