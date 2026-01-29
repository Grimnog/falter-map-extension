# Engineering Guide (Falter Map Extension)
_Last Updated: 2026-01-28_

This document provides the essential principles, workflows, and knowledge base for any engineer (human or AI) working on this project. Adherence to these guidelines is critical for success.

---

## Role Definitions:
-   **Architect:** Gemini (this agent) - Responsible for strategic architectural decisions, overall system design, and ensuring adherence to core principles.
-   **Engineer:** Claude - Responsible for implementing features, fixing bugs, and performing refactoring tasks under the guidance of the Architect.

---

## 1. Core Principles

These are the fundamental philosophies that guide our work. They are not optional.

### Clean Code Philosophy
We follow a simple set of principles to ensure our code is maintainable, readable, and robust.

-   **Readability is Key:** Write code for humans first. Use clear, descriptive names for variables and functions (e.g., `parseRestaurantsFromDOM` is better than `getData`).
-   **Single Responsibility Principle (SRP):** Every module and function should have one, and only one, reason to change. `cache-utils.js` handles caching; `dom-parser.js` handles parsing. A function should do one thing well.
-   **Don't Repeat Yourself (DRY):** Avoid duplicating code. If you find yourself writing the same logic in multiple places, extract it into a shared function or module. The creation of `cache-utils.js` is a primary example of this.
-   **Keep It Simple (KISS):** Avoid unnecessary complexity. Choose the simplest solution that works. Do not add features or abstractions that are not yet needed.
-   **Meaningful Comments:** Don't comment on *what* the code is doing (the code should be self-explanatory). Comment on *why* a particular approach was taken if it's not obvious (e.g., `// Delay is required to respect the API rate limit`).

### Test-Aware Development
While this project doesn't follow a strict Red-Green-Refactor TDD approach, we adhere to "test-aware" development.

1.  **Write Tests for Bugs:** When fixing a bug, the first step is to write a failing test that reproduces the issue. This proves the bug exists and confirms when it's fixed.
2.  **Write Tests for Features:** When adding a new feature to a module (e.g., a new function in `cache-utils.js`), write the corresponding tests as you build the feature.
3.  **Run Tests Often:** After any significant change, run the relevant tests to ensure no existing functionality has been broken (regression).
4.  **Reference Ticket `FALTMAP-07`** for the initial testing strategy and implementation details.

### Atomic Commits
This project follows **atomic commit** principles. Each commit should:

1.  **Be self-contained**: Represent one logical change.
2.  **Be functional**: Not break the build or functionality.
3.  **Have clear scope**: Focus on a single purpose.

**Good atomic commits:**
```bash
# ✅ Single feature
git commit -m "feat: add progress bar to geocoding status"

# ✅ Single bug fix
git commit -m "fix: handle uppercase pagination text (SEITE vs Seite)"

# ✅ Single refactor
git commit -m "refactor: extract cache utilities to shared module"
```

**Bad non-atomic commits:**
```bash
# ❌ Multiple unrelated changes
git commit -m "fix pagination bug, add progress bar, update docs"

# ❌ Vague scope
git commit -m "various updates and improvements"
```

### Conventional Commit Messages
All commit messages MUST follow the [Conventional Commits](https://www.conventionalcommits.org/) standard.
-   **Format:** `<type>: <description>` (e.g., `feat: add user login form`).
-   **Types:** `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`.

---

## 2. Project Planning & Workflow

This section defines how we manage our work.

### 2.1. Our Documentation
-   **`docs/REFACTORING_ANALYSIS.md` (The "Why"):** The strategic architectural blueprint and technical debt registry.
-   **`docs/IMPLEMENTATION.md` (The "What"):** The tactical sprint backlog, containing all `FALTMAP-XX` tickets.
-   **`docs/CLAUDE.md` (The "How"):** This engineering guide, defining our processes and principles.
-   **`docs/gemini.md` (The "How - Gemini"):** This engineering guide, specifically for Gemini's role as Architect.

### 2.2. Ticket Workflow
All work must be performed against a ticket from the `IMPLEMENTATION.md` backlog. The goal is to move tickets from "Open" to "Done".

### 2.3. Definition of Done (DoD)
A ticket is considered "Done" ONLY when all the following criteria are met:
-   [ ] All scope of work for the ticket is complete.
-   [ ] The code adheres to our Core Principles (Clean Code, Test-Aware).
-   [ ] All existing and new tests pass.
-   [ ] The functionality has been manually verified in the browser.
-   [ ] The final commit is atomic and follows the Conventional Commit standard.
-   [ ] The ticket has been moved to the "✅ Done" section in `IMPLEMENTATION.md`.

---

## 3. Project Knowledge Base

This is a reference for critical project-specific information.

### 3.1. Current Architecture
The extension uses a modular architecture where `content.js` acts as a coordinator for various service modules. For the full blueprint and target architecture, see `docs/REFACTORING_ANALYSIS.md`.

### 3.2. Error Handling Philosophy
-   **Fail Gracefully:** The extension must never crash the host page. All errors should be caught and handled.
-   **Inform, Don't Interrupt:** For non-critical errors (e.g., a single address failing to geocode), use subtle UI cues. For critical failures (e.g., the geocoding service is down), use a clear, non-modal notification to the user.

### 3.3. API & Service Policies
-   **Rate Limiting (Nominatim):** We are strictly limited to **1 request per second**. The `geocoder.js` module respects this. This is a critical constraint.
-   **Content Security Policy (CSP):** The `manifest.json` restricts external connections. Any new service requires a CSP update.

### 3.4. Development & Versioning
-   **Loading the Extension:** Load as an unpacked extension in `chrome://extensions/`.
-   **Debugging:** Use the browser console for the content script, service worker logs in `chrome://extensions/`, and the popup console (right-click the icon).
-   **Versioning:** When updating the version, change it in `manifest.json`, `popup.html`, and `CHANGELOG.md`.

---

## 4. Ongoing Architectural Guidance

As the project matures from foundational refactoring to feature implementation, the Architect's role shifts from direct intervention to strategic oversight. My guidance will focus on:

1.  **Maintaining Architectural Integrity:** Ensuring that new features do not compromise the modular, single-responsibility principles of the existing architecture.
2.  **Identifying "Signal" for Increased Complexity:** Watching for specific "pain points" in the code that indicate it's time to adopt more complex patterns (e.g., an EventBus, a build step). The goal is to "wait for the pain" rather than over-engineering.
3.  **Scalability of New Features:** Reviewing the design of new features (`FALTMAP-XX` tickets) to ensure they are implemented in a way that is maintainable and does not create future technical debt.
4.  **Long-Term Vision:** Keeping the backlog and sprint planning aligned with the long-term architectural goals, balancing immediate user value with future-proofing.