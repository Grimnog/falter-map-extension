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

## Backlog

### 🎟️ **TICKET: FALTMAP-23 - Simplify Header and Add German Status Text**
- Epic: E05 (Core Feature Enhancements)
- Status: In Progress
- Priority: 🟢 Medium

**User Story:**
As a German-speaking user, I want the extension UI in German and a cleaner header design, so the experience feels native and professional.

**Context:**
The modal header currently shows restaurant count and uses English status text. Since Falter.at is a German-language site with German-speaking users, the UI should be in German. Additionally, the restaurant count in the header is redundant and adds visual clutter.

**Scope of Work:**

1. **Remove Restaurant Count from Header:**
   - Remove the `<p id="modal-info">${this.restaurants.length} restaurants</p>` line from MapModal.js
   - Update CSS if needed to adjust spacing

2. **Translate Status Text to German:**
   - Change "Geocoding" label → "Suche läuft..."
   - Change "X/Y located" → "X/Y gefunden"
   - Update all related status text in MapModal.js

**Files to Modify:**
- `modules/MapModal.js` (remove restaurant count, update status text)

**Acceptance Criteria:**
- [ ] Restaurant count removed from modal header
- [ ] Status label shows "Suche läuft..." instead of "Geocoding"
- [ ] Progress text shows "X/Y gefunden" instead of "X/Y located"
- [ ] Completion text shows "Abgeschlossen: X/Y gefunden" instead of "Complete: X/Y located"
- [ ] Manual testing confirms clean header and German text
- [ ] Commit message: `feat: simplify header and add German status text`
- [ ] Ticket marked Done with all ACs checked

---

### 🎟️ **TICKET: FALTMAP-21 - Add Privacy Policy for Chrome Web Store Compliance**
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

### 🎟️ **TICKET: FALTMAP-22 - Harden UI Against XSS via DOM Sanitization**
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
