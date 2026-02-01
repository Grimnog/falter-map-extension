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

## 🚀 Current Sprint: Sprint 7 - Documentation & Planning

**Sprint Goal:** Update documentation and plan next major feature (Austria-wide support).

**Focus:** Epic E06 (Documentation) - Prepare for broader rollout.

**Sprint Start:** 2026-01-30
**Target End:** TBD

**Rationale:**
Before implementing Austria-wide support (FALTMAP-26), we need:
1. Clear README documentation about features and limitations
2. Planning for Austria-wide support implementation
3. Clean backlog and roadmap

This ensures users understand the extension and we have a solid plan for expansion.

---

### Active Tickets

#### **Phase 1: Documentation**

**🎟️ FALTMAP-35 - Improve README Documentation**
- Epic: E06 (Documentation)
- Status: Open
- Priority: 🟡 High

**Summary:** Add comprehensive README with usage guide, result limiting explanation, and privacy details.

**Key Sections to Add:**
- How It Works
- Result Limiting (100 limit + why)
- Getting Better Results (use filters)
- Privacy & Data (Bunny Fonts, local cache, no tracking)
- Better formatting (badges, TOC, sections)

---

## Sprint Workflow

**During the sprint:**
1. Work through tickets in priority order (Phase 1 → Phase 2)
2. Mark ticket as "In Progress" when starting work
3. Check off Acceptance Criteria as you complete them
4. Test thoroughly before committing (run `tests/test-runner.html`)
5. Make atomic commits following conventional commit format
6. Get User verification before marking as Done
7. Move completed tickets to `docs/CHANGELOG_TICKETS.md`

**Sprint completion:**
- When all 3 tickets are done, sprint is complete
- Next sprint: Austria-wide support (FALTMAP-26)
