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

## ✅ Completed Sprints (Sprints 1, 2, 3)

-   **FALTMAP-01-07:** Foundational refactoring and basic testing.
-   **FALTMAP-08, 09, 11:** UI modularization and error handling.
-   **FALTMAP-10:** Comprehensive test suite with 98 tests and 80%+ coverage.
-   **FALTMAP-13:** Marker Clustering for dense map areas.

---

## 🚀 Final Sprint: Polish & Ship v1.0

**Focus:** Add basic accessibility and prepare for release. The completion of this ticket marks the completion of the v1.0 feature set.

### 📋 In Progress (1 ticket):

### 🎟️ **TICKET: FALTMAP-19 - Implement Basic Accessibility**
- Epic: E05 (Core Feature Enhancements)
- Status: In Progress
- Priority: 🔴 Critical

**User Story:**
As a user with accessibility needs, I want the map modal to be usable with keyboard-only navigation and a screen reader so that I can browse restaurants regardless of my abilities.

**Context:**
Basic accessibility is not a "nice-to-have" - it's essential for an inclusive and professional v1.0 release. We need to ensure the modal is announced correctly, interactive elements are labeled, and focus is managed properly.

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
- [ ] The commit message follows format: `feat: add basic accessibility with ARIA and focus management`
- [ ] The ticket is marked Done with all ACs checked

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