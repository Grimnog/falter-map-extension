# Falter Map Extension - Backlog

This document contains all backlog tickets that can be drawn from for future sprints. Tickets are organized by Epic to show what each contributes to.

**Completed tickets** are archived in `docs/CHANGELOG_TICKETS.md`.  
**Active sprint tickets** are in `docs/IMPLEMENTATION.md`.

---
## Epic E05: Core Feature Enhancements

### 🎟️ **TICKET: FALTMAP-26 - Support All Austrian Bundesländer (Not Just Vienna)**
- Epic: E05 (Core Feature Enhancements)
- Status: Design Phase
- Priority: 🟡 High
- **Depends on:** FALTMAP-34 (Result Limiting) must be completed first

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
## Epic E04: UI/UX Polish

### 🎟️ **TICKET: FALTMAP-27 - Improve Font Readability and Alignment with Falter Style**
- Epic: E04 (UI/UX Polish)
- Status: Open
- Priority: 🟡 High

**User Story:**
As a user, I want the extension's text to be clear and readable, with a visual style that feels consistent with Falter's branding.

**Context:**
The current font choices in the modal don't align well with Falter's visual identity and could be more readable. Falter uses:
- Normal text: Futura Round-style font (geometric, rounded sans-serif) - https://www.myfonts.com/collections/futura-round-font-urw
- Bold/headers: Laguna Vintage-style font (bold, impactful) - https://www.myfonts.com/collections/laguna-vintage-font-aiyari

**Goals (in priority order):**
1. **Readability** (primary driver)
2. Visual alignment with Falter's style
3. Modern, professional appearance
4. Use free alternatives (no paid fonts)

**Scope of Work:**
1. **Research free font alternatives:**
   - For body text: Find Futura Round alternatives (geometric, rounded sans-serif)
     - Candidates: Nunito, Quicksand, Comfortaa, Varela Round, Montserrat
   - For headers/bold: Find Laguna Vintage alternatives (bold, impactful)

2. **Test readability:**
   - Test font combinations at different sizes
   - Verify legibility on different screen sizes/resolutions
   - Check contrast and accessibility

3. **Implement in modal UI:**
   - Apply body font to restaurant details, addresses, status messages
   - Apply header font to modal title, section headers
   - Ensure consistent sizing and spacing

4. **Cross-browser testing:**
   - Verify fonts load correctly in Chrome
   - Test fallback fonts if web fonts fail to load

**Acceptance Criteria:**
- [ ] Free font alternatives identified for both body and header text
- [ ] Fonts tested for readability and visual appeal
- [ ] New fonts applied to all modal UI elements
- [ ] Font sizes and weights are consistent throughout
- [ ] Fonts load correctly with appropriate fallbacks
- [ ] Manual testing confirms improved readability
- [ ] Visual style feels more aligned with Falter's aesthetic
- [ ] No performance impact from font loading
- [ ] Commit message follows format: `feat: improve font readability and Falter style alignment`

---

### 🎟️ **TICKET: FALTMAP-28 - Redesign Status Message to Not Look Like Textbox**
- Epic: E04 (UI/UX Polish)
- Status: Open
- Priority: 🟢 Medium

**User Story:**
As a user, I should clearly understand which UI elements are informational vs. interactive, so I don't try to click or type in status messages.

**Context:**
The status message element (showing "Suche läuft..." / "Suche abgeschlossen") currently looks like a textbox according to UX designer feedback. It sits below the "Falter Restaurant Map" header and above the restaurant list. The grey text on white background with current styling makes it appear as an input field where users might expect to enter text.

**Problem:**
- Element resembles a textbox (likely due to border, background, padding)
- Creates confusion about whether it's interactive
- Poor visual hierarchy - doesn't distinguish itself as a status indicator

**Design Goal:**
Make the status message visually distinct from:
- Input fields (it's not interactive)
- The restaurant list below (it's not a list item)
- Align it more with the header styling (part of the modal chrome, not content)

**Scope of Work:**
1. **Analyze current styling:**
   - Identify what makes it look like a textbox (border, background, padding, alignment)

2. **Explore design alternatives:**
   - Option A: Style it like the header (similar background, integrate into modal chrome)
   - Option B: Badge/chip style (rounded, colored background, centered)
   - Option C: Subtle status bar (minimal border, icon + text, different background)
   - Option D: Remove border, use typography only (bold text, icon, centered)

3. **Implement chosen design:**
   - Update CSS for status message element
   - Ensure it works with both states ("Suche läuft..." and "Suche abgeschlossen")
   - Consider adding icons (loading spinner, checkmark) for clarity

4. **Test visual hierarchy:**
   - Verify it's clearly distinct from list items below
   - Ensure it doesn't look interactive
   - Check readability and accessibility

**Acceptance Criteria:**
- [ ] Current styling analyzed and problem elements identified
- [ ] At least 2-3 design alternatives explored/mocked up
- [ ] Chosen design implemented in CSS
- [ ] Status message no longer resembles a textbox
- [ ] Visual hierarchy is clear (header → status → list)
- [ ] Works for both "Suche läuft..." and "Suche abgeschlossen" states
- [ ] Manual testing confirms improved UX
- [ ] Designer feedback incorporated (if available for review)
- [ ] Commit message follows format: `fix: redesign status message to avoid textbox appearance`

---

### 🎟️ **TICKET: FALTMAP-30 - Refactor Popup for Design Consistency and UX Polish**
- Epic: E04 (UI/UX Polish)
- Status: Open
- Priority: 🟡 High

**User Story:**
As a user, I want the extension popup to be clean, professional, and consistent with the modal's design and language.

**Context:**
The popup (shown when clicking the extension icon) has several inconsistencies and UX issues that need addressing before v1.0:
1. Design doesn't align with the modal (different styling/branding)
2. Internal design inconsistency (mixed styles)
3. Language mixing (English and German in the same UI)
4. Clear cache button is too large/prominent
5. Cache cleared confirmation uses intrusive browser alert

**Current State - What Works:**
- ✅ Cache usage display is helpful and should be kept

**Scope of Work:**

**1. Design Alignment with Modal:**
- Use consistent color scheme (Falter yellow branding from modal)
- Match typography (font family, sizes, weights)
- Consistent spacing and padding
- Make popup feel like part of the same product as the modal

**2. Language Consistency:**
- Audit all text in popup.html
- Convert all English text to German (consistent with modal)
- Examples: "Clear Cache" → "Cache leeren", "Cache Usage" → "Cache-Nutzung"

**3. Button Sizing & Hierarchy:**
- Reduce size of "Clear Cache" button (currently too large/prominent)
- Button should be secondary action, not primary call-to-action
- Consider: smaller button, outline style, or text link

**4. Confirmation UX:**
- Replace intrusive browser `alert()` popup with subtle confirmation
- Options:
  - Toast/banner message in popup itself
  - Temporary success message replacing button
  - Small checkmark icon with "Cache geleert" text
- Must be non-intrusive and feel modern

**5. Overall Polish:**
- Ensure uniform spacing throughout
- Consistent use of borders, backgrounds, shadows
- Clean visual hierarchy

**Acceptance Criteria:**
- [ ] Popup design aligns with modal (colors, fonts, spacing)
- [ ] All text is in German (no English/German mixing)
- [ ] Clear cache button is appropriately sized (not oversized)
- [ ] Cache cleared confirmation is subtle and non-intrusive (no browser alerts)
- [ ] Cache usage display remains visible and functional
- [ ] Popup feels professional and consistent
- [ ] Manual testing confirms all functionality still works
- [ ] Cross-browser testing (Chrome)
- [ ] Commit message follows format: `refactor: polish popup design and UX consistency`

**Open Questions:**
1. Should popup include any additional information (version number, link to docs)?
2. Should cache usage be more detailed (number of entries, age of cache)?
3. Color scheme: exact match to modal header or complementary?

---

## Epic E03: Testing & Reliability

**Note:** Most E03 tickets have been completed and are archived in `docs/CHANGELOG_TICKETS.md`.

### 🎟️ **TICKET: FALTMAP-36 - Investigate MapModal Result List and Cache Behavior Bug**
- Epic: E03 (Testing & Reliability)
- Status: Open (Needs Investigation)
- Priority: 🟢 Medium

**User Story:**
As a user, I want the result list in the map modal to display correctly and consistently, so I can browse and select restaurants reliably.

**Context:**
During testing of FALTMAP-34, inconsistencies were observed in:
- Result list display behavior
- Cache behavior and how it affects the list
- Possible issues with how results are rendered

**Current Status:**
- Issue observed but not fully explored
- Needs investigation to understand root cause
- May be related to caching, rendering, or data flow

**Investigation Tasks:**
1. **Reproduce the issue:**
   - Test with cached results
   - Test with fresh geocoding
   - Test with mixed (some cached, some new)
   - Document exact steps to reproduce

2. **Identify symptoms:**
   - What is displaying incorrectly?
   - When does it occur? (always, sometimes, specific conditions?)
   - Does it affect all results or just some?

3. **Analyze potential causes:**
   - Cache loading logic
   - Result list rendering in MapModal
   - Coordinate assignment
   - DOM updates during geocoding

4. **Determine scope:**
   - Is it a display bug (cosmetic)?
   - Is it a data bug (wrong info)?
   - Does it affect functionality?

**Acceptance Criteria (TBD after investigation):**
- [ ] Issue fully reproduced and documented
- [ ] Root cause identified
- [ ] Fix implemented (or sub-tickets created)
- [ ] Manual testing confirms fix
- [ ] No regressions introduced

**Technical Notes:**
- This ticket is in investigation phase
- Will be refined once issue is better understood
- May split into multiple tickets if multiple issues found
- Priority may change based on severity

---
## Epic E06: Documentation

### 🎟️ **TICKET: FALTMAP-35 - Improve README Documentation**
- Epic: E06 (Documentation)
- Status: Open
- Priority: 🟡 High

**User Story:**
As a user, I want clear documentation about how the extension works and its limitations, so I understand the 100 result limit and how to get better results.

**Context:**
The extension has important behaviors and limitations that users should know about:
- 100 result limit (for ethical reasons)
- Why we limit (Nominatim TOS, good web citizen)
- How to get better/more relevant results (use filters)

Currently, README lacks this documentation.

**Scope of Work:**

1. **Add "How It Works" section:**
   - Explain the extension workflow
   - What it does (scrapes Falter, geocodes, shows on map)
   - What technologies it uses (Leaflet, Nominatim, Falter.at)

2. **Add "Result Limiting" section:**
   - Explain 100 result limit
   - Why we limit:
     - Respect Nominatim TOS (no bulk geocoding)
     - Respect Falter's servers (polite pagination)
     - Good open-source citizen
   - How it works (automatic, silent limiting)

3. **Add "Getting Better Results" section:**
   - Use Falter.at filters (Bundesland, cuisine, district)
   - Narrow search criteria
   - Benefits: more relevant results, faster loading

4. **Improve formatting:**
   - Add badges (version, license, etc.)
   - Better structure with sections
   - Screenshots/GIFs if useful
   - Table of contents

5. **Add "Privacy & Data" section:**
   - What data we process (addresses)
   - Where it goes (Nominatim API)
   - What we store (local cache, 30 days)
   - No tracking, no analytics
   - Font loading: Uses Bunny Fonts (EU-based, GDPR-compliant) instead of Google Fonts to respect European privacy laws

**Acceptance Criteria:**
- [ ] "How It Works" section added
- [ ] "Result Limiting" section explains 100 limit and why
- [ ] "Getting Better Results" section guides users on filter usage
- [ ] README formatting improved (badges, TOC, sections)
- [ ] "Privacy & Data" section added
- [ ] Clear, user-friendly language throughout
- [ ] Proofread for grammar and clarity
- [ ] Commit message follows format: `docs: improve README with usage guide and limitations`

**Technical Notes:**
- This is user-facing documentation, not technical docs
- Focus on clarity and helpfulness
- Assume user doesn't know about Nominatim or geocoding
- Make it accessible to non-technical users

---

## 🚫 Deferred / Post-v1.0 Backlog

These tickets are deferred until after v1.0 release, pending decision on Chrome Web Store publication.

### 🎟️ **TICKET: FALTMAP-24 - Add Privacy Policy for Chrome Web Store Compliance**
- Epic: E03 (Testing & Reliability)
- Status: Deferred
- Priority: 🔵 Low (deferred)

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
- Status: Deferred
- Priority: 🔵 Low (deferred)

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
