# Architectural Blueprint & Technical Debt
_Last Updated: 2026-01-29_

This document provides a high-level overview of the Falter Map extension's architecture. It has been updated to reflect the project's state as of the final v1.0 release candidate.

---

## 1. v1.0 Architecture (Current & Final)

The extension's architecture is a pragmatic, modular system that has proven effective and maintainable. It successfully separates concerns while adhering to our "Keep It Simple, Stupid" (KISS) philosophy.

-   **`content.js` (Coordinator):** This script acts as the central coordinator and entry point on the Falter page. It is responsible for:
    -   Initializing the application.
    -   Injecting the "Auf Karte anzeigen" button.
    -   Orchestrating the high-level application flow by calling and coordinating the various service and UI modules.
    -   It is the "brain" of the operation, and its size (~300 lines) is considered appropriate for the project's scope.

-   **UI Modules (`modules/`):**
    -   `MapModal.js`: A stateful component responsible for the entire map modal UI, including the Leaflet map, marker rendering, and results list.
    -   `Navigation.js`: Manages all keyboard navigation within the modal.
    -   `ErrorHandler.js`: A centralized handler for all user-facing notifications.

-   **Service Modules (`modules/`):**
    -   `constants.js`: Provides centralized, static configuration.
    -   `cache-utils.js`: Encapsulates all logic for `chrome.storage`.
    -   `dom-parser.js`: Handles all scraping logic from the Falter website.
    -   `geocoder.js`: Manages the geocoding process and API interaction.

-   **Root-Level Scripts:**
    - `background.js`: Handles extension lifecycle events.
    - `popup.js`: Logic for the browser action popup.
    - **Note:** While moving these to a `modules/chrome` directory was considered, it was deemed unnecessary complexity for v1.0, as their roles are distinct and well-understood.

---

## 2. Technical Debt Status for v1.0

All originally identified technical debt has been successfully resolved. The current architecture is considered "clean enough" and fit for purpose. No further architectural refactoring is planned for the v1.0 release.

### ✅ Resolved Technical Debt

-   **`DEBT-01: Monolithic UI & State Management`**: **Resolved** by `FALTMAP-08` and `FALTMAP-09`, which extracted UI logic into `MapModal.js` and `Navigation.js`.
-   **`DEBT-02: Inefficient DOM Handling`**: **Resolved** in Sprint 1 by implementing event delegation and caching DOM queries.
-   **`DEBT-03: Primitive User Feedback`**: **Resolved** by `FALTMAP-11`, which created a robust `ErrorHandler` module.
-   **`DEBT-04: No Automated Testing`**: **Resolved** by `FALTMAP-10`, which delivered a comprehensive test suite with high coverage (98 tests).

### 🚫 Deferred Architectural Refinements

The following architectural changes were considered but explicitly **deferred** as they violate the project's KISS principle and represent over-engineering for the current scope:

-   **Central `App.js` Controller:** The current coordination logic within `content.js` is clear and sufficient. Extracting it into another layer adds complexity with no user benefit.
-   **File Structure Reorganization:** Moving root-level scripts (`background.js`, etc.) into subdirectories was deemed unnecessary churn. The current flat structure is simple and easy to navigate for a project of this size.

---

## 3. v1.0 Architectural Vision: Stability and Simplicity

The architectural vision for v1.0 has been met. The goal was to create a modular, testable, and maintainable codebase that reliably performs its core function.

**The final v1.0 architecture is stable.** No further refactoring is planned. Future work will focus on potential new features in a v2.0, at which point the architectural needs can be re-evaluated based on new requirements.