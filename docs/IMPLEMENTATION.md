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

---

## Backlog

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

**Implementation Notes (Claude - 2026-01-28):**
Attempted implementations failed due to Chrome extension architecture constraints:

1. **Browser Console Approach (Failed)**
   - Issue: `chrome` API not available in page console context
   - Error: `Cannot read properties of undefined (reading 'getURL')`

2. **Service Worker Console Approach (Failed)**
   - Issue: Service Workers don't support dynamic `import()` statements
   - Error: "import() is disallowed on ServiceWorkerGlobalScope by the HTML specification"
   - Reference: https://github.com/w3c/ServiceWorker/issues/1356

3. **HTML Test Runner Approach (Failed)**
   - Issue: `chrome-extension://<ID>/tests/test-runner.html` navigation doesn't work
   - Problem: Extension page routing or permissions issue

**Next Steps:**
- Investigate alternative testing approaches (Jest with chrome-extension mock, Puppeteer, or web-ext test runner)
- May require build tooling despite "lightweight" goal
- Consult with architect (Gemini) on testing strategy revision