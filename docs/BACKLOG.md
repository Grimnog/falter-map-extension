# Falter Map Extension - Backlog

This document contains all backlog tickets that can be drawn from for future sprints. Tickets are organized by Epic to show what each contributes to.

**Completed tickets** are archived in `docs/CHANGELOG_TICKETS.md`.  
**Active sprint tickets** are in `docs/IMPLEMENTATION.md`.

---
## Epic E05: Core Feature Enhancements

### 🎟️ **TICKET: FALTMAP-26 - Support All Austrian Bundesländer (Not Just Vienna)**
- Epic: E05 (Core Feature Enhancements)
- Status: Planning Complete - Ready for Implementation
- Priority: 🟡 High
- **Depends on:** FALTMAP-34 (Result Limiting) - ✅ COMPLETE

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

---

## Final Implementation Plan

**Approach Decided:** Dynamic Map Centers (Option B)
- Parse URL parameter `?r=Bundesland` to detect region
- Use Bundesland-specific center coordinates
- Maintain backward compatibility (Wien default if no parameter)
- Test geocoding with real addresses from each Bundesland

**Real-World Test Addresses (provided by User):**
- Niederösterreich: `3420 Klosterneuburg, Strombad Donaulände 15`
- Oberösterreich: `4653 Eberstalzell, Solarstraße 2`
- Vorarlberg: `6774 Tschagguns, Kreuzgasse 4`
- Burgenland: `7434 Bernstein, Badgasse 48`
- Steiermark: `8010 Graz, Heinrichstraße 56`
- Tirol: `6020 Innsbruck, Leopoldstraße 7`
- Salzburg: `5101 Bergheim, Kasern 4`
- Kärnten: `9062 Moosburg, Pörtschacher Straße 44`

**Key Technical Insights:**
- Falter.at does NOT include Bundesland name in addresses
- Address format: `{ZIP} {City}, {Street}` (uniform across all Bundesländer)
- Austrian ZIP system is complex (some ranges mixed between Bundesländer)
- URL parameter `?r=` is authoritative source for Bundesland detection
- ZIP-to-Bundesland mapping NOT reliable (parked for future if needed)

**Backward Compatibility Requirements:**
- ⚠️ **NO BREAKING CHANGES** - Wien searches must work identically to before
- Default behavior (no `?r=` param) must use Wien center
- Vienna-specific geocoding logic must remain untouched

---

## Sub-Tickets Breakdown

This ticket is broken into 7 atomic sub-tickets for clean, incremental implementation:

1. **FALTMAP-26.1** - Geocoding Analysis & Testing (research, no code)
2. **FALTMAP-26.2** - Geocoding Enhancement for Non-Vienna Addresses (geocoding logic)
3. **FALTMAP-26.3** - Bundesland Center Coordinates Research (constants definition)
4. **FALTMAP-26.4** - URL Parameter Parsing (utility function)
5. **FALTMAP-26.5** - Dynamic Map Initialization (map setup logic)
6. **FALTMAP-26.6** - Comprehensive Testing & Validation (end-to-end testing)
7. **FALTMAP-26.7** - Documentation & Release (docs, version bump)

**Implementation will be done sequentially, one sub-ticket at a time, with testing and approval at each step.**

---

## Deferred to Future Tickets

**FALTMAP-37: Improve default map view for "Alle Bundesländer" search**
- Handles `https://www.falter.at/lokalfuehrer/suche` (no `?r=` parameter)
- Decides between Wien default vs Austria-wide view
- Separate ticket to keep FALTMAP-26 focused

---

## Overall Acceptance Criteria

- [ ] Extension works for searches in all 9 Bundesländer
- [ ] Map centers appropriately for each Bundesland (dynamic based on URL)
- [ ] Geocoding succeeds for addresses in all regions (tested with real examples)
- [ ] Auto-zoom handles both city-level and state-level searches
- [ ] Wien searches work identically to before (backward compatibility)
- [ ] Manual testing confirms functionality in each Bundesland
- [ ] Documentation updated to reflect Austria-wide support
- [ ] Version bumped to 0.9.0

---

### 🎟️ **SUB-TICKET: FALTMAP-26.1 - Geocoding Analysis & Testing**
- Parent: FALTMAP-26
- Epic: E05 (Core Feature Enhancements)
- Status: Open
- Priority: 🟡 High
- Type: Research (no code changes)

**User Story:**
As an engineer, I need to understand how well the current geocoding logic works for all Austrian Bundesländer, so I can identify what needs to be fixed.

**Context:**
Before making any code changes, we need empirical data:
- Does current geocoding work for non-Vienna addresses?
- What query formats does Nominatim expect?
- Are there patterns in failures?
- Do we need to add Bundesland names to queries?

**Scope of Work:**

1. **Test Current Geocoding with Real Addresses:**
   - Use the 8 non-Vienna example addresses provided by User
   - Test with current extension (no code modifications)
   - Document success/failure for each address
   - Record Nominatim responses

2. **Experiment with Query Variations:**
   - Test different query formats for failed addresses:
     - Current: `"3420 Klosterneuburg, Street, Austria"`
     - With Bundesland (German): `"3420 Klosterneuburg, Street, Niederösterreich, Austria"`
     - With Bundesland (English): `"3420 Klosterneuburg, Street, Lower Austria, Austria"`
     - City only: `"Klosterneuburg, Austria"`
   - Document which format works best

3. **Analyze Patterns:**
   - Group results by success/failure
   - Identify common failure causes
   - Determine if Bundesland name improves results
   - Document recommended approach

4. **Create Testing Report:**
   - Write `docs/testing/faltmap-26-geocoding-analysis.md`
   - Include all findings, test results, and recommendations
   - Provide clear guidance for FALTMAP-26.2 implementation

**Test Addresses (from User):**
```
Niederösterreich: 3420 Klosterneuburg, Strombad Donaulände 15
Oberösterreich: 4653 Eberstalzell, Solarstraße 2
Vorarlberg: 6774 Tschagguns, Kreuzgasse 4
Burgenland: 7434 Bernstein, Badgasse 48
Steiermark: 8010 Graz, Heinrichstraße 56
Tirol: 6020 Innsbruck, Leopoldstraße 7
Salzburg: 5101 Bergheim, Kasern 4
Kärnten: 9062 Moosburg, Pörtschacher Straße 44
```

**Acceptance Criteria:**
- [ ] All 8 non-Vienna addresses tested with current logic
- [ ] Success/failure documented for each address
- [ ] At least 3 query format variations tested for each failed address
- [ ] Patterns identified and documented
- [ ] Recommendations clear for next phase
- [ ] Testing report committed to `docs/testing/faltmap-26-geocoding-analysis.md`
- [ ] User approval obtained before proceeding to 26.2

**Deliverable:** Testing report with actionable findings, no code changes.

---

### 🎟️ **SUB-TICKET: FALTMAP-26.2 - Refactor Geocoder to Use Structured Query API**
- Parent: FALTMAP-26
- Epic: E05 (Core Feature Enhancements)
- Status: Ready to Start (26.1 complete ✅)
- Priority: 🟡 High
- Type: **Major Refactoring** (not simple enhancement!)

**User Story:**
As a user searching in any Austrian Bundesland, I want my restaurant addresses geocoded with building-level precision so I can see exactly where each restaurant is located on the map.

**Context:**
FALTMAP-26.1 testing revealed that:
- ✅ Nominatim **structured query API** provides building-level precision for all 8 Bundesländer
- ❌ Free-form `?q=` queries are ambiguous and unreliable
- ✅ Multi-tier fallback strategy needed for edge cases (markets, food halls)
- ✅ Restaurant name from Falter can be used as powerful fallback

**Current approach (inadequate):**
```javascript
const url = `${API}?format=json&q=${encodeURIComponent(address)}&limit=1`;
```
Problems: Ambiguous, unreliable, city-level precision (not building-level)

**Required approach (structured queries):**
```javascript
const params = new URLSearchParams({
    street: street,
    city: city,
    postalcode: zip,
    country: 'Austria',
    format: 'json',
    limit: 1
});
const url = `${API}?${params}`;
```

---

## Scope of Work

### 1. **Refactor to Structured Query API**

Replace free-form queries with Nominatim structured parameters:
- `street` - Street name and number
- `city` - City name
- `postalcode` - ZIP code
- `country` - "Austria"
- `amenity` - Restaurant name or type (for fallbacks)

### 2. **Implement Multi-Tier Fallback System**

**Philosophy:** Exhaust all structured query variations before falling back to free-form.

```javascript
async function geocodeAddress(address, restaurantName) {
    const { zip, city, street } = parseAddress(address);

    // Tier 1: Restaurant name (MOST SPECIFIC - 80/20 solution! 70-80% success)
    if (restaurantName) {
        let result = await tryStructured({ amenity: restaurantName, city, postalcode: zip });
        if (result) return result;
    }

    // Tier 2: Street address (reliable fallback for new/untagged restaurants - 15-20% success)
    let result = await tryStructured({ street, city, postalcode: zip });
    if (result) return result;

    // Tier 3: Combined street + amenity (disambiguation - 2-5% success)
    if (restaurantName) {
        result = await tryStructured({ street, amenity: restaurantName, city, postalcode: zip });
        if (result) return result;
    }

    // Tier 4: Try amenity types (restaurant, cafe, bar, fast_food - 1-2% success)
    for (const type of ['restaurant', 'cafe', 'bar', 'fast_food', 'pub']) {
        result = await tryStructured({ street, amenity: type, city, postalcode: zip });
        if (result) return result;
    }

    // Tier 5: Cleaned street name (<1% success)
    const cleanedStreet = cleanStreetName(street);
    if (cleanedStreet !== street) {
        result = await tryStructured({ street: cleanedStreet, city, postalcode: zip });
        if (result) return result;
    }

    // Tier 6: Free-form fallback (handles complex addresses like "II. Block VI")
    result = await tryFreeForm(`${address}, Austria`);
    if (result) return result;

    // Tier 7: City-level (approximate - absolute last resort)
    result = await tryStructured({ city, postalcode: zip });
    if (result) {
        result.approximate = true; // Flag for user warning
        return result;
    }

    return null;
}
```

### 3. **Extract Restaurant Name from Falter**

Integrate with DOM parser to pass restaurant name to geocoder:
```javascript
// In dom-parser.js (already extracting name)
const restaurantData = {
    name: restaurantName,  // Already available!
    address: address,
    url: url
};

// Pass to geocoder
const coords = await geocodeAddress(address, restaurantName);
```

### 4. **Add Street Name Cleaning Logic**

```javascript
function cleanStreetName(street) {
    // Drop location prefixes: "Strombad Donaulände 15" → "Donaulände 15"
    let cleaned = street.replace(/^(Strombad|Nord|Süd|Ost|West)\s+/i, '');

    // Drop market stall designations (but try full name first!)
    // "Stand 19" only dropped if initial query fails

    return cleaned.trim();
}
```

### 5. **Build Structured Query Helper**

```javascript
async function tryStructured(params) {
    const queryParams = new URLSearchParams({
        ...params,
        country: 'Austria',
        format: 'json',
        limit: 1
    });

    const url = `${CONFIG.NOMINATIM.API_URL}?${queryParams}`;

    // Respect rate limiting (1 req/sec)
    await rateLimitDelay();

    const response = await fetch(url, {
        headers: { 'User-Agent': CONFIG.NOMINATIM.USER_AGENT }
    });

    // ... handle response, return coords or null
}
```

### 6. **Maintain Wien Backward Compatibility (CRITICAL!)**

**Option A (Safer):** Keep Vienna-specific logic separate
- Lines 19-43 in geocoder.js remain untouched
- New structured query logic only for non-Wien addresses
- Zero risk of Wien regression

**Option B (Cleaner):** Refactor Vienna to structured queries too
- More consistent codebase
- But risky - must test thoroughly!

**Recommendation:** Option A (safer) for initial implementation

### 7. **Rate Limiting & Optimization**

- Respect 1 req/second limit
- **Stop at first successful tier** - don't try all 7!
- Add delays between tier attempts
- Max ~5-7 API calls per address (worst case)

### 8. **Approximate Location Flagging**

```javascript
// Tier 6 result (city-level)
if (result.approximate) {
    // Show user warning: "Approximate location"
    // Different pin color/style?
    // Tooltip: "Exact address not found"
}
```

---

## Acceptance Criteria

**Geocoding:**
- [ ] Geocoder refactored to use Nominatim structured query API
- [ ] Multi-tier fallback system implemented (Tiers 1-7)
- [ ] All 8 Bundesland test addresses geocode with **building-level precision**
- [ ] Wien market stall edge case (Mochi Ramen Bar) geocodes successfully
- [ ] Wien backward compatibility maintained (**NO REGRESSIONS**)

**Restaurant Name Integration:**
- [ ] Restaurant name extracted from Falter DOM
- [ ] Restaurant name passed to geocoder as parameter
- [ ] Amenity-based fallbacks (Tiers 2-4) work correctly

**Street Name Cleaning:**
- [ ] Street name cleaning logic implemented
- [ ] Klosterneuburg address works ("Strombad" prefix cleaned)
- [ ] Try full name first, cleaned version as fallback

**Testing:**
- [ ] Unit tests added for all fallback tiers
- [ ] Tests for all 8 Bundesland addresses
- [ ] Tests for Wien addresses (regression prevention)
- [ ] All tests pass (`tests/test-runner.html`)
- [ ] Manual testing on real Falter pages

**Code Quality:**
- [ ] Code documented with clear comments
- [ ] Rate limiting respected (1 req/sec)
- [ ] Approximate location flagging implemented
- [ ] Error handling for all API failures
- [ ] Follows existing code patterns and conventions

**Commit:**
- [ ] Atomic commit(s): `refactor: migrate geocoder to structured query API with multi-tier fallbacks`
- [ ] User verification complete

---

## Technical Notes

**Estimated Effort:** ~150-280 lines of significant refactoring
**Timeline:** 1-2 weeks (careful implementation + thorough testing)
**Risk:** Medium-High - core geocoding logic change
**Critical:** Wien backward compatibility absolutely required!

**Testing Report:** See `docs/testing/faltmap-26-geocoding-analysis.md` for detailed findings

**Dependencies:**
- Restaurant name available from DOM parser (already extracted)
- Nominatim structured query API documentation: https://nominatim.org/release-docs/develop/api/Search/

---

### 🎟️ **SUB-TICKET: FALTMAP-26.3 - Bundesland Center Coordinates Research**
- Parent: FALTMAP-26
- Epic: E05 (Core Feature Enhancements)
- Status: Open (can work in parallel with 26.1)
- Priority: 🟡 High
- Type: Research (constants definition)

**User Story:**
As an engineer, I need accurate center coordinates for each Austrian Bundesland, so the map can initialize at the correct location for each region.

**Context:**
To implement dynamic map centering (FALTMAP-26.5), we need to define center coordinates for all 9 Bundesländer. These will be stored as constants and used during map initialization.

**Scope of Work:**

1. **Research Center Coordinates:**
   - For each Bundesland, determine appropriate center coordinates
   - Methods:
     - **Option A (Recommended):** Query Nominatim for Bundesland capital/major city
     - **Option B:** Use Wikipedia/geographic data
     - **Option C:** Use real-world searches and record fitBounds() results
   - Verify coordinates visually on map (do they make sense?)

2. **Document Source & Rationale:**
   - For each coordinate pair, document:
     - How it was obtained (Nominatim query, Wikipedia, etc.)
     - What it represents (capital city, geographic center, etc.)
     - Why it was chosen
   - Keep documentation in code comments

3. **Add to constants.js:**
   - Create `BUNDESLAND_CENTERS` object in `modules/constants.js`
   - Format:
     ```javascript
     BUNDESLAND_CENTERS: {
         'Wien': [48.2082, 16.3719],  // Existing
         'Niederösterreich': [48.2, 15.6],  // St. Pölten (example)
         'Oberösterreich': [48.3, 14.3],  // Linz
         'Salzburg': [47.8, 13.05],  // Salzburg city
         'Tirol': [47.27, 11.4],  // Innsbruck
         'Vorarlberg': [47.5, 9.75],  // Bregenz
         'Steiermark': [47.07, 15.44],  // Graz
         'Kärnten': [46.62, 14.3],  // Klagenfurt
         'Burgenland': [47.85, 16.53]  // Eisenstadt
     },
     ```

4. **Verify Coordinates:**
   - Manually check each coordinate on OpenStreetMap
   - Ensure they point to appropriate locations
   - Adjust if needed for better UX

**Austrian Bundesländer & Capitals:**
- Wien → Wien (Vienna) - already defined ✅
- Niederösterreich → St. Pölten
- Oberösterreich → Linz
- Salzburg → Salzburg (city)
- Tirol → Innsbruck
- Vorarlberg → Bregenz
- Steiermark → Graz
- Kärnten → Klagenfurt
- Burgenland → Eisenstadt

**Acceptance Criteria:**
- [ ] All 9 Bundesländer have center coordinates defined
- [ ] Coordinates obtained using documented method (Nominatim recommended)
- [ ] Each coordinate verified visually on map
- [ ] Source and rationale documented in code comments
- [ ] Added to `modules/constants.js` as `BUNDESLAND_CENTERS` object
- [ ] Coordinates represent appropriate location (capital or major city)
- [ ] Atomic commit: `feat: add Bundesland center coordinates for Austria-wide support`
- [ ] User verification complete

**Deliverable:** Coordinate mapping in constants.js with documented sources.

**Technical Notes:**
- This can be done in parallel with FALTMAP-26.1
- No dependencies on other tickets
- Pure data addition, no logic changes

---

### 🎟️ **SUB-TICKET: FALTMAP-26.4 - URL Parameter Parsing**
- Parent: FALTMAP-26
- Epic: E05 (Core Feature Enhancements)
- Status: Blocked (depends on FALTMAP-26.3)
- Priority: 🟡 High
- Type: Feature (URL parsing utility)

**User Story:**
As the extension, I need to detect which Bundesland the user is searching in by reading the URL parameter, so I can set the appropriate map center.

**Context:**
Falter.at uses URL parameter `?r=Bundesland` to filter searches:
- `?r=Wien` → Vienna
- `?r=Salzburg` → Salzburg
- `?r=Niederösterreich` → Lower Austria
- No parameter → "Alle Bundesländer" (default)

We need to extract this parameter and map it to our Bundesland center coordinates.

**Scope of Work:**

1. **Create URL Parsing Utility:**
   - Add function to extract Bundesland from URL
   - Location: `modules/utils.js` (create if doesn't exist) or add to `content.js`
   - Function signature: `getBundeslandFromURL() → string | null`

2. **Handle All Bundesland Names:**
   - Parse URL parameter `?r=`
   - Map to Bundesland keys used in `BUNDESLAND_CENTERS`
   - Handle URL encoding (e.g., `Nieder%C3%B6sterreich` → `Niederösterreich`)

3. **Handle Edge Cases:**
   - No `?r=` parameter → return `null` (fallback to Wien)
   - Empty parameter `?r=` → return `null`
   - Invalid Bundesland name → return `null`
   - Case-insensitive matching (handle `?r=wien` vs `?r=Wien`)

4. **URL Parameter to Bundesland Mapping:**
   ```javascript
   // Expected URL parameter values (from Falter.at):
   'Wien' → 'Wien'
   'Niederösterreich' → 'Niederösterreich'
   'Oberösterreich' → 'Oberösterreich'
   'Salzburg' → 'Salzburg'
   'Tirol' → 'Tirol'
   'Vorarlberg' → 'Vorarlberg'
   'Steiermark' → 'Steiermark'
   'Kärnten' → 'Kärnten'
   'Burgenland' → 'Burgenland'
   ```

5. **Add Tests:**
   - Test valid Bundesland names
   - Test URL encoding handling
   - Test edge cases (null, empty, invalid)
   - Add to test suite

**Example Implementation:**
```javascript
/**
 * Extract Bundesland from current page URL
 * @returns {string|null} Bundesland name or null if not found/invalid
 */
function getBundeslandFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const bundesland = urlParams.get('r');

    if (!bundesland) return null;

    // Normalize: decode URI, trim
    const normalized = decodeURIComponent(bundesland).trim();

    // Valid Bundesländer (case-insensitive check)
    const validBundeslaender = [
        'Wien', 'Niederösterreich', 'Oberösterreich',
        'Salzburg', 'Tirol', 'Vorarlberg',
        'Steiermark', 'Kärnten', 'Burgenland'
    ];

    // Find matching Bundesland (case-insensitive)
    const match = validBundeslaender.find(
        b => b.toLowerCase() === normalized.toLowerCase()
    );

    return match || null;  // Return matched name or null
}
```

**Acceptance Criteria:**
- [ ] Function `getBundeslandFromURL()` implemented
- [ ] Handles all 9 valid Bundesland names
- [ ] URL decoding works correctly (handles `%C3%B6` → `ö`)
- [ ] Case-insensitive matching works
- [ ] Edge cases handled (null, empty, invalid → return `null`)
- [ ] Tests added for all scenarios
- [ ] All tests pass
- [ ] Code documented with JSDoc comments
- [ ] Atomic commit: `feat: add URL parameter parsing for Bundesland detection`
- [ ] User verification complete

**Technical Notes:**
- Keep it simple - just parse URL and validate
- No complex logic needed
- Return `null` for any edge case → safe fallback to Wien

---

### 🎟️ **SUB-TICKET: FALTMAP-26.5 - Dynamic Map Initialization**
- Parent: FALTMAP-26
- Epic: E05 (Core Feature Enhancements)
- Status: Blocked (depends on FALTMAP-26.3 and 26.4)
- Priority: 🟡 High
- Type: Feature (map initialization logic)

**User Story:**
As a user searching in Salzburg, I want the map to start centered on Salzburg (not Vienna), so I don't experience a jarring map jump when results load.

**Context:**
Currently, the map always initializes with Vienna center and zoom 13. We need to dynamically set the initial center based on the Bundesland detected from the URL parameter.

**Scope of Work:**

1. **Update Map Initialization in MapModal.js:**
   - Current behavior: Always use `CONFIG.MAP.DEFAULT_CENTER` (Wien)
   - New behavior: Use Bundesland-specific center if detected, else Wien

2. **Integrate URL Parsing:**
   - Call `getBundeslandFromURL()` to detect Bundesland
   - Look up center coordinates from `CONFIG.BUNDESLAND_CENTERS`
   - Fallback to `CONFIG.MAP.DEFAULT_CENTER` if no Bundesland detected

3. **Maintain Backward Compatibility:**
   - Wien searches work identically to before
   - No `?r=` parameter → Wien default (existing behavior)
   - Invalid Bundesland → Wien default (safe fallback)

4. **Implementation Approach:**
   ```javascript
   // In MapModal constructor or initialization:
   const bundesland = getBundeslandFromURL();
   const initialCenter = bundesland && CONFIG.BUNDESLAND_CENTERS[bundesland]
       ? CONFIG.BUNDESLAND_CENTERS[bundesland]
       : CONFIG.MAP.DEFAULT_CENTER;

   this.map = L.map('map-container').setView(initialCenter, CONFIG.MAP.DEFAULT_ZOOM);
   ```

5. **Consider Zoom Level:**
   - Keep `DEFAULT_ZOOM: 13` for now (city-level)
   - All Bundesländer use same zoom initially
   - Auto-zoom after 5 restaurants adjusts appropriately
   - (Future ticket could vary zoom by Bundesland size)

**Backward Compatibility Requirements:**
- ⚠️ **CRITICAL:** Wien searches must behave identically to before
- No `?r=` parameter → Wien center (existing behavior)
- `?r=Wien` → Wien center (existing behavior)
- Invalid Bundesland → Wien center (safe fallback)

**Acceptance Criteria:**
- [ ] Map initialization uses Bundesland-specific center when available
- [ ] Wien searches work identically to before (no regression)
- [ ] No `?r=` parameter defaults to Wien center
- [ ] Invalid Bundesland falls back to Wien center
- [ ] All 9 Bundesland URLs tested - map centers correctly
- [ ] Auto-zoom after 5 restaurants still works
- [ ] No console errors or warnings
- [ ] Code is clean and well-documented
- [ ] Atomic commit: `feat: dynamic map center based on Bundesland URL parameter`
- [ ] User verification complete

**Testing Checklist:**
- [ ] Test each Bundesland URL - verify initial center
- [ ] Test Wien URL - verify identical to before
- [ ] Test no `?r=` parameter - verify Wien default
- [ ] Test invalid `?r=InvalidName` - verify Wien fallback
- [ ] Test auto-zoom behavior unchanged

**Technical Notes:**
- Simple integration - just use different center coordinates
- No complex logic needed
- Fallback to Wien ensures safety

---

### 🎟️ **SUB-TICKET: FALTMAP-26.6 - Comprehensive Testing & Validation**
- Parent: FALTMAP-26
- Epic: E05 (Core Feature Enhancements)
- Status: Blocked (depends on 26.2 and 26.5)
- Priority: 🟡 High
- Type: Testing

**User Story:**
As a user, I want confidence that the extension works correctly for all Austrian Bundesländer, with no regressions in existing functionality.

**Context:**
After implementing geocoding enhancements (26.2) and dynamic map centers (26.5), we need comprehensive end-to-end testing to ensure:
- All Bundesländer work correctly
- Wien functionality unchanged (backward compatibility)
- No edge cases missed
- Ready for production release

**Scope of Work:**

1. **End-to-End Testing - All Bundesländer:**
   - For each of the 9 Bundesland URLs:
     - Visit URL on Falter.at
     - Click "Auf Karte anzeigen"
     - Verify:
       - Map centers correctly (Bundesland-specific center)
       - Restaurants geocode successfully
       - Auto-zoom works after 5 restaurants
       - Results list displays correctly
       - Keyboard navigation works
       - No console errors

2. **Backward Compatibility Testing - Wien:**
   - Test `?r=Wien` URL
   - Test no `?r=` parameter (default)
   - Verify identical behavior to v0.8.0:
     - Same initial center
     - Same geocoding results
     - Same map behavior
     - Same UX

3. **Edge Case Testing:**
   - Invalid Bundesland: `?r=InvalidName` → Wien fallback
   - Empty parameter: `?r=` → Wien fallback
   - Mixed searches (if possible - restaurants from multiple Bundesländer)
   - Special characters in addresses
   - Failed geocoding (some addresses fail) → graceful handling

4. **Regression Testing:**
   - Run full test suite: `tests/test-runner.html`
   - All existing tests must pass
   - No new console errors or warnings
   - Cache functionality still works
   - Popup functionality still works

5. **Performance Testing:**
   - Geocoding speed unchanged
   - Map initialization fast
   - No memory leaks
   - No performance degradation

6. **Document Testing Results:**
   - Create `docs/testing/faltmap-26-validation-report.md`
   - Document all test cases and results
   - Include screenshots if helpful
   - List any issues found and resolutions

**Testing Matrix:**

| Bundesland | URL Tested | Map Center OK | Geocoding OK | Auto-Zoom OK | Notes |
|------------|------------|---------------|--------------|--------------|-------|
| Wien | ✓ | ✓ | ✓ | ✓ | Backward compat verified |
| Niederösterreich | | | | | |
| Oberösterreich | | | | | |
| Salzburg | | | | | |
| Tirol | | | | | |
| Vorarlberg | | | | | |
| Steiermark | | | | | |
| Kärnten | | | | | |
| Burgenland | | | | | |
| No param (default) | ✓ | ✓ | ✓ | ✓ | Wien fallback verified |
| Invalid param | ✓ | ✓ | ✓ | ✓ | Wien fallback verified |

**Acceptance Criteria:**
- [ ] All 9 Bundesland URLs tested end-to-end
- [ ] Wien backward compatibility verified (no regressions)
- [ ] Edge cases tested and working (invalid params → Wien fallback)
- [ ] Full test suite passes (all existing tests green)
- [ ] No console errors or warnings
- [ ] Performance unchanged (no degradation)
- [ ] Validation report documented
- [ ] Any issues found are fixed before marking complete
- [ ] User verification complete - all Bundesländer work

**Deliverable:** Validation report + fully tested Austria-wide extension.

**Technical Notes:**
- This is the critical validation phase
- Do not rush - thorough testing required
- Any regressions found → fix immediately
- User must verify before proceeding to 26.7

---

### 🎟️ **SUB-TICKET: FALTMAP-26.7 - Documentation & Release**
- Parent: FALTMAP-26
- Epic: E05 (Core Feature Enhancements)
- Status: Blocked (depends on FALTMAP-26.6)
- Priority: 🟡 High
- Type: Documentation

**User Story:**
As a user, I want clear documentation that the extension now supports all Austrian Bundesländer, so I know it works for my region.

**Context:**
After successful implementation and testing (26.1-26.6), we need to update all documentation, version numbers, and prepare for the v0.9.0 release.

**Scope of Work:**

1. **Update README.md:**
   - Add "Austria-Wide Support" section
   - List all 9 supported Bundesländer
   - Explain how it works (dynamic map centering)
   - Add example URLs for each Bundesland
   - Update feature list

2. **Update CHANGELOG.md:**
   - Add v0.9.0 release section
   - Document all changes:
     - Austria-wide Bundesland support
     - Dynamic map centering
     - Enhanced geocoding for non-Vienna addresses
     - Bundesland center coordinates
   - Credit sub-tickets (FALTMAP-26.1 through 26.7)

3. **Version Bump:**
   - Update `manifest.json`: `"version": "0.9.0"`
   - Update `popup.html`: `<div class="version">v0.9.0</div>`
   - Consider updating description if needed

4. **Update IMPLEMENTATION.md:**
   - Mark FALTMAP-26 and all sub-tickets as Done ✅
   - Move to next sprint or mark sprint complete

5. **Update CHANGELOG_TICKETS.md:**
   - Move FALTMAP-26 and all sub-tickets to completed section
   - Document implementation details and outcomes

6. **Optional - Update Popup:**
   - Consider adding "Austria-wide" badge or mention
   - Keep it subtle and non-intrusive

**README.md Example Section:**
```markdown
## Austria-Wide Support

The extension works for restaurant searches across **all 9 Austrian Bundesländer**:

- 🏛️ **Wien** (Vienna)
- 🌲 **Niederösterreich** (Lower Austria)
- 🏔️ **Oberösterreich** (Upper Austria)
- 🎵 **Salzburg**
- ⛷️ **Tirol** (Tyrol)
- 🏞️ **Vorarlberg**
- 🍷 **Steiermark** (Styria)
- 🏖️ **Kärnten** (Carinthia)
- 🌾 **Burgenland**

The map automatically centers on the region you're searching in. Example URLs:
- [Restaurants in Salzburg](https://www.falter.at/lokalfuehrer/suche?r=Salzburg)
- [Restaurants in Tirol](https://www.falter.at/lokalfuehrer/suche?r=Tirol)
- [Restaurants in Graz](https://www.falter.at/lokalfuehrer/suche?r=Steiermark)
```

**CHANGELOG.md Example Entry:**
```markdown
## [0.9.0] - 2026-02-XX

### Added
- **Austria-wide Bundesland support** - Extension now works for all 9 Austrian Bundesländer
- **Dynamic map centering** - Map automatically centers on the Bundesland you're searching in
- **Bundesland center coordinates** - Defined accurate centers for all Austrian states
- **URL parameter detection** - Detects region from Falter.at's `?r=` filter parameter

### Changed
- Enhanced geocoding for non-Vienna addresses across all Bundesländer
- Map initialization now dynamic based on search region
- Improved address format handling for all Austrian regions

### Technical
- Added `BUNDESLAND_CENTERS` to constants.js (9 coordinate pairs)
- Added `getBundeslandFromURL()` utility function
- Extended geocoder.js with non-Vienna address variations
- Comprehensive testing across all Bundesländer
- Maintained backward compatibility - Wien searches work identically to v0.8.0

**Completed Sub-Tickets:**
- FALTMAP-26.1: Geocoding Analysis & Testing
- FALTMAP-26.2: Geocoding Enhancement
- FALTMAP-26.3: Bundesland Center Research
- FALTMAP-26.4: URL Parameter Parsing
- FALTMAP-26.5: Dynamic Map Initialization
- FALTMAP-26.6: Comprehensive Testing
- FALTMAP-26.7: Documentation & Release
```

**Acceptance Criteria:**
- [ ] README.md updated with Austria-wide support section
- [ ] CHANGELOG.md has v0.9.0 entry with all changes
- [ ] manifest.json version bumped to 0.9.0
- [ ] popup.html version bumped to 0.9.0
- [ ] IMPLEMENTATION.md updated (tickets marked Done)
- [ ] CHANGELOG_TICKETS.md updated (tickets archived)
- [ ] All documentation proofread for accuracy
- [ ] No typos or broken links
- [ ] Atomic commit: `docs: Austria-wide support documentation and v0.9.0 release`
- [ ] User approval for release
- [ ] Ready to merge feature branch to main

**Deliverable:** Complete documentation update + v0.9.0 release ready.

**Technical Notes:**
- This is the final step before merging to main
- Ensure all docs are accurate and complete
- User must approve before merge and tag

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
