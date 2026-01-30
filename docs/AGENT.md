# Engineering Guide (Falter Map Extension)
_Last Updated: 2026-01-30_

This document provides the essential principles, workflows, and knowledge base for any AI agent (human or AI) working on this project. Adherence to these guidelines is critical for success.

---

## Role Definitions

-   **Architect (Gemini):** Responsible for strategic architectural decisions, overall system design, and creating clear, actionable tickets. The Architect provides the vision and the plan (the *what* and the *why*).

-   **Engineer (Claude):** Responsible for all implementation work. This includes writing, refactoring, and debugging all JavaScript code, moving files, and executing the technical tasks defined in the tickets. The Engineer provides the "ground truth" and pushes back on architectural over-engineering. The Engineer handles the *how*.

### Core Collaboration Principle
The Architect proposes, the Engineer disposes. The Engineer's pragmatic feedback on what is practical, simple, and sufficient is critical. We will always favor a working, tested, "good enough" architecture over a "perfect," complex one that provides no immediate user value.

---

## 1. AI Agent Context Management

**BEFORE conversation compacting occurs, Claude MUST preserve:**

### Critical State Checklist
- **Current ticket number** being worked on (e.g., "Working on FALTMAP-42")
- **Ticket status** (Open, In Progress, Blocked)
- **Which Acceptance Criteria** are checked vs unchecked
- **Uncommitted changes** or work-in-progress state
- **Pending questions** waiting for User's response
- **Architectural decisions** made during the session (summarize in DESIGN.md or ticket if significant)

### After Compacting: Re-establish Context
When resuming after compacting:
1. **State current ticket:** "Resuming work on FALTMAP-XX [status]"
2. **Review recent commits:** `git log --oneline -5`
3. **Check ticket ACs:** Verify which items are checked in docs/IMPLEMENTATION.md
4. **Ask if needed:** "Should I continue with FALTMAP-XX or switch to another ticket?"

### Context Preservation Protocol
- **Document decisions in code comments** or tickets, not just conversation
- **Keep IMPLEMENTATION.md updated** with real-time AC progress
- **Commit frequently** so Git history shows current state

---

## 2. Core Principles

These are the fundamental philosophies that guide our work. They are not optional.

### Clean Code Philosophy
We follow a simple set of principles to ensure our code is maintainable, readable, and robust.

-   **Readability is Key:** Write code for humans first. Use clear, descriptive names for variables and functions (e.g., `parseRestaurantsFromDOM` is better than `getData`).
-   **Single Responsibility Principle (SRP):** Every module and function should have one, and only one, reason to change. `cache-utils.js` handles caching; `dom-parser.js` handles parsing. A function should do one thing well.
-   **Don't Repeat Yourself (DRY):** Avoid duplicating code. If you find yourself writing the same logic in multiple places, extract it into a shared function or module. The creation of `cache-utils.js` is a primary example of this.
-   **Keep It Simple, Stupid (KISS):** Avoid unnecessary complexity. Choose the simplest solution that works. Do not add features or abstractions that are not yet needed. This is our primary guiding philosophy.
-   **Meaningful Comments:** Don't comment on *what* the code is doing (the code should be self-explanatory). Comment on *why* a particular approach was taken if it's not obvious (e.g., `// Delay is required to respect the API rate limit`).

### Test-Aware Development
While this project doesn't follow a strict Red-Green-Refactor TDD approach, we adhere to "test-aware" development.

1.  **Test Before Commit (CRITICAL):** Testing MUST happen before any commit. This is non-negotiable.
    -   **Automated tests:** Run `tests/test-runner.html` and verify all tests pass (100%).
    -   **For UI changes:** Load the extension in the browser and verify all functionality works as expected.
    -   **For logic changes:** Verify test output shows expected behavior.
    -   **Never commit untested code.** If you commit without testing, stop immediately, test, and fix any issues before proceeding.

2.  **Write Tests for All Changes:** When implementing changes, ALWAYS consider what tests need to be added or updated.
    -   **New Features:** Write tests for new functions, modules, or user-facing features as you implement them.
    -   **Bug Fixes:** Write a failing test that reproduces the bug BEFORE fixing it. This proves the bug exists and confirms when it's fixed.
    -   **Refactoring:** Ensure existing tests still pass. Add new tests if refactoring changes behavior or adds new code paths.
    -   **Edge Cases:** Add tests for edge cases discovered during development or reported by users.

3.  **Test Coverage Targets:**
    -   **Critical modules** (cache-utils, geocoder, dom-parser, map-modal): Aim for 80%+ line coverage
    -   **Utility modules:** Aim for 70%+ coverage
    -   **UI components:** Test all user interactions and state changes

4.  **When to Skip Tests:** Only skip automated tests when:
    -   The change is purely documentation (e.g., updating README.md)
    -   The change is configuration-only (e.g., updating .gitignore)
    -   The change is to test infrastructure itself

5.  **Test Organization:**
    -   One test file per module: `tests/{module-name}.test.js`
    -   Group related tests with clear section headers
    -   Use descriptive test names that explain what is being tested
    -   See `tests/README.md` for comprehensive testing documentation

6.  **Reference Ticket `FALTMAP-10`** for the complete test suite implementation.

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

## 3. Project Planning & Workflow

This section defines how we manage our work.

### 3.1. Our Documentation
-   **`docs/REFACTORING_ANALYSIS.md` (The "Why"):** The strategic architectural blueprint and technical debt registry.
-   **`docs/BACKLOG.md` (The "Pool"):** All tickets available to draw from, organized by Epic.
-   **`docs/IMPLEMENTATION.md` (The "What"):** The current active sprint containing tickets being worked on.
-   **`docs/CHANGELOG_TICKETS.md` (The "History"):** Archive of all completed tickets.
-   **`docs/AGENT.md` (The "How"):** This engineering guide, defining our processes and principles.

### 3.2. Ticket Workflow

**CRITICAL RULE: NO CODE WITHOUT A TICKET**

All work must be performed against a ticket. Follow this workflow for clear state tracking:

**Before writing ANY code:**
1. Create a ticket in `docs/BACKLOG.md` with clear ACs
2. Move ticket to `docs/IMPLEMENTATION.md` when starting sprint
3. Update ticket status to "In Progress"
4. Commit the ticket creation: `docs: add FALTMAP-XX ticket`

**Never skip this step.** If you implement something without a ticket first, that's sloppy work and violates our process.

#### **Step 1: Start Work**
1. Select a ticket from `docs/IMPLEMENTATION.md` (prioritize by: Critical → High → Medium → Low)
2. Update ticket status: `Status: Open` → `Status: In Progress`
3. Commit the status change: `docs: start work on FALTMAP-XX`

#### **Step 2: Work Through Acceptance Criteria**
1. Read all Acceptance Criteria (AC) in the ticket carefully
2. As you complete each AC item, check it off in the ticket: `- [ ]` → `- [x]`
3. Commit the AC update: `docs: complete AC for FALTMAP-XX - [description]`
4. **This creates clear state** - anyone can see exactly what's done and what's left

#### **Step 3: Verify Completion**
Before marking a ticket as Done, verify:
- ✅ All Acceptance Criteria boxes are checked `- [x]`
- ✅ All tests pass (run `tests/test-runner.html`)
- ✅ Manual testing completed
- ✅ No console errors or warnings
- ✅ Code follows conventions

#### **Step 4: Request Verification**
1. **Complete all ACs** and ensure tests pass
2. **Ask User for verification:** "All ACs complete and tests pass. Ready for you to verify FALTMAP-XX - should I mark as Done?"
3. **WAIT for User's confirmation**
4. **After User confirms:** Update status to `Status: Done ✅`
5. Move ticket from `docs/IMPLEMENTATION.md` to `docs/CHANGELOG_TICKETS.md`
6. Commit: `docs: mark FALTMAP-XX as complete`

#### **Important Notes:**
- **Never skip checking ACs** - This is how we track progress
- **Don't mark Done if ACs are unchecked** - Incomplete work should stay In Progress
- **Each AC check is a mini-milestone** - Commit when meaningful progress is made
- **Clear state = Professional work** - Anyone reading the ticket knows exactly where we are

### 3.3. Human-in-the-Loop Protocol

**CRITICAL: The Engineer (Claude) MUST NOT take these actions without explicit human approval:**

#### **Git Operations**
- **NEVER push commits to remote** without asking first
- **ALWAYS show** what will be pushed: `git log origin/main..HEAD --oneline`
- **WAIT for** explicit "yes, push" or "go ahead" from User before executing `git push`
- **Example prompt:** "Ready to push 3 commits to GitHub. Should I proceed?"

#### **Ticket Status Changes**
- **NEVER mark a ticket as `Status: Done ✅`** without User's verification
- **ALWAYS ask** "All ACs are complete and tests pass. Ready for you to verify - should I mark this as Done?"
- **WAIT for** User's confirmation that functionality works as expected
- **Only after** User confirms: update status and move to CHANGELOG

#### **Rationale**
- **Git push** is irreversible - User may want to review commits or add changes first
- **Ticket closure** requires human verification that the solution actually solves the problem in the real extension
- The Engineer provides implementation; User provides acceptance

### 3.4. Definition of Done (DoD)
A ticket is considered "Done" ONLY when all the following criteria are met:
-   [ ] **All Acceptance Criteria in the ticket are checked off** `- [x]`
-   [ ] All scope of work for the ticket is complete.
-   [ ] The code adheres to our Core Principles (Clean Code, Test-Aware).
-   [ ] All existing and new tests pass.
-   [ ] The functionality has been manually verified in the browser.
-   [ ] The final commit is atomic and follows the Conventional Commit standard.
-   [ ] The ticket status is updated to `Status: Done ✅`
-   [ ] The ticket has been moved to `docs/CHANGELOG_TICKETS.md`.

---

## 4. Project Knowledge Base

This is a reference for critical project-specific information.

### 4.1. Current Architecture
The extension uses a modular architecture where `content.js` acts as a coordinator for various service modules. For the full blueprint and target architecture, see `docs/REFACTORING_ANALYSIS.md`.

### 4.2. Error Handling Philosophy
-   **Fail Gracefully:** The extension must never crash the host page. All errors should be caught and handled.
-   **Inform, Don't Interrupt:** For non-critical errors (e.g., a single address failing to geocode), use subtle UI cues. For critical failures (e.g., the geocoding service is down), use a clear, non-modal notification to the user.

### 4.3. API & Service Policies
-   **Rate Limiting (Nominatim):** We are strictly limited to **1 request per second**. The `geocoder.js` module respects this. This is a critical constraint.
-   **Content Security Policy (CSP):** The `manifest.json` restricts external connections. Any new service requires a CSP update.

### 4.4. Development & Versioning
-   **Loading the Extension:** Load as an unpacked extension in `chrome://extensions/`.
-   **Debugging:** Use the browser console for the content script, service worker logs in `chrome://extensions/`, and the popup console (right-click the icon).
-   **Versioning:** When updating the version, change it in `manifest.json`, `popup.html`, and `CHANGELOG.md`.
-   **Running Tests:** See `tests/README.md` for comprehensive testing documentation.

---

## 5. Ongoing Architectural Guidance

As the project matures, the Architect's role is to provide strategic oversight and listen to engineering feedback. Architectural guidance focuses on:

1.  **Maintaining Architectural Integrity:** Ensuring new features do not compromise the modular principles of the *existing, stable* architecture.
2.  **Pragmatism Over Purity:** Watching for "pain points" that indicate a need for more complexity, but always defaulting to the simplest solution. We will not "gold-plate" the architecture.
3.  **Long-Term Vision:** Keeping the backlog aligned with the project's goals, balancing user value with our core principle of simplicity.
