# Chrome Web Store Policy Compliance Review

**Extension:** Falter Restaurant Map
**Review Date:** 2026-01-29

This document summarizes the extension's compliance with the Chrome Web Store Program Policies based on the state of the repository as of the review date.

**Overall Finding:** The extension is generally well-behaved and has a clear, single purpose. However, **two significant compliance gaps** were identified that must be addressed before a successful store submission. This document tracks the status of those gaps.

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

### Final Checklist for Compliance

- [🟡] **Create and link a privacy policy in `manifest.json`.** (In Progress via FALTMAP-21)
- [🟡] **Implement DOM sanitization (prefer `textContent`) for all scraped content.** (In Progress via FALTMAP-22)
- [✅] Permissions are compliant.
- [✅] The extension has a single, clear purpose.