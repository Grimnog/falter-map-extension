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

## 🚀 Sprint 8: Austria-Wide Support ✅ **COMPLETE**

**Sprint Goal:** Extend extension to work for all 9 Austrian Bundesländer, not just Vienna.

**Focus:** Epic E05 (Core Feature Enhancements) - Major feature expansion.

**Sprint Start:** 2026-02-01
**Sprint End:** 2026-02-03
**Release:** v0.9.0

**Completed Tickets:**
- ✅ FALTMAP-26.1 - Geocoding Analysis & Testing
- ✅ FALTMAP-26.2 - Refactor Geocoder to Use Structured Query API
- ✅ FALTMAP-26.3 - Bundesland Center Coordinates Research
- ✅ FALTMAP-26.4 - URL Parameter Parsing
- ✅ FALTMAP-26.5 - Dynamic Map Initialization
- ✅ FALTMAP-26.6 - Comprehensive Testing & Validation
- ✅ FALTMAP-26.7 - Documentation & Release

**Post-Sprint Cleanup:**
- ✅ Background.js refactoring (removed 154 lines of duplicate code)
- ✅ Repository cleanup (removed unused testing and image files)

**Outcome:** Extension now works seamlessly across all 9 Austrian Bundesländer with smart map centering, optimized geocoding (7-tier fallback), comprehensive test coverage (88 tests), and clean codebase ready for v1.0.

**Archived:** All Sprint 8 tickets archived in `docs/CHANGELOG_TICKETS.md`

---

## 🚀 Sprint 9: UI/UX Polish for v1.0

**Sprint Goal:** Fix visual glitches and polish MapModal UX before v1.0 release.

**Status:** In Progress

**Sprint Start:** 2026-02-03

**Active Tickets:**
- 🔄 FALTMAP-40 - Fix Map Pin Visual Glitch During Progressive Geocoding (In Progress)

**Planned Tickets:**
- FALTMAP-38 - Fix MapModal UI Flash (Grey List Before Geocoding)
- FALTMAP-36 - Investigate MapModal Result List and Cache Behavior Bug (if needed)

**Deferred to Later:**
- FALTMAP-35 - Improve README Documentation (last before release)

---

### 🎟️ **FALTMAP-40 - Fix Map Pin Visual Glitch During Progressive Geocoding**
- Epic: E03 (Testing & Reliability)
- Status: In Progress 🔄
- Priority: 🟡 High

**User Story:**
As a user, I want map pins to appear smoothly at their correct locations during progressive geocoding, so I don't see jarring visual glitches of pins appearing at the edge before jumping into place.

**Context:**
When the map is zoomed out sufficiently, pins appear at the edge of the visible area before "dropping" into their actual location. This creates a poor UX where pins seem to jump around during geocoding.

**Root Cause:**
- Staggered animation with `setTimeout` delays causes positioning issues
- `animate=true` parameter triggers progressive marker addition with delays
- Clustering algorithm positions markers temporarily before final placement

**Solution:**
Remove staggered animation by changing `animate=true` to `animate=false` in progressive geocoding updates.

**Files to Modify:**
- `content.js` (line 88)

**Acceptance Criteria:**
- [x] `updateMapMarkers` called with `animate=false` during progressive geocoding (line 88)
- [ ] Pins appear directly at correct locations when zoomed out
- [ ] No visual "jumping" or "edge appearance" glitch observed
- [ ] Pulse animation still highlights newly added markers
- [ ] Test with 20+ restaurants at various zoom levels
- [ ] Atomic commit: `fix: remove staggered animation to prevent pin visual glitch`
- [ ] User verification complete
