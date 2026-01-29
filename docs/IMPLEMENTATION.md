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
-   **FALTMAP-19:** Full accessibility with ARIA, focus management, screen reader support. ✅

**Sprint 4 (Post-0.6.0 UX Improvements):**
-   **FALTMAP-21:** Auto-zoom after first 5 geocoded restaurants for better initial view. ✅
-   **FALTMAP-22:** Modal header redesign with Falter yellow branding and black text. ✅
-   **FALTMAP-23:** German UI text throughout modal, cleaner header design. ✅

---

## 🚀 Current Sprint: Final Polish

**Focus:** Prepare for 1.0 release.


---

## 📋 Backlog

### 🎟️ **TICKET: FALTMAP-26 - Support All Austrian Bundesländer (Not Just Vienna)**
- Epic: E05 (Core Feature Enhancements)
- Status: Design Phase
- Priority: 🟡 High

**User Story:**
As a user searching for restaurants in any Austrian Bundesland (Salzburg, Tirol, Kärnten, etc.), I want the map to work correctly for my region, not just Vienna.

**Context:**
Currently the extension is Vienna-centric:
- Default map center hardcoded to Vienna coordinates (48.2082, 16.3719)
- Default zoom optimized for Vienna city
- Untested with addresses from other Bundesländer

**Austrian Bundesländer to support:**
- Wien (currently working)
- Niederösterreich
- Oberösterreich
- Vorarlberg
- Burgenland
- Steiermark
- Tirol
- Salzburg
- Kärnten

**Design Ideas & Discussion:**

1. **Dynamic Map Centering:**
   - **Option A:** Calculate centroid of all successfully geocoded restaurants
   - **Option B:** Detect Bundesland from addresses and use predefined center coordinates
   - **Option C:** Let Leaflet's `fitBounds()` handle it automatically (simplest)
   - **Recommended:** Option C - rely on auto-zoom after first 5 restaurants

2. **Geocoding Compatibility:**
   - Current approach adds "Austria" to all queries - should work for all Bundesländer
   - Nominatim should handle addresses from all Austrian states
   - **Action needed:** Test with addresses from each Bundesland

3. **Initial Map View:**
   - **Option A:** Keep Vienna as default, rely on auto-zoom to adjust
   - **Option B:** Detect region from first address and set initial center
   - **Option C:** Use Austria-wide view (zoom out to show whole country)
   - **Recommended:** Option A (simplest) or Option C (more neutral)

4. **Zoom Level Considerations:**
   - Vienna: City-scale searches (small area)
   - Tirol/Salzburg: Could be state-wide searches (large area)
   - Current auto-zoom (after 5 restaurants) should handle this automatically
   - **May not need changes** - test first

5. **Address Format Variations:**
   - Different Bundesländer may have different address formats
   - Example: "Hauptstraße 1, 5020 Salzburg" vs "Hauptstraße 1, 1010 Wien"
   - **Action needed:** Verify Nominatim handles all formats correctly

**Testing Strategy:**
- Manual test searches in each Bundesland on Falter.at
- Verify geocoding success rate for each region
- Check map centering and zoom levels
- Test edge cases: multi-Bundesland searches (e.g., cuisine filter across states)

**Acceptance Criteria (TBD after design review):**
- [ ] Extension works for searches in all 9 Bundesländer
- [ ] Map centers appropriately based on search results location
- [ ] Geocoding succeeds for addresses in all regions
- [ ] Auto-zoom handles both city-level and state-level searches
- [ ] Default map view is neutral (not Vienna-centric)
- [ ] Manual testing confirms functionality in each Bundesland
- [ ] Update CONFIG.MAP.DEFAULT_CENTER if needed
- [ ] Update documentation to reflect Austria-wide support

**Open Questions:**
1. Should default center be Austria-wide or keep Vienna? (Most users are in Vienna)
2. Do we need Bundesland-specific geocoding hints/optimizations?
3. Should we detect and display which Bundesland(er) restaurants are from?
4. How to handle edge case: search spans multiple Bundesländer?

**Implementation Complexity:** Medium (mostly testing, minimal code changes)

---

## 📋 Backlog (Chrome Web Store Compliance)

### 🎟️ **TICKET: FALTMAP-24 - Add Privacy Policy for Chrome Web Store Compliance**
- Epic: E03 (Testing & Reliability)
- Status: Open
- Priority: 🔴 Critical

**User Story:**
As a developer, I want the extension to be compliant with Chrome Web Store policies so that it can be published successfully.

**Context:**
The Web Store requires any extension that handles user data (including web browsing activity) to have a privacy policy. Our extension sends restaurant addresses from the user's active tab to a third-party geocoding API. This is a critical compliance gap that must be fixed. This ticket addresses the "Missing Privacy Policy" finding in `docs/ChromeWebStorePolicy.md`.

**Scope of Work:**

1.  **Create Privacy Policy Content:**
    -   **File to Create:** `docs/privacy_policy.md`
    -   **Content:**
        ```markdown
        # Privacy Policy for Falter Restaurant Map Extension

        **Last Updated:** 2026-01-29

        This privacy policy explains how the Falter Restaurant Map browser extension handles data.

        ## Data We Process

        To provide our core feature, the extension processes the following data:

        1.  **Restaurant Addresses:** When you click "Auf Karte anzeigen," the extension reads the restaurant names and addresses displayed on the Falter.at search results page.
        2.  **Geocoding Data:** The collected restaurant addresses are sent to the free, public OpenStreetMap Nominatim API (https://nominatim.openstreetmap.org/) to retrieve map coordinates (latitude and longitude).

        ## Data Storage

        -   **Local Caching:** To improve performance and minimize API requests, successfully geocoded addresses and their coordinates are stored locally on your computer using the `chrome.storage.local` API. This cache is stored for 30 days.
        -   **No Remote Storage:** We do not store, log, or track your search history, IP address, or any other personal information on any remote server. All processing and storage (other than the temporary request to the Nominatim API) happens on your local machine.

        ## Data Sharing

        We only share the addresses of restaurants with the OpenStreetMap Nominatim API for the sole purpose of turning those addresses into map coordinates. We do not share any other information.

        ## Contact Us

        If you have any questions about this privacy policy, please open an issue on our GitHub repository.
        ```

2.  **Host the Privacy Policy:**
    -   **Action:** The privacy policy must be hosted on a public, stable HTTPS URL. A simple way to do this is to use GitHub Pages to serve the `docs/privacy_policy.md` file. This step is external to the codebase itself but is a prerequisite for the next step.

3.  **Update `manifest.json`:**
    -   **File to Modify:** `manifest.json`
    -   **Changes:**
        -   Add a new top-level field `privacy_policy` pointing to the public URL where the policy is hosted.
        -   **Example (placeholder URL):**
            ```json
            {
              "manifest_version": 3,
              "name": "Falter Restaurant Map",
              "version": "0.6.0",
              "privacy_policy": "https://your-github-username.github.io/falter-map-extension/privacy_policy.html",
              ...
            }
            ```

**Acceptance Criteria (AC):**
- [ ] `docs/privacy_policy.md` is created with the specified content.
- [ ] The privacy policy is hosted on a public HTTPS URL.
- [ ] `manifest.json` is updated with the correct `privacy_policy` field pointing to the live URL.
- [ ] The link to the privacy policy is accessible and correct on the Chrome Web Store listing page (after upload).
- [ ] The commit message follows the format: `chore: add privacy policy for web store compliance`
- [ ] The ticket is moved to the "Done" section in this document.

---

### 🎟️ **TICKET: FALTMAP-25 - Harden UI Against XSS via DOM Sanitization**
- Epic: E03 (Testing & Reliability)
- Status: Open
- Priority: 🟡 High

**User Story:**
As a user, I want to be safe from cross-site scripting (XSS) attacks, even if the source website is compromised.

**Context:**
Our policy review (`docs/ChromeWebStorePolicy.md`) identified a potential security vulnerability. We render content scraped from Falter.at into our UI, often using `innerHTML`. While Falter is a trusted source, we must defend against the possibility of malicious content being injected on their end. This ticket ensures all externally sourced content is treated as unsafe and is properly sanitized before rendering.

**Scope of Work:**

1.  **Audit Codebase for `innerHTML` Usage:**
    -   **Action:** Systematically search the entire codebase (`.js` files) for all instances where `element.innerHTML` is assigned.
    -   **Focus Areas:** `MapModal.js`, `dom-parser.js`, `ErrorHandler.js`, and any other UI-related modules.

2.  **Implement `textContent` as the Default:**
    -   **Action:** For every instance where `innerHTML` is used to render scraped text (e.g., restaurant names, addresses, cuisine types), refactor the code to use `element.textContent` instead.
    -   **Rationale:** This is the safest method as it treats all input as plain text, rendering any HTML tags harmlessly as literal strings.

3.  **Handle Necessary HTML:**
    -   **Action:** If any feature *requires* rendering scraped content as HTML (e.g., if a restaurant description contained bold or italic tags that must be preserved), this is the only place `innerHTML` should be considered.
    -   **Mitigation:** If this case exists, a lightweight sanitization function must be used. We will avoid adding a large library like DOMPurify to adhere to our KISS principle. A simple function that escapes essential HTML characters (`<`, `>`, `&`, `"`, `'`) would be sufficient.
        ```javascript
        // Example utility function in a new modules/utils/Sanitizer.js
        function escapeHTML(str) {
            return str.replace(/[&<>"']/g, function(m) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#039;'
                }[m];
            });
        }
        ```
    - **Note:** A full audit is expected to find no such cases are required.

**Acceptance Criteria (AC):**
- [ ] The codebase has been audited for all uses of `innerHTML`.
- [ ] All instances of `innerHTML` that render scraped text have been replaced with `textContent`.
- [ ] If any `innerHTML` remains, its usage is explicitly justified and the input is sanitized.
- [ ] Manual testing confirms that all UI elements still render correctly (e.g., names, addresses are displayed properly).
- [ ] Manual test: Attempt to inject HTML tags into a restaurant name on the live site (using DevTools) and verify they are rendered as plain text in the extension's UI, not as HTML.
- [ ] The commit message follows the format: `fix: harden UI against XSS with DOM sanitization`
- [ ] The ticket is moved to the "Done" section in this document.

---

## 🚫 Deferred / Post-v1.0 Backlog

(Content unchanged)
