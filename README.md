# Falter Restaurant Map - Chrome Extension

View your Falter Lokalführer search results on an interactive map.

## Installation

### Chrome / Edge / Brave

1. Unzip this folder somewhere permanent (e.g., Documents)
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the unzipped `falter-map-extension` folder
6. The extension icon should appear in your toolbar

### Firefox

Firefox uses a different extension format. This extension is built for Chromium-based browsers.

## Usage

1. Go to [falter.at/lokalfuehrer/suche](https://www.falter.at/lokalfuehrer/suche)
2. Apply your filters (district, cuisine, price, etc.)
3. Click the red **"Show on Map"** button that appears on the page
4. Click the extension icon in your toolbar to open the map

## Features

- **Automatic pagination**: Fetches all result pages, not just the first one
- **Geocoding with cache**: Addresses are geocoded via OpenStreetMap and cached locally. Second time you search the same restaurants, it's instant.
- **Dark theme map**: Easy on the eyes
- **Click to zoom**: Click any restaurant in the sidebar to zoom to its location
- **Direct links**: Each popup has links to the Falter page and Google Maps

## Notes

- Geocoding takes ~1 second per restaurant (OpenStreetMap rate limit)
- Cached addresses persist across browser sessions
- Some addresses may fail to geocode if the formatting is unusual

## Troubleshooting

**"Show on Map" button doesn't appear?**
- Refresh the page
- Make sure you're on a search results page (URL contains `/lokalfuehrer/suche`)

**Map doesn't load in popup?**
- Check your internet connection
- Try closing and reopening the popup

**Want to clear the geocoding cache?**
- Go to `chrome://extensions/`
- Click "Details" on this extension
- Click "Clear data" or remove/reinstall the extension
