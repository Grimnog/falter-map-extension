# Architectural Blueprint & Technical Debt
_Last Updated: 2026-01-29_

This document provides a high-level overview of the Falter Map extension's architecture. It has been updated to reflect the successful completion of initial refactoring sprints and to define the final, lean roadmap for a minimal v1.0 release.

---

## 1. Current Architecture (Post-Sprint 2)

The extension has been successfully refactored from a monolith into a clean, modular architecture where components have clear, single responsibilities.

-   **`content.js` (Entry Point):** This script's sole responsibility is to initialize the main application controller. It is now a lean entry point, under 10 lines of code.

-   **`modules/App.js` (Controller):** The central orchestrator. It manages the application lifecycle, including:
    -   Initializing UI components like the `UIManager`.
    -   Handling the main button click event.
    -   Coordinating the flow between data fetching (`dom-parser`), geocoding (`geocoder`), and UI display (`MapModal`).
    -   Instantiating and wiring up the primary UI components.

-   **UI Modules (`modules/ui/`):**
    -   `MapModal.js`: A stateful component responsible for the entire map modal UI, including the Leaflet map, marker rendering, and results list.
    -   `Navigation.js`: Manages all keyboard navigation within the modal.
    -   `UIManager.js`: Injects the initial "Auf Karte anzeigen" button onto the page and ensures it remains present.
    -   `ErrorHandler.js`: A centralized handler for all user-facing notifications, including errors, warnings, and empty states.

-   **Service Modules (`modules/`):**
    -   `constants.js`: Provides centralized, static configuration.
    -   `cache-utils.js`: Encapsulates all logic for `chrome.storage`.
    -   `dom-parser.js`: Handles all scraping logic from the Falter website.
    -   `geocoder.js`: Manages the geocoding process and API interaction.

-   **Chrome-Specific Modules (`modules/chrome/`):**
    - `background.js`: Handles extension lifecycle events.
    - `popup.js`: Logic for the browser action popup.

---

## 2. Technical Debt & Opportunities

The initial technical debt has been successfully resolved. New, more nuanced opportunities for refinement have been identified.

### ✅ Resolved Technical Debt

-   **`DEBT-01: Monolithic UI & State Management`**: **Resolved** by `FALTMAP-08` and `FALTMAP-09`, which extracted UI logic into `MapModal.js` and `Navigation.js`.
-   **`DEBT-02: Inefficient DOM Handling`**: **Resolved** in Sprint 1 by implementing event delegation and caching DOM queries.
-   **`DEBT-03: Primitive User Feedback`**: **Resolved** by `FALTMAP-11`, which created a robust `ErrorHandler` module.
-   **`DEBT-04: No Automated Testing`**: **Resolved** by `FALTMAP-10`, which delivered a comprehensive test suite with high coverage.

### 🎯 Current Architectural Opportunities

-   **`DEBT-05: Lack of Centralized Application Controller`**
    -   **Problem:** While modules exist, the top-level orchestration logic currently resides in the global scope of `content.js`, which also performs some direct UI work (like handling the empty state).
    -   **Opportunity:** Refactor this logic into a main `App.js` controller class, as described in Section 1. This will make `content.js` a pure entry point and provide a clear, testable structure for the application's lifecycle and state management.

-   **`DEBT-06: Dispersed UI Injection & User Prompts`**
    -   **Problem:** Logic for injecting the initial button and confirming API usage is currently mixed within the main controller flow.
    -   **Opportunity:** Create a dedicated `UIManager.js` to handle button injection and a `UserConsent.js` utility to handle the API confirmation dialog. This aligns with the Single Responsibility Principle.

-   **`DEBT-07: Unclear Root File Structure`**
    -   **Problem:** Key JavaScript files (`background.js`, `popup.js`) and third-party libraries (`leaflet.js`) are in the root directory, cluttering the project structure.
    -   **Opportunity:** Move extension-specific files to `modules/chrome/` and third-party vendor files to a `vendor/` directory to create a clean and intuitive file hierarchy.

---

## 3. v1.0 Architectural Vision & Roadmap

The primary goal is to ship a **minimal, lightweight, and clean v1.0**. The architecture is now focused on supporting only the essential features required for this release. Complexity will only be added when a clear, unavoidable need arises.

### Target Architecture for v1.0

```
/ (Root)
├── manifest.json
├── popup.html
└── /modules/
    ├── App.js (Controller)
    │
    ├── /ui/
    │   ├── MapModal.js
    │   ├── Navigation.js
    │   ├── UIManager.js
    │   └── ErrorHandler.js
    │
    ├── /chrome/
    │   ├── background.js
    │   └── popup.js
    │
    └── (existing service modules: geocoder, parser, etc.)
```

### Final v1.0 Roadmap

The roadmap is now radically simplified to focus on delivering the core user experience.

1.  **Phase 1: Complete Core UX (Current Sprint)**
    -   `FALTMAP-13`: Implement Marker Clustering. This is the final essential feature to make the map usable in all scenarios.

2.  **Phase 2: Polish & Ship (Next Sprint)**
    -   `FALTMAP-19`: Implement Basic Accessibility. Ensures the extension is usable by everyone, which is a core requirement for a quality release.
    -   Perform final integration testing and prepare for release.

All other features, including virtual scrolling, favorites, and export, are explicitly **deferred** to a potential post-v1.0 release to keep the initial product minimal and maintainable. This updated vision is tracked in `docs/IMPLEMENTATION.md`.