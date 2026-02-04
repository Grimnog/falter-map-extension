# Falter Restaurant Map

A Chrome extension that displays [Falter Lokalführer](https://www.falter.at/lokalfuehrer) restaurant search results on an interactive map.

![License](https://img.shields.io/badge/License-MIT-green)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)

---

## Highlights

- **See restaurants on a map** — Transform Falter search results into an interactive map view
- **Works across Austria** — All 9 Bundesländer supported with smart map centering
- **Fast repeat searches** — 30-day local cache means instant loading for visited addresses
- **Keyboard navigation** — Browse restaurants without touching your mouse
- **Privacy-friendly** — No tracking, no analytics, all data stays in your browser

---

## About Falter

[Falter](https://www.falter.at/) is an independent Austrian weekly newspaper known for its cultural coverage and restaurant reviews. Their [Lokalführer](https://www.falter.at/lokalfuehrer) is one of the most comprehensive restaurant guides for Austria.

**If you enjoy their work:**

- 📰 [Subscribe to Falter](https://abo.falter.at/?ref=785) — Support independent journalism
- 📚 [Wien, wie es isst](https://shop.falter.at/suche/?q=wien+wie+es+isst) — Their acclaimed restaurant guide books
- 📱 [Wien, wie es isst App](https://www.falter.at/lokalfuehrer/wien-wie-es-isst-app) — Official mobile app with map feature

*This extension brings the map experience to desktop browsers. Independent project, not affiliated with Falter.*

---

## 📸 Screenshots

*Coming soon*

---

## Installation

This extension is not yet on the Chrome Web Store. Install it manually:

1. Download or clone this repository
2. Open `chrome://extensions/` in Chrome, Edge, or Brave
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `falter-map-extension` folder

---

## Usage

1. Visit [Falter Lokalführer](https://www.falter.at/lokalfuehrer/suche)
2. Apply your filters (district, cuisine, price range)
3. Click the **"Auf Karte anzeigen"** button that appears on the page
4. Explore restaurants on the interactive map

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑` `↓` | Navigate restaurant list |
| `Enter` | Zoom to selected restaurant |
| `Escape` | Close map |
| `?` | Show help |

---

## How It Works

1. **Parsing** — Reads restaurant names and addresses from Falter's search results
2. **Geocoding** — Converts addresses to coordinates using [OpenStreetMap Nominatim](https://nominatim.org/)
3. **Caching** — Stores coordinates locally for 30 days to avoid repeated API calls
4. **Display** — Shows results on a [Leaflet](https://leafletjs.com/) map with clustering

### Fair Use

To respect Nominatim's free API, the extension limits results to **100 restaurants** per search. Use Falter's filters to narrow your search for better results.

---

## Privacy

- **What's sent externally**: Restaurant addresses → OpenStreetMap Nominatim (for geocoding only)
- **What's stored locally**: Geocoded coordinates (30-day cache, clearable anytime)
- **What's tracked**: Nothing. No analytics, no personal data collection.

Uses [Bunny Fonts](https://fonts.bunny.net/) (EU-based, GDPR-compliant) instead of Google Fonts.

Full details: [Privacy Policy](docs/PRIVACY_POLICY.md)

---

## Development

```bash
git clone https://github.com/Grimnog/falter-map-extension.git
# Load as unpacked extension — no build step required
```

<details>
<summary>Project Structure</summary>

```
falter-map-extension/
├── manifest.json       # Extension configuration
├── content.js/css      # Main content script and styles
├── popup.html/js       # Extension popup
├── modules/            # JavaScript modules
│   ├── MapModal.js     # Map modal UI
│   ├── geocoder.js     # Nominatim integration
│   ├── dom-parser.js   # Falter page parsing
│   └── ...
├── vendor/             # Leaflet.js libraries
└── tests/              # Test suite
```

</details>

---

## Credits

- Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
- Geocoding by [Nominatim](https://nominatim.org/)
- Map library: [Leaflet](https://leafletjs.com/) + [MarkerCluster](https://github.com/Leaflet/Leaflet.markercluster)

### Built with AI Assistance

This project was developed with assistance from [Claude](https://claude.ai/) (Anthropic) for architecture, implementation, and code review, with additional input from [Gemini](https://gemini.google.com/) (Google) for UX feedback and security review.

---

## License

[MIT License](LICENSE) — Paul Timotheus Zimmert
