# Falter Map Extension - Backlog

This document contains backlog tickets for future consideration. Tickets are organized by priority.

**Completed tickets** are archived in `docs/CHANGELOG_TICKETS.md`.
**Active sprint tickets** are in `docs/IMPLEMENTATION.md`.

---

## Deferred Until Final Polish

### 🎟️ **TICKET: FALTMAP-35 - Improve README Documentation**
- Epic: E06 (Documentation)
- Status: Deferred
- Priority: 🟡 High

**User Story:**
As a user, I want clear documentation about how the extension works and its limitations, so I understand the 100 result limit and how to get better results.

**Scope of Work:**
1. Add "How It Works" section
2. Add "Result Limiting" section (100 limit, why we limit)
3. Add "Getting Better Results" section (use filters)
4. Add "Privacy & Data" section (Bunny Fonts, local cache, no tracking)
5. Improve formatting (badges, TOC, sections)

---

## Deferred to Post-v1.0

These tickets are deferred until after v1.0 release, pending decision on Chrome Web Store publication.

### 🎟️ **TICKET: FALTMAP-39 - Optimize Auto-Zoom Behavior for Bundesland Searches**
- Epic: E04 (UI/UX Polish)
- Status: Deferred
- Priority: 🔵 Low (post-1.0)

**User Story:**
As a user searching for restaurants across an entire Bundesland, I want the map auto-zoom to provide a useful view of the region.

**Context:**
Current auto-zoom works well for Wien but may zoom too far out for Bundesland searches with restaurants spread across the region. Defer until post-1.0 when we have more user feedback.

---

### 🎟️ **TICKET: FALTMAP-24 - Add Privacy Policy for Chrome Web Store Compliance**
- Epic: E03 (Testing & Reliability)
- Status: Deferred
- Priority: 🔵 Low (deferred)

**User Story:**
As a developer, I want the extension to be compliant with Chrome Web Store policies so that it can be published successfully.

**Context:**
Required for Chrome Web Store publication. Create privacy policy explaining data handling (addresses sent to Nominatim, local cache storage).

---

### 🎟️ **TICKET: FALTMAP-25 - Harden UI Against XSS via DOM Sanitization**
- Epic: E03 (Testing & Reliability)
- Status: Deferred
- Priority: 🔵 Low (deferred)

**User Story:**
As a user, I want to be safe from cross-site scripting (XSS) attacks, even if the source website is compromised.

**Context:**
Audit innerHTML usage and replace with textContent where possible. Low priority as Falter.at is a trusted source.

---
