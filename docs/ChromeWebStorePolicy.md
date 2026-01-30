# Chrome Web Store Policy Compliance Review

**Extension:** Falter Restaurant Map
**Review Date:** 2026-01-29

This document summarizes the extension's compliance with the Chrome Web Store Program Policies based on the state of the repository as of the review date. It also includes an assessment of the ethical and technical considerations regarding `falter.at`.

**Overall Finding:** The extension is generally well-behaved and has a clear, single purpose. However, **two significant compliance gaps** were identified that must be addressed before a successful store submission. This document tracks the status of those gaps and outlines proactive measures.

---

### 1. User Data Privacy

**Policy Reference:** [User Data Privacy](https://developer.chrome.com/docs/webstore/program-policies/policies/#user-data)

**Finding:** 🔴 **Action Required: Missing Privacy Policy**

*   **Policy Requirement:** "You must be transparent about how you handle user data... If your product handles personal or sensitive user data, you must... post a privacy policy." The policy defines "personal or sensitive user data" to include "web browsing activity" and "user-provided content."
*   **Analysis:**
    1.  The extension sends restaurant addresses (scraped from the user's active Falter.at tab) to a third-party API (`nominatim.openstreetmap.org`). This constitutes the handling of "web browsing activity."
    2.  The extension caches these addresses and their coordinates locally using `chrome.storage`.
    3.  The `manifest.json` file **lacks a `privacy_policy` field**.
*   **Conclusion:** This is a **critical violation**. The handling of user-initiated content and its transmission to a third party mandates a privacy policy that clearly discloses what data is collected, why, and how it is used.

**Status:**
- **Action Plan:** A ticket has been created to address this issue.
- **Ticket:** `FALTMAP-21: Add Privacy Policy for Chrome Web Store Compliance`

---

### 2. Security

**Policy Reference:** [Security Vulnerabilities](https://developer.chrome.com/docs/webstore/program-policies/policies/#security)

**Finding:** ⚠️ **Potential Issue: Lack of DOM Sanitization**

*   **Policy Requirement:** Products must not "introduce security vulnerabilities." An extension "must not contain... cross-site scripting (XSS)" vulnerabilities.
*   **Analysis:**
    1.  `dom-parser.js` scrapes content (e.g., restaurant names) from Falter.at.
    2.  `MapModal.js` renders this scraped content into its own UI, potentially using `innerHTML`.
    3.  While Falter.at is a trusted source, best practice dictates that any content not controlled by the extension must be sanitized before being injected into the DOM to prevent potential XSS attacks.
*   **Conclusion:** This is a **high-priority issue**. While the immediate risk is low, it is a technical vulnerability that would likely be flagged in a security review.

**Status:**
- **Action Plan:** A ticket has been created to address this issue.
- **Ticket:** `FALTMAP-22: Harden UI Against XSS via DOM Sanitization`

---

### 3. Permissions & Host Access

**Policy Reference:** [Permissions](https://developer.chrome.com/docs/webstore/program-policies/policies/#permissions)

**Finding:** ✅ **Compliant**

*   **Policy Requirement:** "Request access to the least amount of data and permissions necessary."
*   **Analysis:**
    *   `"storage"`: Justified for caching.
    *   `"activeTab"` / `"tabs"`: Justified for interacting with the Falter.at page.
    *   `"host_permissions"` for `falter.at` and `nominatim.openstreetmap.org` are correctly and narrowly scoped.
*   **Conclusion:** The requested permissions are appropriate and directly tied to the extension's core functionality.

---

### 4. Falter.at Interaction & Ethical Considerations

This section addresses concerns regarding the interaction with `falter.at`.

*   **`robots.txt` Analysis:**
    *   The `robots.txt` file for `falter.at` explicitly contains `User-agent: * Disallow:`. This indicates that `falter.at` does **not** generally disallow automated access for unidentified user agents. Specific commercial and AI bots are blocked, but your extension, operating from a user's browser, does not fall into these categories. This is a positive signal.
*   **Terms & Conditions (AGB) Analysis:**
    *   The provided AGB (`https://www.falter.at/ueber-uns/agb/agb-online`) has been reviewed. This document consists of "General Terms and Conditions for the Use of Advertising Space in the electronic media of Falter Verlagsgesellschaft m.b.H."
    *   **Finding:** This AGB document **does not apply to general website users or automated access for content consumption**. It exclusively governs the relationship between Falter Verlag and its advertisers. Therefore, it contains no explicit restrictions on web scraping or automated access relevant to your extension's operation.
*   **Server Load / "Good Citizen" Policy:**
    *   **Concern:** The `fetchAllPages` function in `dom-parser.js` makes sequential HTTP requests to `falter.at` to gather all restaurant results. If executed too rapidly, this could be perceived as resource-intensive.
    *   **Recommendation:** To be an ethical "web citizen," it is **highly recommended** to implement a polite delay (e.g., 250-500ms) between consecutive page fetches in the `fetchAllPages` function. This minimizes the impact on `falter.at`'s servers and reduces the risk of being blocked.

---

### Final Checklist for Compliance & Responsible Operation

- [🟡] **Create and link a privacy policy in `manifest.json`.** (In Progress via FALTMAP-21)
- [🟡] **Implement DOM sanitization (prefer `textContent`) for all scraped content.** (In Progress via FALTMAP-22)
- [✅] Permissions are compliant.
- [✅] The extension has a single, clear purpose.
- [🟡] **Implement polite delays in `dom-parser.js` (`fetchAllPages`)** to reduce server load on `falter.at`.
