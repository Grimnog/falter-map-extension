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
- **Pragmatism Over Purity:** A working, tested, "good enough" architecture is superior to a "perfect," complex one.

---

## ✅ Completed Sprints (Sprints 1, 2, 3, 4)

**Sprint 1 & 2:**
-   **FALTMAP-01-07:** Foundational refactoring and basic testing.
-   **FALTMAP-08, 09, 11:** UI modularization and error handling.

**Sprint 3:**
-   **FALTMAP-10:** Comprehensive test suite with 98 tests and 80%+ coverage.
-   **FALTMAP-13:** Marker Clustering for dense map areas.
-   **FALTMAP-19:** Full accessibility with ARIA, focus management, screen reader support.

**Sprint 4 (Post-0.6.0 UX Improvements):**
-   **FALTMAP-21:** Auto-zoom after first 5 geocoded restaurants.
-   **FALTMAP-22:** Modal header visual redesign with Falter yellow branding.

---

## 📋 Detailed Completed Tickets (Sprint 4)

### 🎟️ **TICKET: FALTMAP-21 - Improve Initial Map Zoom Behavior** ✅
- Status: Done ✅
- Priority: 🟢 Medium

**User Story:**
As a user, I want the map to automatically zoom to show my filtered restaurants instead of seeing the entire city, so I can immediately see relevant results without manual interaction.

**Context:**
Currently the map starts at city-wide zoom (Vienna center, zoom 13) regardless of where restaurants are located. For single-district searches, users want to see that district zoomed in. For multi-district searches, users want to see all results fitted to view.

**Solution:**
Auto-zoom to fit bounds after first 5 restaurants are geocoded, with 20% padding. One-time zoom to prevent jarring adjustments.

**Acceptance Criteria:**
- [x] Map automatically zooms after first 5 restaurants are located
- [x] Zoom fits bounds with 20% padding for comfortable viewing
- [x] Only one zoom adjustment (no continuous re-zooming)
- [x] Works for both single-district and multi-district searches
- [x] Add getMarkerClusterGroup() getter method to MapModal
- [x] Commit message: `feat: add auto-zoom after first 5 geocoded restaurants`
- [x] Manual testing confirms improved UX

**Commits:** 4cc8908

---

### 🎟️ **TICKET: FALTMAP-22 - Redesign Modal Header Visual Style** ✅
- Status: Done ✅
- Priority: 🟢 Medium

**User Story:**
As a user, I want the modal header to look professional and visually appealing, so the extension feels polished and trustworthy.

**Context:**
Original header had dark black background with white text, which felt heavy and plain. User requested a cleaner, more professional design with Falter brand colors.

**Solution:**
Use Falter yellow (#FFD600) background with black text for bold, distinctive branding. Removed icons per user preference.

**Acceptance Criteria:**
- [x] Header background changed to Falter yellow (#FFD600)
- [x] All text in black for strong contrast and readability
- [x] Restaurant count in semi-transparent black (70% opacity)
- [x] Subtle gray bottom border for visual separation
- [x] No icons (per user request)
- [x] Commit message: `style: use Falter yellow background for modal header`
- [x] Manual testing confirms improved visual appeal

**Commits:** 71bf616, 9db73e9

---

## 🚫 Deferred / Post-v1.0 Backlog

The following tickets are explicitly **out of scope for v1.0**. They represent good ideas for a future version but violate the "minimal and lightweight" principle for the initial release. They are preserved here for future consideration.

---

### 🎟️ **TICKET: FALTMAP-20 - Refactor Project Structure and Centralize App Logic**
- **Status:** 🚫 Deferred
- **Reason:** Considered over-engineering for v1.0. The current coordinator pattern in `content.js` is simple, tested, and sufficient for the project's scope. This refactoring adds complexity for no direct user benefit.

### 🎟️ **TICKET: FALTMAP-12 - Implement Virtual Scrolling for Large Result Lists**
- **Status:** 🚫 Deferred
- **Reason:** Over-engineered for the current problem. A simpler pagination approach would be preferred if list performance becomes a real-world issue. Adds too much complexity.

### 🎟️ **TICKET: FALTMAP-15 - Add Filter/Search Functionality in Results List**
- **Status:** 🚫 Deferred
- **Reason:** The Falter website already provides robust filtering capabilities. Adding a secondary filter within the extension's UI is redundant for a "map layer" extension.

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
- **EventBus/PubSub:** Defer until direct method calls between modules become a clear source of pain or bugs. The current simple architecture is easier to debug.