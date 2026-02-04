# Privacy Policy for Falter Restaurant Map Extension

**Last Updated:** 2026-02-04

This privacy policy explains how the Falter Restaurant Map browser extension handles data.

---

## Summary

- We process restaurant addresses to show them on a map
- Data is stored locally on your device only
- We do not collect, track, or sell any personal information
- We use privacy-respecting services (no Google tracking)

---

## Data We Process

To provide our core feature (displaying Falter.at restaurant search results on an interactive map), the extension processes the following data:

### 1. Restaurant Information
When you click "Auf Karte anzeigen" on a Falter.at search page, the extension reads:
- Restaurant names
- Restaurant addresses
- Restaurant URLs

This information is displayed publicly on the Falter.at website and is only processed locally in your browser.

### 2. Geocoding Data
Restaurant addresses are sent to the **OpenStreetMap Nominatim API** (https://nominatim.openstreetmap.org/) to convert them into map coordinates (latitude and longitude). This is necessary to display restaurants on the map.

**What Nominatim receives:**
- Restaurant addresses (e.g., "1010 Wien, Stephansplatz 1")
- A User-Agent header identifying the extension

**What Nominatim does NOT receive:**
- Your name or personal information
- Your IP address is visible to Nominatim as with any web request
- No tracking cookies or identifiers are sent

Nominatim is operated by the OpenStreetMap Foundation, a non-profit organization. See their privacy policy: https://osmfoundation.org/wiki/Privacy_Policy

---

## Data Storage

### Local Cache
To improve performance and reduce API requests, successfully geocoded addresses and their coordinates are cached locally on your device using Chrome's `chrome.storage.local` API.

- **Location:** Your local browser storage only
- **Duration:** 30 days (automatically expires)
- **Contents:** Address strings and their coordinates
- **Size:** Typically under 1 MB

You can clear this cache at any time via the extension popup.

### No Remote Storage
We do **not** store, log, or transmit any data to our own servers. The extension has no backend server. All processing happens locally in your browser.

---

## Data Sharing

We only share data with the following third party, solely for the purpose of providing the extension's functionality:

| Service | Data Shared | Purpose |
|---------|-------------|---------|
| OpenStreetMap Nominatim | Restaurant addresses | Convert addresses to map coordinates |

We do **not**:
- Sell any data
- Share data with advertisers
- Use analytics or tracking services
- Collect personal information

---

## Fonts and External Resources

The extension uses **Bunny Fonts** (https://fonts.bunny.net/) for typography. Bunny Fonts is an EU-based, GDPR-compliant alternative to Google Fonts that does not track users or collect IP addresses.

Map tiles are loaded from **OpenStreetMap** tile servers (https://tile.openstreetmap.org/).

---

## Permissions Explained

The extension requests the following permissions:

| Permission | Why It's Needed |
|------------|-----------------|
| `storage` | Store geocoded addresses locally to avoid repeated API calls |
| `activeTab` | Read restaurant data from the current Falter.at search page |
| `tabs` | Detect navigation to Falter.at search pages |
| `host_permissions` (falter.at) | Access Falter.at pages to read restaurant information |
| `host_permissions` (nominatim.org) | Send addresses to geocoding API |

---

## Your Rights

You have full control over your data:

- **View cached data:** Open browser developer tools → Application → Local Storage
- **Clear cached data:** Click "Cache leeren" in the extension popup
- **Disable the extension:** Right-click the extension icon → Manage extension → Toggle off
- **Remove all data:** Uninstall the extension (removes all local storage)

---

## Children's Privacy

This extension does not knowingly collect any personal information from children under 13 years of age.

---

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be reflected in the "Last Updated" date at the top of this document.

---

## Contact

If you have questions about this privacy policy, please open an issue on our GitHub repository:
https://github.com/Grimnog/falter-map-extension/issues

---

## Open Source

This extension is open source. You can review the complete source code at:
https://github.com/Grimnog/falter-map-extension
