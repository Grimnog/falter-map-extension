# Architectural Blueprint & Technical Debt
_Last Updated: 2026-01-28_

This document provides a high-level overview of the Falter Map extension's architecture, its known technical debt, and the strategic roadmap for its evolution.

---

## 1. Current Architecture (as of v0.4.0)

The extension has been partially refactored into a modular architecture.

-   **Coordinator (`content.js`):** Acts as the main entry point. It orchestrates the initial button injection and the high-level application flow by coordinating the various modules.
-   **Service Modules:**
    -   `modules/constants.js`: Provides centralized configuration.
    -   `modules/cache-utils.js`: Encapsulates all logic for interacting with `chrome.storage` and managing the geocode cache.
    -   `modules/dom-parser.js`: Handles all logic for scraping and parsing restaurant data from the Falter website DOM.
    -   `modules/geocoder.js`: Manages the entire geocoding process, including address variations, API calls, and rate limiting.
-   **Monolithic UI (`content.js`):** All logic related to the map modal's UI (DOM creation, state management, event handling, map interaction) currently resides inside `content.js`.

---

## 2. Current Technical Debt & Opportunities

This section lists known architectural weaknesses and areas for improvement.

-   ### DEBT-01: Monolithic UI & State Management
    **Problem:** `content.js` directly manages the state and rendering of the entire map modal. This violates the Single Responsibility Principle and tightly couples our business logic (geocoding orchestration) with our presentation logic (DOM manipulation).
    **Opportunity:** Extract all UI-related code into dedicated, stateful modules (`MapModal.js`, `Navigation.js`) to create a true component-based architecture. This will make the UI easier to test, modify, and potentially replace.

-   ### DEBT-02: Inefficient DOM Handling
    **Problem:** The current UI implementation in `content.js` has known performance issues that will be noticeable on large result sets.
    -   It creates a unique event listener for every item in the results list.
    -   It repeatedly queries the DOM for the same elements within different functions.
    **Opportunity:** Resolve this debt by completing tickets **FALTMAP-04** (Event Delegation) and **FALTMAP-05** (Cache DOM Queries).

-   ### DEBT-03: Primitive User Feedback
    **Problem:** User feedback mechanisms are basic and not robust. The geocoding progress is text-only, and any errors that occur (e.g., network failures) fail silently to the console.
    **Opportunity:** Enhance the user experience by implementing a visual progress bar (**FALTMAP-06**) and creating a dedicated, user-facing error notification system.

-   ### DEBT-04: No Automated Testing
    **Problem:** The project lacks a formal testing strategy. All verification is done manually, which is error-prone and not scalable as complexity grows.
    **Opportunity:** Introduce a lightweight, browser-based testing framework to write unit/integration tests for critical modules like `cache-utils.js` and `geocoder.js`.

---

## 3. Future Architectural Vision & Roadmap

This roadmap outlines the planned evolution of the extension.

### Goal: A Fully Modular, Component-Based Architecture

The primary architectural goal is to complete the modularization of `content.js`, resulting in a clean separation of concerns where `content.js` is purely a coordinator.

**Target Architecture:**
```
content.js (Coordinator)
 │
 ├── modules/MapModal.js   (Handles all UI: creation, updates, state, Leaflet map)
 │
 ├── modules/Navigation.js (Handles keyboard navigation state and events)
 │
 └── (existing service modules like geocoder, parser, etc.)
```

### High-Level Roadmap

1.  **Phase 1: Performance & UX Quick Wins (Current Sprint)**
    -   `FALTMAP-04`: Implement Event Delegation.
    -   `FALTMAP-05`: Cache DOM Queries.
    -   `FALTMAP-06`: Add Visual Progress Bar.

2.  **Phase 2: Complete UI Modularization (Epic E02)**
    -   Extract all modal, map, and results list logic from `content.js` into a new `MapModal.js` module.
    -   Extract all keyboard handling logic into a new `Navigation.js` module.

3.  **Phase 3: Reliability & Polish (Epic E03)**
    -   Implement a robust, user-facing error notification system.
    -   Introduce a basic testing suite for key modules.