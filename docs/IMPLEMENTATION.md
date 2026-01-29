# Falter Map Implementation Plan

This document tracks the actionable tickets for the Falter Map extension project. It serves as our sprint board and backlog, focused on delivering a minimal, lightweight, and clean v1.0.

- **`docs/REFACTORING_ANALYSIS.md`**: Our long-term architectural guide and technical debt registry.
- **`docs/IMPLEMENTATION.md`**: Our short-term list of tasks to be done for v1.0.

---

## 🎯 v1.0 Philosophy: Minimal, Lightweight, Clean

This project adheres to a strict "Keep It Simple, Stupid" (KISS) philosophy. We are building a Chrome extension, not an enterprise SaaS platform. Our goal is a rock-solid, fast, and easy-to-maintain product that excels at its core function: putting restaurants on a map.

**Principles for v1.0:**
- **Core Functionality First:** Every ticket must directly serve the primary user story.
- **Avoid Premature Complexity:** We will not add architectural layers (build steps, state management libraries, event busses) until the pain of not having them is acute and undeniable.
- **Reject "Nice-to-Have" Features:** Features that serve a small subset of power users (e.g., Export, Favorites) are explicitly out of scope for v1.0.
- **Performance is a Feature:** We will prioritize simple, effective solutions for performance issues over complex, academic ones.

---

## 🏛️ Epics for v1.0

-   **E01: Foundational Refactoring:** ✅ Done
-   **E02: UI Modularization:** ✅ Done
-   **E03: Testing & Reliability:** ✅ Done
-   **E04: Performance & Polish:** 🎯 In Progress
-   **E05: Core Feature Enhancements:** 🎯 In Progress

---

## ✅ Completed Sprints

### Sprint 1 & 2
-   **FALTMAP-01-07:** Foundational refactoring and basic testing.
-   **FALTMAP-08, 09, 11:** UI modularization and error handling.

### Sprint 3 (Partial)
-   **FALTMAP-10:** Comprehensive test suite with 98 tests and 80%+ coverage.

---

## 🎯 Current Sprint: Finalizing Core UX

**Focus:** Complete the essential user experience for v1.0.

### ✅ Complete (1 ticket):

**FALTMAP-13: Add Marker Clustering** ✅
- Dense areas now show clustered markers that split apart on zoom
- Tuned for district-level filtering (MAX_RADIUS: 50, DISABLE_AT_ZOOM: 16)
- Leaflet.markercluster v1.5.3 integrated
- All manual tests passed

---

## 🚀 Final Sprint: Polish & Ship v1.0

**Focus:** Add basic accessibility and prepare for release.

### 📋 In Progress (1 ticket):

### 🎟️ **TICKET: FALTMAP-19 - Implement Basic Accessibility**
- Epic: E05 (Core Feature Enhancements)
- Status: In Progress
- Priority: 🟢 Medium

**User Story:**
As a user with accessibility needs, I want the map modal to be usable with keyboard-only navigation and a screen reader so that I can browse restaurants regardless of my abilities.

**Context:**
The extension currently has keyboard navigation (arrow keys, ESC), but lacks proper ARIA attributes and focus management for screen readers. Basic accessibility is not a "nice-to-have" - it's essential for an inclusive user experience. We need to ensure the modal is announced correctly, interactive elements are labeled, and focus is managed properly.

**Scope of Work:**

1. **Add ARIA Roles to Modal:**
   - Mark modal as `role="dialog"`
   - Add `aria-modal="true"`
   - Add `aria-labelledby` pointing to modal title
   - Add `aria-describedby` for status information

2. **Add ARIA to Results List:**
   - Mark results list as `role="listbox"`
   - Mark each restaurant as `role="option"`
   - Use `aria-selected` for current selection
   - Add `aria-label` for screen reader context

3. **Implement Focus Management:**
   - Trap focus within modal when open
   - Move focus to modal on open
   - Restore focus to trigger button on close
   - Ensure Tab key cycles through interactive elements only

4. **Label Interactive Elements:**
   - Add `aria-label` to close button
   - Add `aria-label` to map container
   - Ensure progress bar has `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
   - Add screen reader announcements for status updates

5. **Ensure Keyboard Accessibility:**
   - Verify all interactive elements are keyboard accessible
   - Ensure visible focus indicators
   - Test Tab navigation flow

**Acceptance Criteria:**
- [ ] Modal has `role="dialog"` and `aria-modal="true"`
- [ ] Modal has `aria-labelledby` pointing to title
- [ ] Results list has `role="listbox"` with options
- [ ] Selected restaurant has `aria-selected="true"`
- [ ] Close button has descriptive `aria-label`
- [ ] Focus moves to modal on open
- [ ] Focus returns to trigger button on close
- [ ] Tab key cycles only through interactive elements (no escape)
- [ ] ESC key closes modal (already working, verify still works)
- [ ] Progress bar has proper ARIA attributes
- [ ] Manual test: Navigate modal with keyboard only (no mouse)
- [ ] Manual test: Screen reader announces modal correctly
- [ ] Manual test: Screen reader announces restaurant selection
- [ ] The commit message follows the format: `feat: add basic accessibility with ARIA and focus management`
- [ ] The ticket is marked Done with all ACs checked

---

## Backlog

### 🎟️ **TICKET: FALTMAP-20 - Refactor Project Structure and Centralize App Logic**
- Epic: E01 (Foundational Refactoring)
- Status: Open
- Priority: 🔴 Critical

**User Story:**
As a developer, I want a clean, intuitive file structure and a central application controller so that the codebase is easy to navigate, and the application logic is clearly separated from the entry point.

**Context:**
Following our architectural review (`REFACTORING_ANALYSIS.md`), we identified that `content.js` is still doing too much orchestration, and several core files live in the root directory. This ticket implements the final structural cleanup to align with our target architecture before v1.0.

**Technical Debt Reference:** DEBT-05, DEBT-06, DEBT-07

**Scope of Work:**

1.  **Reorganize File Structure:**
    -   **Action:** Create the following new directories if they don't exist:
        -   `modules/chrome/`
        -   `modules/ui/`
        -   `modules/utils/`
        -   `vendor/`
        -   `vendor/leaflet/`
    -   **Action:** Move the following files:
        -   `background.js` → `modules/chrome/background.js`
        -   `popup.js` → `modules/chrome/popup.js`
        -   `leaflet.js` → `vendor/leaflet/leaflet.js`
        -   `leaflet.css` → `vendor/leaflet/leaflet.css`

2.  **Update Manifest and HTML Paths:**
    -   **File to Modify:** `manifest.json`
    -   **Changes:**
        -   Update the path for `background.js` script to `modules/chrome/background.js`.
        -   Update the paths for `leaflet.js` and `leaflet.css` to their new locations in `vendor/leaflet/`.
    -   **File to Modify:** `popup.html`
    -   **Changes:**
        -   Update the `<script>` tag's `src` to point to `modules/chrome/popup.js`.

3.  **Create New Controller and UI Modules:**
    -   **File to Create:** `modules/App.js` (Central Application Controller)
    -   **File to Create:** `modules/ui/UIManager.js` (Handles button injection)
    -   **File to Create:** `modules/utils/UserConsent.js` (Handles API confirmation dialog)

4.  **Refactor `content.js` to be a Pure Entry Point:**
    -   **File to Modify:** `content.js`
    -   **Changes:**
        -   Remove ALL logic except for importing and instantiating `App.js`.
        -   The final file should look similar to this:
            ```javascript
            import { App } from './modules/App.js';
            (async function() {
                'use strict';
                if (window.falterMapExtensionLoaded) return;
                window.falterMapExtensionLoaded = true;
                const app = new App();
                app.init();
            })();
            ```

5.  **Implement the New Modules:**
    -   **`modules/App.js`:**
        -   Move the orchestration logic from `handleMapButtonClick` and `startGeocoding` into methods of an `App` class.
        -   Manage `mapModal` and `navigation` as instance properties (`this.mapModal`).
        -   Instantiate and use the new `UIManager` and `UserConsent` modules.
    -   **`modules/ui/UIManager.js`:**
        -   Move the `injectMapButton` function and its related `MutationObserver` logic into this module.
        -   It should accept a callback in its constructor to be fired on button click.
    -   **`modules/utils/UserConsent.js`:**
        -   Create a static method `confirmGeocoding(count)` that contains the `confirm()` dialog logic and returns a Promise.
    -   **`modules/ErrorHandler.js` (or `MapModal.js`):**
        -   Move the "No Restaurants Found" modal creation logic into a new static method, e.g., `ErrorHandler.showEmptyState()`.

**Acceptance Criteria (AC):**
- [ ] New directories (`modules/chrome`, `modules/ui`, `modules/utils`, `vendor`) are created.
- [ ] All specified files (`background.js`, `popup.js`, `leaflet.js`, `leaflet.css`) are moved to their new locations.
- [ ] `manifest.json` is updated with the correct paths for background script and content scripts.
- [ ] `popup.html` is updated with the correct path for its script.
- [ ] New stub files `App.js`, `UIManager.js`, and `UserConsent.js` are created.
- [ ] `content.js` is refactored to be a pure entry point (~10 lines).
- [ ] All application logic is moved from `content.js` to the `App.js` controller.
-   [ ] The `injectMapButton` logic is moved to `UIManager.js`.
-   [ ] The `confirm()` dialog logic is moved to `UserConsent.js`.
-   [ ] The "No Restaurants Found" modal logic is moved to `ErrorHandler.js`.
- [ ] **CRITICAL:** The extension's functionality is identical to before the refactoring. All manual tests pass.
- [ ] The commit message follows the format: `refactor: centralize app logic and reorganize file structure`
- [ ] The ticket is moved to the "Done" section in this document.

---

## 🚫 Deferred / Post-v1.0 Backlog

The following tickets are explicitly **out of scope for v1.0**. They represent good ideas for a future version but violate the "minimal and lightweight" principle for the initial release. They are preserved here for future consideration.

---

### 🎟️ **TICKET: FALTMAP-12 - Implement Virtual Scrolling for Large Result Lists**
- **Status:** 🚫 Deferred
- **Reason:** Over-engineered for the current problem. A simpler pagination approach would be preferred if list performance becomes a real-world issue. Adds too much complexity.

### 🎟️ **TICKET: FALTMAP-15 - Add Filter/Search Functionality in Results List**
- **Status:** 🚫 Deferred
- **Reason:** The Falter website already provides robust filtering capabilities. Adding a secondary filter within the extension's UI is redundant and adds unnecessary complexity for a "map layer" extension focused on displaying pre-filtered results.

### 🎟️ **TICKET: FALTMAP-16 - Add Save Favorites Feature**
- **Status:** 🚫 Deferred
- **Reason:** Classic "v2.0" feature. Introduces significant complexity (storage, UI sync) for a non-core use case.

### 🎟️ **TICKET: FALTMAP-17 - Add Export Results to CSV/JSON**
- **Status:** 🚫 Deferred
- **Reason:** Power-user feature that is not part of the core experience.

### 🎟️ **TICKET: FALTMAP-14 - Optimize Extension Bundle Size**
- **Status:** 🚫 Deferred
- **Reason:** Very low priority. The current bundle size is not a user-facing issue.

### **Other Deferred Architectural Ideas:**
- **Internationalization (i18n):** Defer until there is a clear user need for multi-language support.
- **Jest/E2E Testing:** Defer until the current HTML test runner is insufficient or CI is introduced.
- **EventBus/PubSub:** Defer until direct method calls between the ~3-4 modules become a clear source of pain or bugs. The current simple architecture is easier to debug.