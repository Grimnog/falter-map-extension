<div align="center">

# 🗺️ Falter Restaurant Map

**Transform your Falter Lokalführer search results into an interactive map**

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-yellow?style=flat&logo=googlechrome&logoColor=white)](https://www.google.com/chrome/)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue?style=flat)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔄 **Smart Pagination**
Automatically fetches all result pages, not just the first one

### 💾 **Intelligent Caching**
30-day cache with OpenStreetMap geocoding - instant on second search

</td>
<td width="50%">

### ⌨️ **Keyboard Navigation**
Use arrow keys to navigate restaurants, ESC to close

### 🔗 **Quick Links**
Direct links to Falter details and Google Maps

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Installation

<table>
<tr><td>

**For Chrome / Edge / Brave:**

1. 📦 Download and unzip this extension
2. 🔧 Open `chrome://extensions/`
3. 🔓 Enable **Developer mode** (top right toggle)
4. 📂 Click **Load unpacked**
5. ✅ Select the `falter-map-extension` folder

</td></tr>
</table>

> **Note:** Firefox uses a different extension format. This is for Chromium-based browsers only.

---

## 📖 How to Use

```
1️⃣  Visit falter.at/lokalfuehrer/suche
2️⃣  Apply your filters (district, cuisine, price, etc.)
3️⃣  Click "Auf Karte anzeigen" button on the page
4️⃣  Explore restaurants on the interactive map!
```

**Pro Tips:**
- ⬆️⬇️ Use arrow keys to navigate through restaurants
- 🖱️ Click any restaurant in the sidebar to zoom to its location
- ⚡ Results are cached for 30 days for instant repeat searches

---

## ⚙️ Settings & Cache

Open the extension popup to:
- 📊 View cache statistics
- 🗑️ Clear cached geocoding data
- ⏱️ See 30-day expiration info

---

## 🛡️ Privacy & Rate Limiting

- ✅ Uses free OpenStreetMap Nominatim API (respects 1 req/sec limit)
- ✅ All data stored locally in your browser
- ✅ No tracking, no analytics, no external servers
- ✅ Shows API warning for 100+ uncached addresses

---

## ❓ FAQ

<details>
<summary><b>"Auf Karte anzeigen" button doesn't appear?</b></summary>

- Refresh the page
- Ensure you're on a search results page (`/lokalfuehrer/suche`)
- Check that the extension is enabled
</details>

<details>
<summary><b>How do I clear the cache?</b></summary>

Open the extension popup and click "Clear Cache" button
</details>

<details>
<summary><b>Some addresses fail to geocode?</b></summary>

This is normal - some address formats are unusual. The extension tries multiple variations but may miss a few.
</details>

<details>
<summary><b>How long does geocoding take?</b></summary>

~1 second per restaurant due to OpenStreetMap rate limits. But cached addresses load instantly!
</details>

---

## 🔧 Technical Details

- **Manifest Version:** V3
- **Geocoding:** OpenStreetMap Nominatim API
- **Rate Limit:** 1 request per second
- **Cache TTL:** 30 days
- **Map Library:** Leaflet.js
- **Supported Browsers:** Chrome, Edge, Brave, Opera

---

## 📝 Version History

- **v1.0.0** - Initial release with geocoding cache and keyboard navigation
- **v1.1.0** - Added API threshold warning and redesigned popup
- **v1.2.0** - Fixed pagination detection (case-insensitive)

---

<div align="center">

Made with ❤️ for Vienna foodies | Powered by OpenStreetMap

</div>
