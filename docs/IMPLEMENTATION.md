# Falter Map Implementation - Current Sprint

This document tracks the **current active sprint** for the Falter Map extension project. It represents what we're working on right now.

**Related Documentation:**
- **`docs/BACKLOG.md`**: Pool of tickets to draw from for future sprints
- **`docs/CHANGELOG_TICKETS.md`**: Archive of completed tickets
- **`docs/AGENT.md`**: Engineering guide with principles and workflows
- **`docs/REFACTORING_ANALYSIS.md`**: Long-term architectural guide and technical debt registry

---

## 🚀 Current Sprint: UI/UX Polish

**Sprint Goal:** Polish the user interface and experience before expanding to Austria-wide support.

**Focus:** Epic E04 (UI/UX Polish) - Professional, consistent, delightful UX.

**Sprint Start:** 2026-01-30
**Target End:** TBD

**Rationale:**
After completing the "Reliable Foundation" sprint (E03), we now have ethical, reliable behavior. Before expanding scope with Austria-wide support (FALTMAP-26), we should polish what we have to ensure a high-quality user experience.

---

### Active Tickets

#### **Phase 1: High Priority**

**🎟️ FALTMAP-27 - Improve Font Readability and Alignment with Falter Style**
- Epic: E04 (UI/UX Polish)
- Status: Open
- Priority: 🟡 High

**Summary:** Improve font readability and align with Falter's visual identity using free font alternatives.

**Key Points:**
- Research free alternatives to Falter's fonts (Futura Round, Laguna Vintage)
- Apply to modal UI for improved readability
- Maintain consistency with Falter's brand aesthetic
- Test cross-browser compatibility

---

**🎟️ FALTMAP-30 - Refactor Popup for Design Consistency and UX Polish**
- Epic: E04 (UI/UX Polish)
- Status: Open
- Priority: 🟡 High

**Summary:** Polish the extension popup to be consistent with modal design and fully German.

**Key Points:**
- Align popup design with modal (colors, fonts, spacing)
- Convert all English text to German
- Resize "Clear Cache" button (currently too large)
- Replace intrusive browser alert with subtle confirmation
- Professional, consistent feel

---

#### **Phase 2: Medium Priority**

**🎟️ FALTMAP-28 - Redesign Status Message to Not Look Like Textbox**
- Epic: E04 (UI/UX Polish)
- Status: Open
- Priority: 🟢 Medium

**Summary:** Redesign status message element so it doesn't resemble an input textbox.

**Key Points:**
- Current design looks like a textbox (confusing for users)
- Make it visually distinct as a status indicator
- Improve visual hierarchy
- Consider adding icons (loading spinner, checkmark)

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
