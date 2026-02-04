# Falter Map Extension - Backlog

This document contains all backlog tickets that can be drawn from for future sprints. Tickets are organized by Epic to show what each contributes to.

**Completed tickets** are archived in `docs/CHANGELOG_TICKETS.md`.  
**Active sprint tickets** are in `docs/IMPLEMENTATION.md`.

---
## Epic E05: Core Feature Enhancements

**Note:** FALTMAP-26 (Austria-wide support) completed in Sprint 8 (v0.9.0) and archived in `docs/CHANGELOG_TICKETS.md`.

---

## Epic E04: UI/UX Polish

**Note:** All E04 tickets completed in Sprint 6 (v0.8.0) and archived in `docs/CHANGELOG_TICKETS.md`.

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

### 🎟️ **TICKET: FALTMAP-38 - Fix MapModal UI Flash (Grey List Before Geocoding)**
- Epic: E03 (Testing & Reliability)
- Status: Open
- Priority: 🟢 Medium

**User Story:**
As a user, I want a smooth loading experience when opening the map modal, without seeing a flash of greyed-out entries before the real results appear.

**Context:**
During testing of FALTMAP-26 (Austria-wide support), a UI bug was observed:
- When clicking "Auf Karte anzeigen", the MapModal briefly shows a greyed-out list of all restaurant entries
- This flash lasts for a few seconds
- Then the geocoding starts and the list populates correctly with clickable entries

This creates a jarring UX - users see a list that appears broken/disabled before it transitions to the working state.

**Steps to Reproduce:**
1. Visit any Falter.at search with multiple results (e.g., Burgenland with 8 restaurants)
2. Click "Auf Karte anzeigen" button
3. Observe the MapModal as it opens
4. Notice: List shows all entries greyed out for 1-3 seconds
5. Then: Geocoding starts and entries become active/clickable

**Expected Behavior:**
- MapModal opens with a loading indicator or empty state
- Entries appear one-by-one as they are geocoded
- No flash of greyed-out list

**Actual Behavior:**
- MapModal opens and immediately shows full list in greyed-out state
- After brief delay, geocoding starts and list populates properly
- Creates impression of broken UI

**Potential Causes (to investigate):**
1. List rendering happens before geocoding starts
2. CSS state transition not synchronized with data loading
3. Initial render using all restaurants before coords are available
4. Race condition in MapModal initialization

**Scope of Work:**
1. Investigate MapModal.js rendering logic
2. Identify why greyed-out list appears before geocoding
3. Fix initialization order or add loading state
4. Ensure smooth transition from empty → populating list
5. Test with both cached and uncached results

**Acceptance Criteria:**
- [ ] MapModal no longer shows flash of greyed-out list
- [ ] Smooth loading experience (loading indicator or progressive population)
- [ ] Works correctly with both cached and fresh geocoding
- [ ] No regression in map functionality
- [ ] Manual testing across all Bundesländer
- [ ] Commit message: `fix: remove greyed-out list flash on MapModal open`

**Technical Notes:**
- Observed during Burgenland testing (8 restaurants)
- Likely affects all searches, more noticeable with multiple results
- Related to MapModal initialization timing
- Medium priority: UX polish, not critical functionality

---

### 🎟️ **TICKET: FALTMAP-44 - Fix Status Message Not Updating When Loading from Cache**
- Epic: E03 (Testing & Reliability)
- Status: Open
- Priority: 🟡 High

**User Story:**
As a user, I want to see the correct completion status message ("✓ X Restaurants gefunden") when restaurants are loaded from cache, so I know the map has finished loading.

**Context:**
After implementing the progress bar system in FALTMAP-42, a bug was discovered where the status message doesn't update correctly when restaurants are loaded from cache:

**Current Behavior:**
- When opening MapModal with cached restaurant data, the header shows "Restaurants werden gesucht..." (searching)
- The message never updates to "✓ X Restaurants gefunden" (found)
- Users see perpetual "searching" state even though all restaurants are already displayed
- Progress bar may not update correctly

**Expected Behavior:**
- When restaurants load from cache, status should immediately show "✓ X Restaurants gefunden"
- Progress bar should show completion (or be hidden)
- No "searching" message when data comes from cache

**Root Cause (likely):**
The progress update logic in MapModal.js relies on geocoding callbacks to trigger status updates. When restaurants load from cache:
- Geocoding callbacks are not triggered (data already available)
- `updateProgress()` is never called with completion state
- Status remains stuck on initial "Restaurants werden gesucht..." text

**Steps to Reproduce:**
1. Search for restaurants on Falter.at (any region)
2. Open MapModal - first time will geocode and show correct completion message
3. Close modal and reopen immediately
4. Observe: Status shows "Restaurants werden gesucht..." instead of "✓ X Restaurants gefunden"
5. Map displays correctly but status message is wrong

**Scope of Work:**

1. **Investigate cache loading flow:**
   - Trace how MapModal detects cached data
   - Identify where cache data gets loaded into modal
   - Find why `updateProgress()` is not called

2. **Fix status update logic:**
   - Add cache detection in MapModal initialization
   - Call `updateProgress()` with completion state when loading from cache
   - Ensure count matches number of cached restaurants
   - Set `isFinal: true` to show completion message

3. **Update progress bar:**
   - Show completed progress bar when cache loaded
   - Or hide progress bar entirely for cached data (instant load)
   - Ensure visual consistency with fresh geocoding completion

4. **Test both paths:**
   - Fresh geocoding: Status should progress correctly (already works)
   - Cached data: Status should immediately show completion
   - Mixed (partial cache): Status should show correct count

**Acceptance Criteria:**
- [ ] Opening MapModal with cached data shows "✓ X Restaurants gefunden" immediately
- [ ] Progress bar shows completion or is hidden for cached data
- [ ] Restaurant count in status message is accurate
- [ ] Fresh geocoding still works correctly (no regression)
- [ ] Mixed cache/fresh scenario handles status updates correctly
- [ ] No console errors when loading from cache
- [ ] Manual testing confirms fix across different search results
- [ ] Commit message: `fix(modal): update status message when loading from cache`

**Technical Notes:**
- Related to MapModal.js:259 ("Restaurants werden gesucht...")
- Progress system added in FALTMAP-42 (Sprint 9)
- Cache system uses `chrome.storage.local` with 30-day TTL
- Need to hook into cache loading path to trigger status update
- Consider calling `this.updateProgress(cachedCount, cachedCount, true)` on cache load

**Files Likely Affected:**
- `modules/MapModal.js` - Progress update logic, cache detection
- Potentially `content.js` - If cache loading happens there

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

### 🎟️ **TICKET: FALTMAP-39 - Optimize Auto-Zoom Behavior for Bundesland Searches**
- Epic: E04 (UI/UX Polish)
- Status: Deferred
- Priority: 🔵 Low (post-1.0)

**User Story:**
As a user searching for restaurants across an entire Bundesland, I want the map auto-zoom to provide a useful view of the region, so I can see relevant results without the map zooming too far out or in.

**Context:**
Currently, the map auto-zooms to fit all markers after 5 restaurants are geocoded. This works well for Wien (restaurants clustered in one city) but has limitations for Bundesland searches:

**Current behavior:**
- Wien searches: Auto-zoom works great (restaurants in small area)
- Bundesland searches: Auto-zoom might zoom too far out if restaurants are spread across entire region
- Example: "Salzburg, all price categories" → 100 restaurants across entire Bundesland → auto-zoom shows very wide view
- Issue: With 100-result limit, some regions might not have pins, making the zoomed-out view less useful

**Problem:**
- Auto-zoom doesn't differentiate between Wien (clustered) and Bundesländer (spread out)
- No awareness of result distribution or density
- Fixed behavior regardless of search scope

**Scope of Work:**

1. **Evaluate Auto-Zoom Strategy:**
   - Analyze user behavior: Do users prefer auto-zoom for Bundesland searches?
   - Compare: Auto-zoom vs manual zoom control
   - Gather data on typical search patterns

2. **Potential Solutions (evaluate):**
   - **Option A:** Disable auto-zoom for non-Wien Bundesländer (keep manual control)
   - **Option B:** Smart zoom - only auto-zoom if markers within reasonable distance threshold
   - **Option C:** Different auto-zoom thresholds per region (Wien vs Bundesländer)
   - **Option D:** Show "X results beyond map bounds" indicator when zoomed
   - **Option E:** Hybrid - auto-zoom for <20 restaurants, skip for larger result sets

3. **Implementation (if changes warranted):**
   - Update MapModal.js auto-zoom logic
   - Add Bundesland-awareness to zoom calculation
   - Test with various search scenarios
   - Ensure Wien behavior unchanged (backward compatibility)

**Acceptance Criteria:**
- [ ] User research/feedback collected on auto-zoom behavior
- [ ] Solution evaluated and chosen (or decision to keep current behavior)
- [ ] If implemented: Auto-zoom provides useful view for both Wien and Bundesland searches
- [ ] Wien backward compatibility maintained
- [ ] Manual testing across all 9 Bundesländer
- [ ] No regressions in map UX

**Technical Notes:**
- This is a UX optimization, not a critical bug
- Current implementation (zoom 9 + auto-zoom) is "good enough" for v1.0
- Defer until post-1.0 when we have more user feedback
- May decide current behavior is optimal and close as "won't fix"

**Research Questions:**
- Do users understand they can manually zoom/pan?
- Is auto-zoom helpful or confusing for Bundesland searches?
- What percentage of searches are Wien vs Bundesländer?
- What's the typical result count distribution?

---

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
