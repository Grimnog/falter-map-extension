# Falter Restaurant Map

A Chrome extension that displays [Falter Lokalführer](https://www.falter.at/lokalfuehrer) restaurant search results on an interactive map.

![License](https://img.shields.io/badge/License-MIT-green)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![Austria](https://img.shields.io/badge/Austria-All%209%20Bundesl%C3%A4nder-red)

---

## What It Does

When browsing restaurant listings on Falter.at, this extension adds a **"Auf Karte anzeigen"** button that opens an interactive map showing all restaurants from your search results. You can:

- See all restaurants plotted on a map with numbered markers
- Click markers or list items to view details
- Open restaurant pages on Falter.at or get directions via Google Maps
- Navigate with keyboard shortcuts (arrow keys, Enter, Escape)

The extension works across all 9 Austrian Bundesländer and automatically centers the map on the region you're searching.

---

## Installation

This extension is not yet published to the Chrome Web Store. To install it manually:

1. Download or clone this repository
2. Open `chrome://extensions/` in Chrome, Edge, or Brave
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked**
5. Select the `falter-map-extension` folder

The extension icon will appear in your toolbar. Visit any Falter Lokalführer search page to use it.

---

## How It Works

1. **Parsing**: When you click the map button, the extension reads restaurant names and addresses from the Falter.at search results page

2. **Geocoding**: Addresses are converted to map coordinates using the free [OpenStreetMap Nominatim](https://nominatim.org/) API. The extension uses a multi-tier fallback strategy for maximum accuracy

3. **Caching**: Successfully geocoded addresses are cached locally for 30 days. Repeat searches load instantly without additional API calls

4. **Display**: Results appear on a Leaflet.js map with clustering for dense areas. A sidebar lists all restaurants with their status

### Result Limiting

To respect Nominatim's fair use policy, the extension limits results to **100 restaurants** per search. For better results:
- Use Falter's filters (district, cuisine, price range)
- Narrow your search to specific areas

---

## Privacy

**Data Processing**
- Restaurant addresses are sent to the OpenStreetMap Nominatim API for geocoding
- No other data leaves your browser

**Local Storage**
- Geocoded coordinates are cached locally for 30 days
- Cache can be cleared anytime via the extension popup

**No Tracking**
- No analytics or tracking
- No personal data collection
- Uses [Bunny Fonts](https://fonts.bunny.net/) (GDPR-compliant, EU-based) instead of Google Fonts

See [Privacy Policy](docs/PRIVACY_POLICY.md) for full details.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑` `↓` | Navigate restaurant list |
| `Enter` | Open selected restaurant on map |
| `Escape` | Close modal |
| `?` | Show help overlay |

---

## Technical Details

| Component | Technology |
|-----------|------------|
| Extension Format | Chrome Manifest V3 |
| Map Library | Leaflet.js with MarkerCluster |
| Geocoding | OpenStreetMap Nominatim (1 req/sec) |
| Cache | chrome.storage.local (30-day TTL) |
| Fonts | Bunny Fonts (Nunito) |

**Supported Browsers**: Chrome, Edge, Brave, Opera (Chromium-based)

---

## Development

```bash
# Clone the repository
git clone https://github.com/Grimnog/falter-map-extension.git

# Load as unpacked extension in Chrome
# No build step required - plain JavaScript
```

### Project Structure

```
falter-map-extension/
├── manifest.json      # Extension configuration
├── content.js         # Main content script
├── content.css        # Modal and UI styles
├── popup.html/js      # Extension popup
├── modules/           # JavaScript modules
│   ├── MapModal.js    # Map modal component
│   ├── geocoder.js    # Nominatim API integration
│   ├── dom-parser.js  # Falter page scraping
│   └── ...
├── vendor/            # Leaflet.js libraries
└── tests/             # Test suite
```

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Credits

- Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
- Geocoding by [Nominatim](https://nominatim.org/)
- Map library: [Leaflet.js](https://leafletjs.com/)
- Clustering: [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster)

---

*Built for Austrian food lovers who want to explore restaurants on a map.*
