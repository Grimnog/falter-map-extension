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

## 🚀 Next Sprint: Polish & Ship v1.0

**Focus:** Add basic accessibility and prepare for release.

### 📋 Backlog (1 ticket):

1.  **FALTMAP-19 (New): Implement Basic Accessibility** (🟢 Medium, 3 pts)
    -   **User Story:** As a user with accessibility needs, I want the map modal to be usable with keyboard-only navigation and a screen reader.
    -   **Context:** With interactive elements like search, we must ensure the extension is usable by everyone. This is not a "nice-to-have."
    -   **Scope:** Add essential ARIA roles (`dialog`, `listbox`), manage focus trapping, and ensure all interactive elements are keyboard-accessible and clearly labeled.

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