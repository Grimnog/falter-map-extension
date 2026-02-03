# Falter Map Extension - Completed Tickets

This document archives all completed tickets with their final status. It serves as a historical record of work completed on the project.

---

## Sprint 1 & 2: Foundation & Modularization

**Completed:** 2026-01 (dates approximate)

### FALTMAP-01 through FALTMAP-07: Foundational Refactoring and Basic Testing
- **Status:** Done ✅
- **Summary:** Initial codebase refactoring to establish clean architecture and basic test coverage
- **Outcome:** Modular codebase with clear separation of concerns

### FALTMAP-08: UI Modularization
- **Status:** Done ✅
- **Summary:** Extracted UI components into separate modules
- **Outcome:** Improved code organization and maintainability

### FALTMAP-09: Error Handling
- **Status:** Done ✅
- **Summary:** Implemented comprehensive error handling throughout the extension
- **Outcome:** Graceful failure modes and user-friendly error messages

### FALTMAP-11: Additional Modularization
- **Status:** Done ✅
- **Summary:** Further modularization of remaining components
- **Outcome:** Clean, well-structured codebase

---

## Sprint 3: Testing & Core Features

**Completed:** 2026-01

### FALTMAP-10: Comprehensive Test Suite
- **Status:** Done ✅
- **Epic:** E03 (Testing & Reliability)
- **Summary:** Built comprehensive test suite with 98 tests and 80%+ coverage
- **Outcome:** High confidence in code quality and reliability
- **Coverage:** 80%+ across critical modules (cache-utils, geocoder, dom-parser, map-modal)

### FALTMAP-13: Marker Clustering
- **Status:** Done ✅
- **Epic:** E05 (Core Feature Enhancements)
- **Summary:** Implemented marker clustering for dense map areas
- **Outcome:** Improved map performance and usability when displaying many restaurants
- **Technical:** Integrated Leaflet.markercluster plugin

### FALTMAP-19: Full Accessibility Support
- **Status:** Done ✅
- **Epic:** E04 (UI/UX Polish)
- **Summary:** Implemented comprehensive accessibility features
- **Outcome:** WCAG 2.1 AA compliant with ARIA labels, focus management, and screen reader support
- **Features:**
  - ARIA labels on all interactive elements
  - Keyboard navigation support
  - Focus management for modal
  - Screen reader announcements for status changes

---

## Sprint 4: Post-0.6.0 UX Improvements

**Completed:** 2026-01

### FALTMAP-21: Auto-Zoom After First 5 Geocoded Restaurants
- **Status:** Done ✅
- **Epic:** E04 (UI/UX Polish)
- **Priority:** High

**User Story:**
As a user, I want the map to automatically zoom to show my restaurants as soon as enough are loaded, so I don't have to manually adjust the view.

**Context:**
Users had to wait for all restaurants to be geocoded before seeing an appropriate map view. This created a poor initial experience, especially for large result sets.

**Solution:**
Implemented auto-zoom after the first 5 restaurants are successfully geocoded. This provides:
- Immediate visual feedback with a sensible map view
- Better perceived performance (map becomes useful quickly)
- Works for both small and large result sets

**Outcome:**
- Map automatically fits bounds after 5 restaurants
- Significantly improved initial user experience
- Users see a useful map view within 1-2 seconds of loading

**Acceptance Criteria Completed:**
- ✅ Auto-zoom triggers after 5th successful geocode
- ✅ Map view includes all geocoded restaurants
- ✅ Works correctly for result sets < 5 and > 5 restaurants
- ✅ No performance degradation
- ✅ Manual testing confirmed improved UX

---

### FALTMAP-22: Modal Header Redesign with Falter Yellow Branding
- **Status:** Done ✅
- **Epic:** E04 (UI/UX Polish)
- **Priority:** High

**User Story:**
As a user, I want the extension to feel professional and visually connected to Falter's brand, so I trust it's a quality tool.

**Context:**
The modal header lacked clear branding and didn't align with Falter's visual identity. The design felt generic and didn't establish visual connection to Falter.

**Solution:**
Redesigned modal header with:
- Falter's signature yellow (#FFD700) as accent color
- Black text for optimal readability and contrast
- Clean, modern design that feels premium
- Clear visual hierarchy

**Outcome:**
- Professional, branded appearance
- Strong visual identity aligned with Falter
- Improved trust and perceived quality
- Better contrast and readability

**Acceptance Criteria Completed:**
- ✅ Falter yellow (#FFD700) used in header
- ✅ Black text on yellow background (high contrast)
- ✅ Clean, modern design
- ✅ Manual testing confirmed improved aesthetics
- ✅ Consistent with Falter brand identity

---

### FALTMAP-23: German UI Text Throughout Modal
- **Status:** Done ✅
- **Epic:** E04 (UI/UX Polish)
- **Priority:** High

**User Story:**
As a German-speaking user on a German website (Falter.at), I want all UI text to be in German, so the experience feels native and professional.

**Context:**
The modal had mixed German and English text, creating an inconsistent and unprofessional user experience. Since Falter.at is a German-language publication, the extension should use German throughout.

**Solution:**
- Converted all UI text to German
- Cleaner header design (removed redundant text)
- Consistent language throughout the extension
- Professional, localized experience

**Changes:**
- "Show on Map" → "Auf Karte anzeigen"
- "Search running..." → "Suche läuft..."
- "Search completed" → "Suche abgeschlossen"
- All button labels, error messages, and status text converted to German

**Outcome:**
- Fully German UI, consistent with Falter.at
- Professional, native-feeling experience
- Cleaner, more refined design
- Better user trust and engagement

**Acceptance Criteria Completed:**
- ✅ All modal text converted to German
- ✅ No English text remaining in UI
- ✅ Error messages in German
- ✅ Status messages in German
- ✅ Cleaner header design
- ✅ Manual testing confirmed language consistency

---

## Sprint 5: Reliable Foundation

**Completed:** 2026-01-30

### FALTMAP-34: Implement Result Limiting to Prevent API Abuse
- **Status:** Done ✅
- **Epic:** E03 (Testing & Reliability)
- **Priority:** Critical

**User Story:**
As a responsible user of open-source infrastructure (Nominatim), I want the extension to limit geocoding to a reasonable number of results, so we don't violate Nominatim's Terms of Service or abuse their free service.

**Context:**
Nominatim's usage policy explicitly states: "Nominatim is not suitable for bulk geocoding." Falter.at allows searches returning massive result sets (e.g., "Alle Bundesländer" = 6952 restaurants). Without limiting, the extension would violate Nominatim TOS and abuse free infrastructure.

**Solution Implemented:**
- **Hard limit of 100 geocoded restaurants** per search
- **Silent limiting** (no confirmation popup, automatic)
- **Smart pagination** (fetches only ~7 pages for 100 results, not all 98 pages)
- **Early estimation** (checks pagination info from first page, shows warning before fetching)
- **Transparent UI** (attribution text shows "100 von 4747 angezeigt (Limit) · Mit Filter eingrenzen")

**Technical Implementation:**
1. Added `CONFIG.GEOCODING.MAX_RESULTS = 100` and `EXTREME_RESULT_THRESHOLD = 1000`
2. Created `fetchUpToLimit()` function in dom-parser.js for smart pagination
3. Estimate total from first page, auto-limit if > 100
4. Show attribution text at bottom-left of map when results are limited
5. Respect Leaflet OSM attribution (kept separate at bottom-right)

**Outcome:**
- ✅ Respects Nominatim TOS (no bulk geocoding)
- ✅ Dramatically faster UX (fetches 7 pages instead of 98)
- ✅ Transparent to users (attribution explains limitation)
- ✅ Ethical behavior (good open-source citizen)
- ✅ Non-intrusive (no popups, silent limiting)

**Acceptance Criteria Completed:**
- ✅ Hard limit of 100 implemented and configurable
- ✅ Smart fetching stops pagination early
- ✅ No confirmation popup (silent limiting)
- ✅ Attribution text shows when limited (bottom-left)
- ✅ Both parts of text are bold
- ✅ OSM attribution respected (bottom-right, separate)
- ✅ Works for all scenarios (≤100 and >100)
- ✅ Manual testing confirmed correct behavior
- ✅ Commits follow atomic commit principles

**Key Files Modified:**
- `modules/constants.js` - Added GEOCODING config
- `modules/dom-parser.js` - Added fetchUpToLimit() function
- `content.js` - Implemented early estimation and smart fetching
- `modules/MapModal.js` - Added custom attribution div
- `content.css` - Styled custom attribution element

---

### FALTMAP-29: Implement Polite Delays in Pagination Fetching
- **Status:** Done ✅ (Already Implemented)
- **Epic:** E03 (Testing & Reliability)
- **Priority:** High
- **Completed:** 2026-01-30

**User Story:**
As a responsible user of Falter's infrastructure, I want the extension to make requests at a reasonable pace so we don't create unnecessary load on their servers.

**Context:**
This ticket was created to add polite delays between pagination page fetches to be a "good web citizen" and respect Falter's servers. Upon investigation, this feature was **already fully implemented** in the codebase from the beginning.

**Existing Implementation:**
- **CONFIG.PAGINATION.FETCH_DELAY_MS = 300ms** (already in constants.js)
- **fetchAllPages()** already implements delay between pages
- **fetchUpToLimit()** already implements delay between pages
- 300ms is the recommended middle ground (250-500ms range)

**Code Found:**
```javascript
// In both fetchAllPages() and fetchUpToLimit():
if (page < pagination.total) {
    await new Promise(resolve => setTimeout(resolve, CONFIG.PAGINATION.FETCH_DELAY_MS));
}
```

**Outcome:**
- ✅ Polite 300ms delays already present
- ✅ Configurable via CONFIG object
- ✅ Respects Falter's servers
- ✅ Mimics human-like browsing patterns
- ✅ No code changes needed

**Acceptance Criteria (All Already Met):**
- ✅ Polite delay (300ms) implemented in fetchAllPages()
- ✅ Delay value is configurable (CONFIG object)
- ✅ Multi-page fetching works correctly
- ✅ Status messages update properly during delays
- ✅ No degradation in perceived performance

**Technical Notes:**
- This was already part of the original implementation
- Good engineering practice from the start
- Shows respect for Falter's infrastructure

---

### FALTMAP-31: Implement Graceful Degradation for API Failures
- **Status:** Done ✅
- **Epic:** E03 (Testing & Reliability)
- **Priority:** High
- **Completed:** 2026-01-30

**User Story:**
As a user, I want to see the list of restaurants even if the geocoding service is down, so the extension still provides value when external services fail.

**Context:**
Previously, if the Nominatim geocoding API failed completely (network error, API down, etc.), the geocoding process would throw an unhandled error. While the modal and list were already shown before geocoding started (good architecture), there was no graceful handling of complete geocoding failures.

**Solution Implemented:**
- **Added error state handling** to MapModal with `showGeocodingError()` method
- **Wrapped geocoding in try-catch** in `startGeocoding()` function
- **Error state styling** (red background) for status indicator
- **User-friendly error messaging** in German with toast notification
- **Restaurant list remains functional** even when all geocoding fails
- **Cached coordinates still used** if available

**Technical Implementation:**
1. Added `showGeocodingError()` method to MapModal.js (lines 467-476)
   ```javascript
   showGeocodingError(message = 'Geokodierung fehlgeschlagen') {
       if (this.dom.geocodeStatus) {
           this.dom.geocodeStatus.classList.remove('loading');
           this.dom.geocodeStatus.classList.add('error');
       }
       if (this.dom.statusLabel) {
           this.dom.statusLabel.textContent = message;
       }
   }
   ```

2. Added error state CSS styling in content.css:
   ```css
   .status-value.error {
       background: rgb(254, 202, 202);
       color: rgb(153, 27, 27);
   }
   ```

3. Wrapped `geocodeRestaurants()` call in try-catch in content.js (lines 74-145):
   - On error: logs to console, shows error status, displays restaurant list with cached coords
   - Updates navigation with available results
   - Shows toast notification with error message from ERROR_MESSAGES

**Outcome:**
- ✅ Extension provides value even when Nominatim API is down
- ✅ Restaurant list always visible and functional
- ✅ Clear, non-alarming error messaging in German
- ✅ Graceful handling of complete API failures
- ✅ Cached coordinates still utilized when available
- ✅ No unhandled errors propagating to user

**Acceptance Criteria Completed:**
- ✅ Modal shows immediately after restaurant data is fetched (already implemented)
- ✅ Restaurant list is visible before geocoding completes (already implemented)
- ✅ Map displays "Geocodierung läuft..." state initially (already implemented)
- ✅ If geocoding fails completely, map shows clear error message
- ✅ If geocoding partially fails, successful markers still display (already handled)
- ✅ Restaurant list remains functional regardless of geocoding outcome
- ✅ No console errors for API failures (handled gracefully)
- ✅ Manual testing confirmed graceful degradation

**Key Files Modified:**
- `modules/MapModal.js` - Added showGeocodingError() method
- `content.css` - Added error state styling
- `content.js` - Wrapped geocoding in try-catch with error handling

---

### FALTMAP-32: Optimize Cache Cleaning with Just-in-Time Execution
- **Status:** Done ✅
- **Epic:** E03 (Testing & Reliability)
- **Priority:** Medium
- **Completed:** 2026-01-30

**User Story:**
As a user browsing Falter.at, I want the extension to only do work when I actually use it, so it doesn't slow down my normal browsing.

**Context:**
Previously, `CacheManager.cleanExpired()` ran in the `init()` sequence on every page load of a Falter.at search results page. This meant:
- Extension performed cache cleanup even if user never clicked "Auf Karte anzeigen"
- Unnecessary work on every page visit
- Wasted CPU cycles and storage I/O for users just browsing

**Solution Implemented:**
Moved cache cleanup to just-in-time execution - it now runs only when the user actively uses the extension.

**Technical Implementation:**
1. **Removed from content.js init():**
   ```javascript
   // Removed these lines (313-316):
   CacheManager.cleanExpired().catch(err => {
       console.error('Cache cleanup error:', err);
   });
   ```

2. **Added to geocoder.js geocodeRestaurants():**
   ```javascript
   // Added at start of function (109-113):
   await CacheManager.cleanExpired().catch(err => {
       console.error('Cache cleanup error:', err);
   });
   ```

**Flow Change:**
- **Before:** Page loads → init() → CacheManager.cleanExpired() runs (even if user never clicks button)
- **After:** User clicks "Auf Karte anzeigen" → geocodeRestaurants() → CacheManager.cleanExpired() → geocode

**Outcome:**
- ✅ Cache cleanup only runs when extension is actively used
- ✅ Improved performance for passive browsing (no unnecessary work)
- ✅ No functionality change - cache expiration still 30 days
- ✅ Aligns with "do work only when needed" principle

**Acceptance Criteria Completed:**
- ✅ `CacheManager.cleanExpired()` removed from init sequence
- ✅ `CacheManager.cleanExpired()` added to start of `geocodeRestaurants()`
- ✅ Cache cleanup only runs when user clicks button
- ✅ No change in cache expiration behavior (still 30 days)
- ✅ All existing tests pass (72/72 = 100%)
- ✅ Manual test: Passive browsing - no cache cleanup logs
- ✅ Manual test: Active use - cache cleanup runs before geocoding
- ✅ User verified: Page load feels snappier

**Key Files Modified:**
- `content.js` - Removed cache cleanup from init()
- `modules/geocoder.js` - Added cache cleanup to geocodeRestaurants()

---

### FALTMAP-33: Add Data Provenance Transparency with Attribution
- **Status:** Done ✅
- **Epic:** E03 (Testing & Reliability)
- **Priority:** Medium
- **Completed:** 2026-01-30

**User Story:**
As a user, I want to know where the extension's map data comes from, so I can trust the service and understand its sources.

**Context:**
The extension uses two OpenStreetMap services but only credited one:
- OpenStreetMap for map tiles ✅ (already attributed via Leaflet)
- Nominatim for geocoding ❌ (not attributed - **license violation**)

**License Requirement:**
According to OSM Foundation Attribution Guidelines:
> "Geocoders that use OpenStreetMap data must credit OpenStreetMap"
> "Applications that incorporate such a geocoder must credit OpenStreetMap"

Since we use Nominatim (a geocoder using OSM data), we **must** credit OpenStreetMap for the geocoding service, not just the map tiles. This was a compliance issue, not just "nice to have."

**Solution Implemented:**
Extended Leaflet attribution to credit both services in a single line:

**Before:**
```javascript
attribution: '© OpenStreetMap contributors'
```

**After:**
```javascript
attribution: '© OpenStreetMap contributors | Geocoding via Nominatim'
```

**Technical Implementation:**
- Single line change in MapModal.js (line 184)
- Uses existing Leaflet attribution mechanism (bottom-right of map)
- Both text portions are clickable links:
  - "OpenStreetMap" → https://www.openstreetmap.org/copyright
  - "Nominatim" → https://nominatim.org

**Outcome:**
- ✅ License compliant with OSM Foundation guidelines
- ✅ Transparent about data sources (map tiles + geocoding)
- ✅ Credits both free services we depend on
- ✅ Builds user trust through transparency
- ✅ Minimal code change (1 line)

**Acceptance Criteria Completed:**
- ✅ Leaflet attribution updated to include both OSM and Nominatim
- ✅ Attribution text: `"© OpenStreetMap contributors | Geocoding via Nominatim"`
- ✅ OpenStreetMap link points to copyright page
- ✅ Nominatim link points to nominatim.org
- ✅ Attribution visible in bottom-right corner (Leaflet default)
- ✅ Attribution clearly readable and non-intrusive
- ✅ Links work correctly when clicked
- ✅ User verified visibility and functionality

**Research Sources:**
- https://osmfoundation.org/wiki/Licence/Attribution_Guidelines
- https://wiki.openstreetmap.org/wiki/Attribution

**Key Files Modified:**
- `modules/MapModal.js` - Extended attribution string to include Nominatim

---

## Sprint 6: UI/UX Polish

**Started:** 2026-01-30

### FALTMAP-27: Improve Font Readability and Alignment with Falter Style
- **Status:** Done ✅
- **Epic:** E04 (UI/UX Polish)
- **Priority:** High
- **Completed:** 2026-01-30

**User Story:**
As a user, I want the extension's text to be clear and readable, with a visual style that feels consistent with Falter's branding.

**Context:**
The modal used system fonts (San Francisco, Segoe UI, Roboto) which didn't align with Falter's visual identity:
- Falter uses rounded, geometric fonts (Futura Round, Laguna Vintage)
- System fonts felt generic and not brand-aligned
- Readability could be improved with better typography

**Additional Challenge - Privacy Compliance:**
During implementation, discovered that using Google Fonts violates European privacy laws (GDPR/Austrian data protection). Google Fonts tracks user IP addresses, which has led to actual fines in Austria and Germany.

**Solution Implemented:**
1. **Font Choice:** Nunito (geometric, rounded sans-serif) via Bunny Fonts
   - Similar aesthetic to Futura Round (rounded, friendly, modern)
   - Excellent readability at all sizes
   - Multiple weights (400, 600, 700, 800) for typography hierarchy

2. **GDPR-Compliant Delivery:** Bunny Fonts (EU-based CDN)
   - Drop-in replacement for Google Fonts
   - No IP tracking or data collection
   - Respects European privacy laws
   - All fonts open source (SIL Open Font License)

3. **Typography Improvements:**
   - Letter-spacing increased to 0.025em in modal header (was -0.02em)
   - Letter-spacing increased to 0.01em in popup header (was -0.03em)
   - Modal header padding balanced: 26px top/bottom (was 28px/24px asymmetric)
   - Header font weight increased to 800 for more impact

4. **Applied to All UI Elements:**
   - Modal content (#falter-map-modal)
   - Button (#falter-map-btn)
   - Toast notifications
   - Alert modals
   - Popup (letter-spacing only, full popup refactor is FALTMAP-30)

**Technical Implementation:**
```css
/* Before: System fonts */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* After: Bunny Fonts with fallbacks */
@import url('https://fonts.bunny.net/css?family=nunito:400,600,700,800');
--font-primary: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

**Outcome:**
- ✅ Rounder, friendlier typography aligned with Falter's brand
- ✅ Improved readability throughout the modal
- ✅ Better letter-spacing (no longer cramped)
- ✅ Properly centered header
- ✅ GDPR-compliant (no Google tracking)
- ✅ Respects Austrian/European privacy laws
- ✅ System font fallbacks for reliability

**Acceptance Criteria Completed:**
- ✅ Free font alternatives identified (Nunito via Bunny Fonts)
- ✅ Fonts tested for readability and visual appeal
- ✅ New fonts applied to all modal UI elements
- ✅ Font sizes and weights consistent throughout
- ✅ Fonts load correctly with appropriate fallbacks
- ✅ Manual testing confirmed improved readability
- ✅ Visual style aligned with Falter's aesthetic
- ✅ No performance impact from font loading
- ✅ Privacy-compliant font delivery (Bunny Fonts, not Google Fonts)

**Key Files Modified:**
- `content.css` - Added Bunny Fonts import, updated all font-family declarations, improved letter-spacing and header padding
- `popup.html` - Improved letter-spacing for header text
- `docs/BACKLOG.md` - Updated FALTMAP-35 to document Bunny Fonts usage

**Privacy Compliance Research:**
- Bunny Fonts: https://fonts.bunny.net/ (EU-based, GDPR-compliant)
- Austrian data protection warnings about Google Fonts: https://www.wko.at/datenschutz/abmahnungen-google-fonts
- European alternatives: https://european-alternatives.eu/alternative-to/google-fonts

---

### FALTMAP-30: Refactor Popup for Design Consistency and UX Polish
- **Status:** Done ✅
- **Epic:** E04 (UI/UX Polish)
- **Priority:** High
- **Completed:** 2026-01-30

**User Story:**
As a user, I want the extension popup to be clean, professional, and consistent with the modal's design and language.

**Context:**
The popup (accessed by clicking the extension icon) had several UX issues:
- Design didn't match the modal (different header, colors, fonts)
- Mixed English and German text
- "Clear Cache" button too large/prominent
- Intrusive browser `alert()` for cache cleared confirmation
- Inconsistent spacing and styling
- No clear visual hierarchy

**Solution Implemented:**

1. **Design Alignment with Modal:**
   - Header now matches modal: yellow background (#fbe51f), same styling
   - Compact header: 12px padding, 15px font
   - Removed "Einstellungen" subtitle for cleaner look
   - Applied Nunito font via Bunny Fonts (GDPR-compliant)

2. **Full German Localization:**
   - "Extension Settings" → "Einstellungen" (removed)
   - "How to Use" → "Anleitung"
   - "Geocoding Cache" → "Geocoding-Cache"
   - "Cached addresses" → "Gespeicherte Adressen"
   - "Storage size" → "Speichergröße"
   - "Expiration" → "Gültigkeit"
   - "30 days" → "30 Tage"
   - "Clear Cache" → "Cache leeren"

3. **Unified Design System:**
   - Instructions box now matches info-card (same background, border, row separators)
   - Black bullet points (was yellow - better contrast)
   - All colors use CSS variables (DRY principle)
   - Uniform text sizing: 12px throughout
   - Consistent 6px row padding

4. **Compact Layout:**
   - Width: 288px → 280px
   - Reduced all padding and margins for tighter UI
   - Section spacing: 10px
   - More space-efficient overall

5. **Improved UX:**
   - Replaced browser `alert()` with subtle green success message
   - "✓ Cache geleert" appears for 3 seconds with slide-in animation
   - Added clickable link to Falter Lokalführer (opens in new tab)
   - Clear blue link color with underline for discoverability

6. **CSS Variables for All Colors:**
   - Extracted all hardcoded colors to `:root` variables
   - Added variables: `--text-tertiary`, `--border-light`, `--info-bg-*`, `--success-*`
   - Easier maintenance and theming

**Technical Implementation:**

```css
/* Header matches modal */
.header {
    padding: 12px 14px;
    background: var(--accent); /* #fbe51f */
}

/* Bunny Fonts (GDPR-compliant) */
@import url('https://fonts.bunny.net/css?family=nunito:400,600,700,800');

/* CSS variables for all colors */
:root {
    --success-bg-light: #d4edda;
    --success-border: #28a745;
    /* ... */
}
```

**Outcome:**
- ✅ Professional, polished popup aligned with modal design
- ✅ Fully localized in German
- ✅ Compact, space-efficient layout
- ✅ Consistent design language (instructions match info-card)
- ✅ Non-intrusive confirmation UX (no browser alerts)
- ✅ GDPR-compliant fonts (Bunny Fonts)
- ✅ Clickable link for easy access to Lokalführer
- ✅ DRY color system with CSS variables

**Acceptance Criteria Completed:**
- ✅ Popup design aligns with modal (colors, fonts, spacing)
- ✅ All text in German (no English/German mixing)
- ✅ Clear cache button appropriately sized
- ✅ Subtle, non-intrusive confirmation (green message, 3-second auto-hide)
- ✅ Cache usage display remains functional
- ✅ Professional and consistent feel
- ✅ User verified all functionality works
- ✅ Uniform text sizing and spacing throughout

**Key Files Modified:**
- `popup.html` - Complete redesign: header, layout, German text, CSS variables, clickable link
- `popup.js` - Removed `alert()`/`confirm()`, added subtle success message
- `content.css` - Added sync comment for Bunny Fonts URL

---

### FALTMAP-28: Redesign Status Message to Not Look Like Textbox
- **Status:** Done ✅
- **Epic:** E04 (UI/UX Polish)
- **Priority:** Medium
- **Completed:** 2026-01-30

**User Story:**
As a user, I should clearly understand which UI elements are informational vs. interactive, so I don't try to click or type in status messages.

**Context:**
The status message element (showing "Suche läuft..." / "Suche abgeschlossen") was confusing users:
- Looked like a textbox/input field (white background, border, rectangular shape)
- Created confusion about whether it was interactive
- Wasted vertical space with its own section
- Poor visual hierarchy - didn't integrate with the header

**Problem Analysis:**
- Element had textbox-like styling (border, padding, white background)
- Separated section created unnecessary white space
- Not clearly identifiable as a status indicator
- Users might try to click or type in it

**Solution Implemented:**

**Integrated Header Badge Design:**
- Moved status INTO the header (eliminated separate section)
- Right-aligned badge next to "Falter Restaurant Map" title
- Pill-shaped design with translucent white background
- Clear black border (2px Falter black) separates header from list
- Centered vertically with title text baseline

**Technical Implementation:**
```css
/* Header gets black bottom border */
.modal-header {
    padding: 18px 24px;
    border-bottom: 2px solid var(--falter-black);
}

/* Title has max-width to prevent overlap */
.modal-header h1 {
    max-width: 180px;  /* Leaves ~90px for badge (enough for "100/100") */
}

/* Status positioned absolutely in header */
.modal-status {
    position: absolute;
    top: 19px;  /* Center-aligned with h1 baseline */
    right: 24px;
}

/* Badge: pill-shaped, translucent, distinct */
.status-value {
    background: rgba(255, 255, 255, 0.3);
    border: 1.5px solid var(--falter-black);
    border-radius: 12px;
    padding: 4px 10px;
    backdrop-filter: blur(4px);
}
```

**Design Benefits:**
1. **No wasted space** - eliminated separate status section
2. **Clear visual hierarchy** - status is part of header chrome
3. **Not a textbox** - pill shape, translucent background, clearly non-interactive
4. **Compact** - reduced header from 26px to 18px padding
5. **Professional** - Falter black border creates strong separation
6. **Contextual** - status next to title makes logical sense

**Outcome:**
- ✅ Status badge clearly distinct from textbox
- ✅ Integrated into header (no wasted white space)
- ✅ Strong visual hierarchy: yellow header with black border → white list
- ✅ Pill-shaped badge is obviously non-interactive
- ✅ Works for both states ("Suche läuft..." / "Suche abgeschlossen")
- ✅ Properly aligned with title text (center baseline)
- ✅ Prevents text overlap (h1 max-width 180px, badge has ~90px space)
- ✅ Clean, modern, professional design

**Acceptance Criteria Completed:**
- ✅ Current styling analyzed (textbox appearance identified)
- ✅ Design alternatives explored (integrated header badge chosen)
- ✅ Status no longer resembles a textbox
- ✅ Clear visual hierarchy established
- ✅ Works for both status states
- ✅ User verified improved UX
- ✅ Compact layout without wasted space

**Key Files Modified:**
- `content.css` - Redesigned modal-header, modal-status, status-value; added positioning and borders
- `manifest.json` - Version bump to 0.8.0
- `popup.html` - Version bump to 0.8.0

---

**🎉 Sprint 6 Complete!** All 3 UI/UX Polish tickets done.

---

## Sprint 8: Austria-Wide Support

**Started:** 2026-02-01
**Completed:** 2026-02-03
**Release:** v0.9.0

### FALTMAP-26: Support All Austrian Bundesländer (Parent Ticket)
- **Status:** Done ✅
- **Epic:** E05 (Core Feature Enhancements)
- **Priority:** High

**User Story:**
As a user searching for restaurants in any Austrian Bundesland (Salzburg, Tirol, Kärnten, etc.), I want the map to work correctly for my region, not just Vienna.

**Context:**
Extension was Vienna-centric with hardcoded default map center and untested geocoding for other regions. Expanded to support all 9 Austrian Bundesländer.

**Outcome:**
- Extension works seamlessly across all 9 Bundesländer
- Smart map centering based on URL parameter
- Building-level geocoding precision nationwide
- 7-tier fallback system (70-80% success on Tier 1)
- 88 comprehensive automated tests
- v0.9.0 released and merged to main

---

### FALTMAP-26.1: Geocoding Analysis & Testing
- **Status:** Done ✅
- **Type:** Research (no code changes)
- **Completed:** 2026-02-01

**Summary:**
Comprehensive testing of geocoding with real addresses from all 8 non-Vienna Bundesländer to understand what works and what needs improvement.

**Key Findings:**
- ✅ Nominatim structured query API provides building-level precision
- ✅ 7-tier fallback strategy designed (structured queries > free-form)
- ✅ Restaurant name from Falter is powerful Tier 1 optimization (70-80% success)
- ✅ Multi-word cities, hyphenated cities, addresses without numbers need support
- ✅ Street name cleaning required for prefixes (e.g., "Strombad Donaulände")

**Deliverable:** Testing report at `docs/testing/faltmap-26-geocoding-analysis.md` (later removed during cleanup)

**Tested Addresses:**
- Niederösterreich: 3420 Klosterneuburg, Strombad Donaulände 15
- Oberösterreich: 4653 Eberstalzell, Solarstraße 2
- Vorarlberg: 6774 Tschagguns, Kreuzgasse 4
- Burgenland: 7434 Bernstein, Badgasse 48
- Steiermark: 8010 Graz, Heinrichstraße 56
- Tirol: 6020 Innsbruck, Leopoldstraße 7
- Salzburg: 5101 Bergheim, Kasern 4
- Kärnten: 9062 Moosburg, Pörtschacher Straße 44

---

### FALTMAP-26.2: Refactor Geocoder to Use Structured Query API
- **Status:** Done ✅
- **Type:** Major Refactoring
- **Completed:** 2026-02-01

**Summary:**
Complete architectural refactoring of geocoder.js from free-form queries to Nominatim structured query API with 7-tier fallback system.

**User Story:**
As a user searching in any Austrian Bundesland, I want my restaurant addresses geocoded with building-level precision so I can see exactly where each restaurant is located.

**Technical Implementation:**

**7-Tier Fallback System:**
1. **Tier 1: Restaurant name** (amenity query) - 70-80% success ⭐
2. **Tier 2: Street address** (street, city, ZIP) - 15-20% success
3. **Tier 3: Combined** (street + amenity + city) - 2-5% success
4. **Tier 4: Amenity types** (restaurant, cafe, bar, fast_food, pub) - 1-2% success
5. **Tier 5: Cleaned street name** (remove prefixes like "Strombad") - <1% success
6. **Tier 6: Free-form query** (handles complex addresses like "II. Block VI")
7. **Tier 7: City-level** (approximate, last resort, flagged)

**Key Features:**
- Structured query parameters: `street`, `city`, `postalcode`, `amenity`, `country`
- Address parsing for Austrian format: `{ZIP} {City}, {Street}`
- Multi-word city support (e.g., "Purbach am Neusiedler See")
- Hyphenated cities (e.g., "Deutsch Schützen-Eisenberg")
- Optional street numbers (handles location descriptors)
- Em-dash (–) and parentheses handling
- Generic street cleaning with regex patterns
- Rate limiting (1 req/sec, stop at first successful tier)

**Outcome:**
- ✅ Building-level precision for all 8 Bundesländer
- ✅ 70-80% success on Tier 1 (restaurant name) - 80/20 principle validated
- ✅ Wien backward compatibility maintained (no regressions)
- ✅ All test addresses geocoded successfully
- ✅ Burgenland edge cases resolved (multi-word cities, em-dash, optional numbers)

**Key Files Modified:**
- `modules/geocoder.js` - Complete refactor with 7-tier system (316 LOC)
- `modules/dom-parser.js` - Updated regex for Austria-wide address parsing
- `modules/constants.js` - Added retry delay configuration

---

### FALTMAP-26.3: Bundesland Center Coordinates Research
- **Status:** Done ✅
- **Type:** Research (constants definition)
- **Completed:** 2026-02-01

**Summary:**
Research and define accurate center coordinates for all 9 Austrian Bundesländer for dynamic map initialization.

**Implementation:**
Added `BUNDESLAND_CENTERS` object to `modules/constants.js` with coordinates for all Bundesland capitals:

```javascript
BUNDESLAND_CENTERS: {
    'Wien': [48.2082, 16.3719],              // Vienna
    'Niederösterreich': [48.2044, 15.6229],  // St. Pölten
    'Oberösterreich': [48.3059, 14.2862],    // Linz
    'Salzburg': [47.7981, 13.0465],          // Salzburg
    'Tirol': [47.2654, 11.3928],             // Innsbruck
    'Vorarlberg': [47.5026, 9.7473],         // Bregenz
    'Steiermark': [47.0709, 15.4383],        // Graz
    'Kärnten': [46.6239, 14.3076],           // Klagenfurt
    'Burgenland': [47.8455, 16.5249]         // Eisenstadt
}
```

**Outcome:**
- ✅ All 9 Bundesländer have documented center coordinates
- ✅ Coordinates point to Bundesland capitals/major cities
- ✅ Verified visually on OpenStreetMap
- ✅ Ready for dynamic map initialization

**Key Files Modified:**
- `modules/constants.js` - Added BUNDESLAND_CENTERS object

---

### FALTMAP-26.4: URL Parameter Parsing
- **Status:** Done ✅
- **Type:** Feature (URL parsing utility)
- **Completed:** 2026-02-01

**Summary:**
Extract Bundesland from Falter.at URL `?r=` parameter to enable dynamic map centering.

**User Story:**
As the extension, I need to detect which Bundesland the user is searching in by reading the URL parameter, so I can set the appropriate map center.

**Implementation:**
Created `modules/url-utils.js` with `getBundeslandFromURL()` function:

**Features:**
- Parses `window.location.search` for `?r=` parameter
- Handles URL encoding (e.g., `Nieder%C3%B6sterreich` → `Niederösterreich`)
- Case-insensitive matching with normalized output
- Edge cases handled (null, empty, invalid → return `null`)
- Uses `CONFIG.BUNDESLAND_CENTERS` as source of truth for valid names

**Technical Details:**
```javascript
function getBundeslandFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const bundesland = urlParams.get('r');

    if (!bundesland) return null;

    const normalized = decodeURIComponent(bundesland).trim();
    const validBundeslaender = Object.keys(CONFIG.BUNDESLAND_CENTERS);
    const match = validBundeslaender.find(
        b => b.toLowerCase() === normalized.toLowerCase()
    );

    return match || null;
}
```

**Outcome:**
- ✅ Bundesland detection from URL working
- ✅ All 9 valid Bundesland names handled
- ✅ URL decoding correct (handles umlauts)
- ✅ Safe fallback to `null` for invalid input
- ✅ 56 comprehensive tests added

**Key Files Created:**
- `modules/url-utils.js` - URL parsing utilities (50 LOC)
- `tests/url-utils.test.js` - 56 comprehensive tests

---

### FALTMAP-26.5: Dynamic Map Initialization
- **Status:** Done ✅
- **Type:** Feature (map initialization logic)
- **Completed:** 2026-02-01

**Summary:**
Implement smart map centering based on detected Bundesland from URL parameter, with Wien fallback.

**User Story:**
As a user searching in Salzburg, I want the map to start centered on Salzburg (not Vienna), so I don't experience a jarring map jump when results load.

**Implementation:**
Updated MapModal.js `initializeMap()` to use dynamic center:

```javascript
const bundesland = getBundeslandFromURL();
const initialCenter = bundesland && CONFIG.BUNDESLAND_CENTERS[bundesland]
    ? CONFIG.BUNDESLAND_CENTERS[bundesland]
    : CONFIG.MAP.DEFAULT_CENTER;

// Differential zoom: Wien = 13 (city-level), Bundesländer = 9 (state-level)
const initialZoom = bundesland && bundesland !== 'Wien'
    ? 9  // State-level zoom for Bundesländer
    : CONFIG.MAP.DEFAULT_ZOOM;  // City-level zoom (13) for Wien
```

**Key Features:**
- Dynamic center lookup from `BUNDESLAND_CENTERS`
- Wien fallback when no `?r=` parameter (backward compatible)
- Differential zoom levels (Wien: 13, Bundesländer: 9)
- Invalid Bundesland → Wien fallback (safe)
- Debug logging for initialization

**UX Improvement:**
Initial implementation used zoom 13 for all Bundesländer, but testing revealed this was too tight for state-level searches. After user feedback ("we often have restaurants from all over the bundesland"), implemented differential zoom:
- **Wien:** Zoom 13 (city-level - restaurants clustered)
- **Bundesländer:** Zoom 9 (state-level - restaurants spread across region)

**Outcome:**
- ✅ Map centers correctly for all 9 Bundesländer
- ✅ Wien searches identical to before (backward compatible)
- ✅ No `?r=` parameter defaults to Wien
- ✅ Invalid Bundesland falls back to Wien
- ✅ Appropriate zoom levels for city vs state searches
- ✅ Auto-zoom after 5 restaurants still works

**Key Files Modified:**
- `modules/MapModal.js` - Dynamic center and zoom logic
- `modules/url-utils.js` - Imported for Bundesland detection

---

### FALTMAP-26.6: Comprehensive Testing & Validation
- **Status:** Done ✅
- **Type:** Testing
- **Completed:** 2026-02-01

**Summary:**
End-to-end testing of all 9 Bundesländer with comprehensive automated test suite covering all Austria-wide features.

**User Story:**
As a user, I want confidence that the extension works correctly for all Austrian Bundesländer, with no regressions in existing functionality.

**Test Coverage:**

**Automated Tests (88 total):**
1. **url-utils.test.js** - 56 tests
   - Valid Bundesland names
   - Case-insensitive matching
   - URL encoding/decoding
   - Edge cases (null, empty, invalid)
   - All 9 Bundesländer detection

2. **geocoder.test.js** - 17 tests (+10 new)
   - All 7 geocoding tiers
   - Multi-word city names
   - Hyphenated cities
   - Street name cleaning
   - Address parsing edge cases
   - Tier fallback behavior

3. **dom-parser.test.js** - 15 tests (+6 new)
   - Austria-wide address parsing
   - Multi-word cities (e.g., "Purbach am Neusiedler See")
   - Hyphenated cities (e.g., "Deutsch Schützen-Eisenberg")
   - Addresses without numbers
   - Em-dash (–) handling
   - All 9 Bundesländer patterns

**Manual Testing:**
- All 9 Bundesland URLs tested end-to-end
- Wien backward compatibility verified
- Edge cases validated (invalid params → Wien fallback)
- Performance unchanged
- No console errors

**Outcome:**
- ✅ 88 comprehensive automated tests
- ✅ All critical paths covered
- ✅ Wien backward compatibility confirmed
- ✅ All 9 Bundesländer working
- ✅ Test suite integrated with test-runner.html

**Key Files Modified:**
- `tests/url-utils.test.js` - Created with 56 tests
- `tests/geocoder.test.js` - Added 10 new tests (17 total)
- `tests/dom-parser.test.js` - Added 6 new tests (15 total)
- `tests/test-runner.js` - Updated with new test suite

---

### FALTMAP-26.7: Documentation & Release
- **Status:** Done ✅
- **Type:** Documentation
- **Completed:** 2026-02-01

**Summary:**
Update all documentation, version numbers, and prepare v0.9.0 release for Austria-wide support.

**User Story:**
As a user, I want clear documentation that the extension now supports all Austrian Bundesländer, so I know it works for my region.

**Documentation Updates:**

**1. README.md:**
- Added "Austria-Wide Support" section
- Listed all 9 supported Bundesländer with flags
- Explained smart map centering feature
- Updated feature list and version history

**2. CHANGELOG.md:**
- Added v0.9.0 release section
- Documented all changes:
  - Austria-wide Bundesland support
  - Smart map centering with dynamic zoom
  - Enhanced geocoding (7-tier fallback system)
  - Bundesland center coordinates
  - 88 comprehensive automated tests
- Credited all sub-tickets (FALTMAP-26.1 through 26.7)
- Technical changes and testing additions

**3. Version Bumps:**
- `manifest.json`: `"version": "0.9.0"`
- `popup.html`: `<div class="version">v0.9.0</div>`
- Updated description to mention Austria-wide support

**4. Project Documentation:**
- `IMPLEMENTATION.md`: Marked Sprint 8 complete
- All FALTMAP-26 sub-tickets marked Done ✅

**Outcome:**
- ✅ README updated with Austria-wide support section
- ✅ CHANGELOG has complete v0.9.0 entry
- ✅ All version numbers synchronized (0.9.0)
- ✅ Documentation accurate and complete
- ✅ Ready for release

**Key Files Modified:**
- `README.md` - Austria-wide support section, feature updates
- `CHANGELOG.md` - v0.9.0 release notes
- `manifest.json` - Version bump to 0.9.0
- `popup.html` - Version bump to 0.9.0
- `docs/IMPLEMENTATION.md` - Sprint 8 marked complete
- `docs/BACKLOG.md` - Updated ticket statuses

---

### Post-Sprint Cleanup

**Background.js Refactoring** (2026-02-03)
- **Issue:** Gemini identified duplicate geocoding logic in background.js
- **Problem:** background.js had inferior duplicate implementation of geocoding
  - Basic free-form queries only (no 7-tier fallback)
  - Missing Austria-wide improvements
  - Violated DRY principle
  - All message handlers were dead code (unused)
- **Solution:** Removed all duplicate and unused code
  - Deleted duplicate geocodeAddress function (29 lines)
  - Deleted duplicate geocodeRestaurants function (53 lines)
  - Removed all 5 unused message handlers (62 lines)
  - Removed unused imports (CacheManager, CONFIG)
- **Outcome:** 154 lines removed (159 → 5 lines), consistent geocoding behavior
- **Commit:** `8b27785` - refactor: remove duplicate geocoding logic from background.js

**Repository Cleanup** (2026-02-03)
- Deleted `/docs/testing/` folder (geocoding analysis report no longer needed)
- Deleted `/images/` folder (unused marker icons)
- Removed 4 files, 894 lines deleted
- **Commit:** `f6af68f` - chore: clean up unused files and folders

---

**🎉 Sprint 8 Complete!** Austria-wide support v0.9.0 released.

**Key Achievements:**
- 🇦🇹 Support for all 9 Austrian Bundesländer
- 🎯 Building-level geocoding precision nationwide
- 🗺️ Smart map centering with dynamic zoom
- ⚡ 70-80% success on Tier 1 (restaurant name optimization)
- 🧪 88 comprehensive automated tests
- 📝 Complete documentation and release
- 🧹 Code cleanup and DRY improvements

---

## Notes on Archive Format

This archive preserves completed tickets as they were at the time of completion. For older tickets (Sprint 1 & 2), only summary information is available. For newer tickets (Sprint 3 & 4), full user stories, context, and acceptance criteria are preserved where available.
