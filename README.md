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

### 🗺️ **Austria-Wide Support**
Works across all 9 Austrian Bundesländer, not just Vienna

### 🔄 **Smart Pagination**
Automatically fetches all result pages, not just the first one

### 💾 **Intelligent Caching**
30-day cache with OpenStreetMap geocoding - instant on second search

</td>
<td width="50%">

### 🎯 **Smart Map Centering**
Automatically centers on the Bundesland you're searching

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

## 🇦🇹 Austria-Wide Support

The extension works seamlessly across **all 9 Austrian Bundesländer**:

<table>
<tr>
<td>

- 🏛️ **Wien** (Vienna)
- 🌲 **Niederösterreich**
- 🏔️ **Oberösterreich**
- 🎵 **Salzburg**
- ⛷️ **Tirol**

</td>
<td>

- 🏞️ **Vorarlberg**
- 🍷 **Steiermark**
- 🏖️ **Kärnten**
- 🌾 **Burgenland**

</td>
</tr>
</table>

**Smart Features:**
- 🎯 Map automatically centers on the Bundesland capital you're searching
- 🔍 Optimized geocoding for Austrian address formats
- 📍 Building-level precision across all regions

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

- **v0.9.0** - **Austria-wide support**: All 9 Bundesländer, smart map centering, optimized geocoding with 7-tier fallback system
- **v0.8.0** - UI/UX polish: Bunny Fonts (GDPR-compliant), German popup redesign, integrated status badge
- **v0.7.0** - Result limiting (100 max) to respect Nominatim TOS and be a good open-source citizen
- **v0.6.0** - Testing infrastructure: comprehensive test suite, automated testing, fixtures
- **v0.5.0** - UX enhancements: visual progress bar, keyboard shortcuts help overlay, improved feedback
- **v0.4.0** - Code refactoring: modular architecture, eliminated code duplication, centralized configuration
- **v0.3.0** - Major UX improvements: loading skeleton, empty states, smooth pin animations, compact popup design
- **v0.2.0** - Fixed pagination detection (case-insensitive)
- **v0.1.0** - Initial development release with geocoding cache and keyboard navigation

---

<div align="center">

Made with ❤️ for Austrian foodies | Powered by OpenStreetMap

</div>
