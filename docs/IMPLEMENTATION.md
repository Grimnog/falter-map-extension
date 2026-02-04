# Falter Map Implementation - Current Sprint

This document tracks the **current active sprint** for the Falter Map extension project. It represents what we're working on right now.

**Related Documentation:**
- **`docs/BACKLOG.md`**: Pool of tickets to draw from for future sprints
- **`docs/CHANGELOG_TICKETS.md`**: Archive of completed tickets
- **`docs/AGENT.md`**: Engineering guide with principles and workflows
- **`docs/REFACTORING_ANALYSIS.md`**: Long-term architectural guide and technical debt registry

---

## 🚀 Sprint 10: v1.0 Preparation

**Sprint Goal:** Fix remaining UX bugs and polish documentation for v1.0 release

**Status:** In Progress 🟢

**Sprint Start:** 2026-02-04
**Target Release:** v1.0.0

**Sprint Tickets (Sequential):**
1. ✅ FALTMAP-44 - Fix Status Message Not Updating When Loading from Cache
2. ✅ FALTMAP-38 - Fix MapModal UI Flash (Grey List Before Geocoding)
3. ⏳ FALTMAP-35 - Improve README Documentation **← Current**

**Current Focus:** FALTMAP-35

---

### 🎟️ **FALTMAP-44 - Fix Status Message Not Updating When Loading from Cache** ✅
- Epic: E03 (Testing & Reliability)
- Status: Done ✅
- Priority: 🟡 High
- Completed: 2026-02-04

**User Story:**
As a user, I want to see the correct completion status message ("✓ X Restaurants gefunden") when restaurants are loaded from cache, so I know the map has finished loading.

**Root Cause:**
1. Initial progress update didn't pass `isFinal: true` when all restaurants cached
2. Completion message required `hasStartedGeocoding` flag (only set during active geocoding)

**Solution:**
- **content.js:** Check if all restaurants are cached, pass `isFinal: true` when no geocoding needed
- **MapModal.js:** Removed `hasStartedGeocoding` requirement from completion logic

**Acceptance Criteria:**
- [x] Opening MapModal with cached data shows "✓ X Restaurants gefunden" immediately
- [x] Progress bar shows completion for cached data
- [x] Restaurant count in status message is accurate
- [x] Fresh geocoding still works correctly (no regression)
- [x] Manual testing confirms fix
- [x] User verification complete

**Commit:** c89c8b4

---

### 🎟️ **FALTMAP-38 - Fix MapModal UI Flash (Grey List Before Geocoding)** ✅
- Epic: E03 (Testing & Reliability)
- Status: Done ✅
- Priority: 🟢 Medium
- Completed: 2026-02-04

**User Story:**
As a user, I want a smooth loading experience when opening the map modal, without seeing a flash of greyed-out entries before the real results appear.

**Root Cause:**
After 300ms skeleton delay, modal showed ALL restaurants including those without coordinates, which appeared greyed out (opacity: 0.35).

**Solution:**
Only show restaurants with coordinates (from cache) after skeleton delay. Restaurants without coords are added progressively during geocoding.

**Acceptance Criteria:**
- [x] MapModal no longer shows flash of greyed-out list
- [x] Smooth loading experience (skeleton → cached results → progressive population)
- [x] Works correctly with both cached and fresh geocoding
- [x] User verification complete

**Commit:** f5dd702

---

### 🎟️ **FALTMAP-35 - Improve README Documentation**
- Epic: E06 (Documentation)
- Status: Planned 📋
- Priority: 🟡 High

**User Story:**
As a user, I want clear documentation about how the extension works and its limitations.

**Acceptance Criteria:**
- [ ] "How It Works" section added
- [ ] "Result Limiting" section explains 100 limit
- [ ] "Getting Better Results" section added
- [ ] "Privacy & Data" section added
- [ ] README formatting improved
- [ ] User verification before push

---

## Deferred to Post-v1.0:
- FALTMAP-36 - Investigate MapModal Result List and Cache Behavior Bug
- FALTMAP-39 - Optimize Auto-Zoom Behavior
- FALTMAP-24 - Privacy Policy for Chrome Web Store
- FALTMAP-25 - XSS Hardening

---

## Notes

**Completed Sprints:** See `docs/CHANGELOG_TICKETS.md` for archive
- Sprint 9 (v0.10.0): UI/UX Polish - High-Density Editorial Design ✅
- Sprint 8 (v0.9.0): Austria-Wide Support ✅
- Sprint 7: Documentation & Planning ✅
- Sprint 6 (v0.8.0): UI/UX Polish ✅
