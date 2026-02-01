# Falter Map Implementation - Current Sprint

This document tracks the **current active sprint** for the Falter Map extension project. It represents what we're working on right now.

**Related Documentation:**
- **`docs/BACKLOG.md`**: Pool of tickets to draw from for future sprints
- **`docs/CHANGELOG_TICKETS.md`**: Archive of completed tickets
- **`docs/AGENT.md`**: Engineering guide with principles and workflows
- **`docs/REFACTORING_ANALYSIS.md`**: Long-term architectural guide and technical debt registry

---

## 🚀 Sprint 6: UI/UX Polish ✅ COMPLETE

**Sprint Goal:** Polish the user interface and experience before expanding to Austria-wide support.

**Focus:** Epic E04 (UI/UX Polish) - Professional, consistent, delightful UX.

**Sprint Start:** 2026-01-30
**Sprint End:** 2026-01-30
**Release:** v0.8.0

**Completed Tickets:**
- ✅ FALTMAP-27 - Bunny Fonts (GDPR-compliant, better readability)
- ✅ FALTMAP-30 - Popup redesign (German, compact, professional)
- ✅ FALTMAP-28 - Status badge (integrated header, no textbox confusion)

**Outcome:** Clean, modern, privacy-compliant UI ready for Austria-wide expansion.

---

## 🚀 Sprint 7: Documentation & Planning ✅ COMPLETE

**Sprint Goal:** Update documentation and plan Austria-wide support implementation.

**Focus:** Epic E06 (Documentation) + Planning

**Sprint Start:** 2026-01-30
**Sprint End:** 2026-02-01
**Outcome:** FALTMAP-26 fully planned and broken into 7 atomic sub-tickets.

**Note:** FALTMAP-35 (README improvements) deferred - will be completed as part of FALTMAP-26.7 (Documentation & Release).

---

## 🚀 Current Sprint: Sprint 8 - Austria-Wide Support

**Sprint Goal:** Extend extension to work for all 9 Austrian Bundesländer, not just Vienna.

**Focus:** Epic E05 (Core Feature Enhancements) - Major feature expansion.

**Sprint Start:** 2026-02-01
**Target End:** TBD (4-5 weeks estimated, no rushing)

**Rationale:**
After completing UI/UX polish (Sprint 6), the extension is ready for geographic expansion. This sprint implements Austria-wide Bundesland support through careful, incremental development:
1. Research and testing first (no code changes)
2. Geocoding enhancements for non-Vienna addresses
3. Dynamic map centering based on region
4. Comprehensive testing across all Bundesländer
5. Documentation and release (v0.9.0)

**Approach:** Slow, methodical, thorough - "no hasty decisions" 🌳

---

### Active Tickets - Sequential Implementation

#### **Phase 1: Research & Planning** ⬅️ START HERE

**🎟️ FALTMAP-26.1 - Geocoding Analysis & Testing** ✅ **COMPLETE**
- Parent: FALTMAP-26
- Epic: E05 (Core Feature Enhancements)
- Status: Done ✅
- Priority: 🟡 High
- Type: Research (no code changes)

**Summary:** Test current geocoding with all Bundesland addresses, experiment with query variations, document findings.

**Key Findings:**
- ✅ Structured query API provides building-level precision for all 8 Bundesländer
- ✅ Multi-tier fallback strategy designed (7 tiers, structured-first)
- ✅ Restaurant name from Falter can be used as powerful fallback
- ✅ Street name cleaning required for some addresses (e.g., "Strombad" prefix)
- ✅ Wien market stalls need amenity-based queries (edge case validated)

**Deliverable:** Comprehensive testing report at `docs/testing/faltmap-26-geocoding-analysis.md`

**Next:** FALTMAP-26.2 - Major refactoring to implement structured query API

---

**🎟️ FALTMAP-26.3 - Bundesland Center Coordinates Research** ✅ **COMPLETE**
- Parent: FALTMAP-26
- Epic: E05 (Core Feature Enhancements)
- Status: Done ✅
- Priority: 🟡 High
- Type: Research (constants definition)
- Completed: 2026-02-01

**Summary:** Research and define accurate center coordinates for all 9 Austrian Bundesländer.

**Key Deliverables:**
- `BUNDESLAND_CENTERS` object in constants.js
- Coordinates for all 9 Bundesland capitals/major cities
- Documented sources and rationale

---

#### **Phase 2: Implementation**

**🎟️ FALTMAP-26.2 - Refactor Geocoder to Use Structured Query API** ✅ **FUNCTIONALLY COMPLETE**
- Status: Functionally Complete ✅ (automated tests deferred to 26.6)
- Type: Major Refactoring
- Completed: 2026-02-01

**Summary:** Complete architectural refactoring of geocoder.js to use Nominatim structured query API with multi-tier fallback system.

**Implementation Completed:**
- ✅ Structured query API with parameters (street, city, postalcode, amenity, country)
- ✅ 7-tier fallback system (optimized order: amenity → street → combined → types → cleaned → free-form → city-level)
- ✅ Restaurant name extraction from DOM parser
- ✅ Multi-word city support ("Weiden am See", "Deutsch Schützen-Eisenberg")
- ✅ Optional street numbers (handles location descriptors)
- ✅ Em-dash and parentheses handling
- ✅ Generic street cleaning with regex (Tier 5)
- ✅ Wien backward compatibility maintained (NO REGRESSIONS)
- ✅ All 9 Bundesländer tested and working

**Tier Performance (validated):**
- Tier 1 (amenity name): ~70-80% success ⭐ (80/20 principle confirmed!)
- Tier 2 (street address): ~15-20% success
- Tiers 3-5: ~5% success
- Tier 6 (free-form): Handles complex addresses (e.g., "II. Block VI")
- Tier 7 (city-level): Approximate fallback (<5%)

**Deferred to 26.6:**
- Unit tests for fallback tiers
- Automated test coverage
- (Comprehensive testing phase will validate all edge cases)

---

**🎟️ FALTMAP-26.4 - URL Parameter Parsing** ✅ **COMPLETE**
- Status: Done ✅
- Type: Feature (URL parsing utility)
- Completed: 2026-02-01

**Summary:** Extract Bundesland from URL `?r=` parameter, handle edge cases.

**Implementation:**
- ✅ Created `modules/utils.js` with `getBundeslandFromURL()` function
- ✅ Parses `window.location.search` for `?r=` parameter
- ✅ Handles URL encoding (e.g., `Nieder%C3%B6sterreich`)
- ✅ Case-insensitive matching with normalized output
- ✅ Edge cases handled (null, empty, invalid → return null)
- ✅ Uses `CONFIG.BUNDESLAND_CENTERS` as source of truth

---

**🎟️ FALTMAP-26.5 - Dynamic Map Initialization**
- Status: Ready to Start ⏭️
- Type: Feature (map initialization logic)

**Summary:** Set initial map center based on detected Bundesland, maintain Wien backward compatibility.

---

#### **Phase 3: Validation & Release**

**🎟️ FALTMAP-26.6 - Comprehensive Testing & Validation**
- Status: Blocked (depends on 26.2, 26.5)
- Type: Testing

**Summary:** End-to-end testing of all 9 Bundesländer, backward compatibility verification, regression testing.

---

**🎟️ FALTMAP-26.7 - Documentation & Release**
- Status: Blocked (depends on 26.6)
- Type: Documentation

**Summary:** Update README, CHANGELOG, version bump to 0.9.0, prepare release.

---

## Sprint Workflow

**Sequential Implementation:**
1. Start with Phase 1 (26.1 + 26.3 in parallel)
2. Complete research before any code changes
3. Get User approval on findings before proceeding
4. Implement Phase 2 (26.2 → 26.4 → 26.5) sequentially
5. Thorough testing in Phase 3 (26.6)
6. Document and release (26.7)

**Guiding Principles:**
- 🌳 **No rushing** - slow, methodical, thorough
- ✅ **Atomic commits** - one logical change per commit
- 🔍 **Test thoroughly** - no breaking changes allowed
- 👤 **User approval** - get verification at each phase
- 📝 **Document everything** - clear findings and decisions

**Estimated Timeline:**
- Week 1: Phase 1 (Research)
- Week 2: Phase 2 (Implementation Part 1)
- Week 3: Phase 2 (Implementation Part 2)
- Week 4: Phase 3 (Testing & Documentation)

**Critical Requirement:** ⚠️ **NO BREAKING CHANGES** - Wien functionality must remain identical to v0.8.0.
