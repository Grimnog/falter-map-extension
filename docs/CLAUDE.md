# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Falter Restaurant Map** is a Chrome extension (Manifest V3) that transforms Falter Lokalführer search results into an interactive map. It geocodes Vienna restaurant addresses using OpenStreetMap Nominatim API with intelligent caching to avoid rate limits.

## Key Architecture

### Extension Components

The extension follows Chrome Manifest V3 architecture with three main components:

1. **Content Script (`content.js`)**: Runs on `falter.at/lokalfuehrer/suche*` pages. Handles:
   - Scraping restaurant data from DOM
   - Multi-page pagination fetching
   - Geocoding with OpenStreetMap Nominatim API (1 req/sec rate limit)
   - 30-day TTL cache management in `chrome.storage.local`
   - Leaflet.js map rendering in a modal overlay
   - Keyboard navigation (arrow keys, ESC)

2. **Background Service Worker (`background.js`)**: Minimal usage in current version. Originally intended for geocoding but most logic moved to content script for better UX. Handles cache operations via message passing.

3. **Popup (`popup.html`, `popup.js`)**: Extension settings interface showing:
   - Cache statistics (address count, storage size)
   - Cache clear functionality
   - User instructions

### Data Flow

```
User clicks "Auf Karte anzeigen" button
  → Fetch all paginated results from Falter.at
  → Check chrome.storage.local for cached coordinates
  → Geocode uncached addresses via Nominatim API (1/sec)
  → Display map modal with Leaflet.js
  → Allow keyboard navigation between restaurants
```

### Geocoding Cache Architecture

**Critical implementation detail**: Cache uses a new format since v0.3.0:

```javascript
// New format (with TTL expiration)
{
  "1010 wien, example strasse 1": {
    coords: { lat: 48.2082, lng: 16.3719 },
    cachedAt: 1234567890,
    expiresAt: 1237159890  // 30 days later
  }
}

// Old format (no expiration, auto-migrated)
{
  "1010 wien, example strasse 1": { lat: 48.2082, lng: 16.3719 }
}
```

**Migration strategy**: Both `content.js` and `popup.js` contain `loadGeocodeCache()` functions that:
- Detect old format (no `expiresAt` field)
- Auto-migrate to new format with 30-day TTL
- Filter expired entries on load

### Address Geocoding Strategy

Vienna addresses are challenging to geocode. The extension tries multiple variations:

1. Original format: `"Karmelitermarkt Stand 65, 1020 Wien, Austria"`
2. Without stand number: `"Karmelitermarkt, 1020 Wien, Austria"`
3. Simplified: `"Karmelitermarkt, Wien, Austria"`

This handles market stalls, unusual numbering, and edge cases.

## Development Commands

### Testing the Extension

1. **Load unpacked extension**:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select this directory

2. **Test on Falter.at**:
   - Go to `https://www.falter.at/lokalfuehrer/suche`
   - Apply filters (district, cuisine, etc.)
   - Look for "Auf Karte anzeigen" button injected into page
   - Click button to open map modal

3. **Check console logs**:
   - Content script logs: Right-click page → Inspect → Console
   - Background worker logs: `chrome://extensions/` → "Service worker" link
   - Popup logs: Right-click extension icon → Inspect popup

### Debugging Geocoding

To test geocoding manually:

```javascript
// In content script console
geocodeAddress("1010 Wien, Stephansplatz 1")
```

Cache inspection:

```javascript
// Check cache contents
chrome.storage.local.get(['geocodeCache'], (result) => {
  console.log(Object.keys(result.geocodeCache || {}).length, 'cached addresses');
  console.log(result.geocodeCache);
});

// Check storage usage
chrome.storage.local.getBytesInUse(['geocodeCache'], (bytes) => {
  console.log((bytes / 1024).toFixed(2), 'KB');
});
```

### Version Updates

Update version in three places:
1. `manifest.json` - `"version": "X.Y.Z"`
2. `popup.html` - `<div class="version">vX.Y.Z</div>`
3. `README.md` - Version History section

## Critical Implementation Notes

### Rate Limiting (OpenStreetMap Nominatim)

**IMPORTANT**: Nominatim has strict usage policies:
- 1 request per second maximum
- User-Agent header required: `'FalterMapExtension/1.0'`
- Implemented with `await new Promise(resolve => setTimeout(resolve, 1100))`
- 100+ uncached addresses trigger user confirmation dialog (content.js:839)

### Content Security Policy

The extension uses CSP in `manifest.json` to allow:
- Leaflet.js map tiles from `*.tile.openstreetmap.org`
- Nominatim API at `nominatim.openstreetmap.org`

Do not add external script sources without updating CSP.

### Pagination Detection

Falter.at uses both "Seite X/Y" and "SEITE X/Y" text. Detection is case-insensitive:

```javascript
const pageMatch = pageText.match(/seite\s+(\d+)\s*\/\s*(\d+)/i);
```

### Keyboard Navigation State Management

`content.js` maintains three navigation state variables:
- `selectedRestaurantIndex`: Current selection (-1 = none)
- `navigableRestaurants`: Filtered array of restaurants with coordinates
- `markers`: Array of Leaflet markers with `restaurantId` property

Reset all three when closing modal to prevent stale state.

### Animation System

The map uses two distinct marker update modes:

1. **Initial load / full refresh** (`animate=false`):
   - Removes all markers and recreates
   - Auto-zooms to fit all markers with `map.fitBounds()`

2. **Progressive geocoding** (`animate=true`):
   - Only adds NEW markers (checks `existingMarkerIds`)
   - Staggers animation with 50ms delay per marker
   - Applies `.marker-pulse` CSS class for 600ms
   - Does NOT auto-zoom (prevents jarring experience)

## File Structure

```
/
├── manifest.json          # Extension configuration (Manifest V3)
├── content.js             # Main logic: scraping, geocoding, map rendering
├── content.css            # Styles for injected button and map modal
├── background.js          # Service worker (minimal usage)
├── popup.html/js          # Extension popup interface
├── leaflet.js/css         # Map library (vendor, do not modify)
├── icons/                 # Extension icons (16x16, 48x48, 128x128)
├── images/                # Assets
└── icon-generator.html    # Utility for generating icons
```

## Common Issues

### Geocoding failures
- Some Vienna addresses don't match OpenStreetMap data exactly
- Extension tries 3-4 variations before giving up
- Check console for "No results for any variation" warnings

### Cache not persisting
- Ensure `chrome.storage.local.set()` callbacks complete
- Check quota: Chrome allows ~10MB for `storage.local`
- 5MB warning threshold at content.js:211

### Modal not appearing
- Button injection delayed by 500ms (`setTimeout(injectMapButton, 500)`)
- MutationObserver re-injects if button removed
- Check if `#entries` div exists on page

### Map tiles not loading
- CSP must allow `https://*.tile.openstreetmap.org/`
- Check network tab for CORS errors
- Leaflet.js attribution required by OSM license

## Extension Permissions

```json
"permissions": ["storage", "activeTab", "tabs"]
"host_permissions": [
  "https://www.falter.at/*",
  "https://nominatim.openstreetmap.org/*"
]
```

- `storage`: For geocoding cache
- `activeTab`: To inject content script
- `tabs`: To read tab URL for pagination detection
- Host permissions: Content script injection and API access
