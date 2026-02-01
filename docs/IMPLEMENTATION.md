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

**🎟️ FALTMAP-26.1 - Geocoding Analysis & Testing**
- Parent: FALTMAP-26
- Epic: E05 (Core Feature Enhancements)
- Status: Open
- Priority: 🟡 High
- Type: Research (no code changes)

**Summary:** Test current geocoding with all Bundesland addresses, experiment with query variations, document findings.

**Key Deliverables:**
- Testing report with geocoding results for all 8 non-Vienna Bundesländer
- Analysis of successful vs failed queries
- Recommendations for FALTMAP-26.2 implementation
- No code changes - pure research

**Test Addresses Provided:**
- Niederösterreich: `3420 Klosterneuburg, Strombad Donaulände 15`
- Oberösterreich: `4653 Eberstalzell, Solarstraße 2`
- Vorarlberg: `6774 Tschagguns, Kreuzgasse 4`
- Burgenland: `7434 Bernstein, Badgasse 48`
- Steiermark: `8010 Graz, Heinrichstraße 56`
- Tirol: `6020 Innsbruck, Leopoldstraße 7`
- Salzburg: `5101 Bergheim, Kasern 4`
- Kärnten: `9062 Moosburg, Pörtschacher Straße 44`

---

**🎟️ FALTMAP-26.3 - Bundesland Center Coordinates Research**
- Parent: FALTMAP-26
- Epic: E05 (Core Feature Enhancements)
- Status: Open
- Priority: 🟡 High
- Type: Research (constants definition)
- **Can work in parallel with 26.1**

**Summary:** Research and define accurate center coordinates for all 9 Austrian Bundesländer.

**Key Deliverables:**
- `BUNDESLAND_CENTERS` object in constants.js
- Coordinates for all 9 Bundesland capitals/major cities
- Documented sources and rationale

---

#### **Phase 2: Implementation**

**🎟️ FALTMAP-26.2 - Geocoding Enhancement for Non-Vienna Addresses**
- Status: Blocked (depends on 26.1)
- Type: Feature (geocoding logic)

**Summary:** Extend geocoder.js to handle non-Vienna address formats based on 26.1 findings.

---

**🎟️ FALTMAP-26.4 - URL Parameter Parsing**
- Status: Blocked (depends on 26.3)
- Type: Feature (URL parsing utility)

**Summary:** Extract Bundesland from URL `?r=` parameter, handle edge cases.

---

**🎟️ FALTMAP-26.5 - Dynamic Map Initialization**
- Status: Blocked (depends on 26.3, 26.4)
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
