# Falter Map Implementation - Current Sprint

This document tracks the **current active sprint** for the Falter Map extension project. It represents what we're working on right now.

**Related Documentation:**
- **`docs/BACKLOG.md`**: Pool of tickets to draw from for future sprints
- **`docs/CHANGELOG_TICKETS.md`**: Archive of completed tickets
- **`docs/AGENT.md`**: Engineering guide with principles and workflows
- **`docs/REFACTORING_ANALYSIS.md`**: Long-term architectural guide and technical debt registry

---

## 🚀 Current Sprint: Reliable Foundation

**Sprint Goal:** Establish ethical, reliable behavior as foundation for v1.0.

**Focus:** Epic E03 (Testing & Reliability) - Be a good web citizen.

**Sprint Start:** 2026-01-30
**Target End:** TBD

---

### Active Tickets

#### **Phase 1: Critical (Must Do First)**

**🎟️ FALTMAP-34 - Implement Result Limiting to Prevent API Abuse**
- Epic: E03 (Testing & Reliability)
- Status: Open
- Priority: 🔴 Critical
- **BLOCKER for FALTMAP-26** (Austria-wide support)

**Summary:** Implement hard cap of 100 geocoded restaurants per search to respect Nominatim TOS and prevent bulk geocoding abuse.

**Key Points:**
- Hard limit: 100 results
- Three-tier warning system (≤100, 101-1000, >1000)
- Handles "Alle Bundesländer" (6952 results) gracefully
- Non-configurable by users (prevents abuse)

---

#### **Phase 2: High Priority**

**🎟️ FALTMAP-29 - Implement Polite Delays in Pagination Fetching**
- Epic: E03 (Testing & Reliability)
- Status: Open
- Priority: 🟡 High

**Summary:** Add 300ms delay between pagination page fetches to respect Falter's servers and be a good web citizen.

**Key Points:**
- Configurable delay (250-500ms, default 300ms)
- Applied in `fetchAllPages()` function
- Prevents hammering Falter's backend

---

**🎟️ FALTMAP-31 - Implement Graceful Degradation for API Failures**
- Epic: E03 (Testing & Reliability)
- Status: Open
- Priority: 🟡 High

**Summary:** Decouple restaurant list from geocoding success so extension provides value even when Nominatim API fails.

**Key Points:**
- Show modal immediately with restaurant list
- Geocode in background
- Display clear error message if geocoding fails
- List remains functional regardless of API status

---

#### **Phase 3: Medium Priority**

**🎟️ FALTMAP-32 - Optimize Cache Cleaning with Just-in-Time Execution**
- Epic: E03 (Testing & Reliability)
- Status: Open
- Priority: 🟢 Medium

**Summary:** Move cache cleanup from page load to when extension is actively used (just-in-time).

**Key Points:**
- Remove `CacheManager.cleanExpired()` from init
- Add to start of `geocodeRestaurants()`
- Performance optimization for passive browsing

---

**🎟️ FALTMAP-33 - Add Data Provenance Transparency with Attribution**
- Epic: E03 (Testing & Reliability)
- Status: Open
- Priority: 🟢 Medium

**Summary:** Add clear attribution for OpenStreetMap and Nominatim to build user trust and give proper credit.

**Key Points:**
- Verify OSM attribution visible
- Add "Geocodierung durch Nominatim" text
- Non-intrusive placement

---

## Sprint Workflow

**During the sprint:**
1. Work through tickets in priority order (Phase 1 → Phase 2 → Phase 3)
2. Mark ticket as "In Progress" when starting work
3. Check off Acceptance Criteria as you complete them
4. Test thoroughly before committing (run `tests/test-runner.html`)
5. Make atomic commits following conventional commit format
6. Move completed tickets to `docs/CHANGELOG_TICKETS.md`

**Sprint completion:**
- When all 5 tickets are done, sprint is complete
- Plan next sprint: Austria-wide (FALTMAP-26) or UI Polish (E04)
