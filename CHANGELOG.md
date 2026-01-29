# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0] - 2026-01-29

### Added
- **Auto-zoom** after first 5 geocoded restaurants for better initial map view
- **German UI text** throughout modal (status labels, progress text)
- Centralized Falter brand colors (yellow #fbe51f, black #190f0b) as CSS variables

### Changed
- Modal header redesigned with Falter yellow background and black text
- Removed restaurant count from header for cleaner design
- Status label changes from "Suche läuft..." to "Suche abgeschlossen" when complete
- All progress counts show clean "X/Y" format without "gefunden"
- Brand colors now centralized in CSS variables and constants.js

### Fixed
- Corrected Falter yellow from #FFD600 to #fbe51f (accurate brand color)
- Modal header text now uses Falter black #190f0b instead of pure black
- Status label no longer shows "abgeschlossen" prematurely on initial load

### Technical
- Added `getMarkerClusterGroup()` getter method to MapModal
- CSS custom properties for easy brand color updates
- CONFIG.COLORS in constants.js for centralized color definitions

## [0.6.0] - 2026-01-29

### Added
- **Marker clustering** for dense map areas - clusters automatically split apart when zooming in
- **Full accessibility support** - modal now fully usable with keyboard and screen readers
- ARIA roles and labels throughout modal interface (dialog, listbox, options)
- Focus management - focus moves to modal on open and returns to trigger button on close
- Focus trap - Tab key cycles only through interactive elements within modal
- Screen reader announcements for status updates and navigation

### Changed
- Organized third-party libraries into `vendor/leaflet/` directory
- Cleaned up project structure - removed empty directories
- Tuned clustering for district-level filtering (radius: 50px, disable at zoom 16)
- Results list container now tab-focusable for keyboard navigation
- Background content hidden from screen readers when modal is open

### Technical
- Integrated Leaflet.markercluster v1.5.3 library
- Implemented WCAG 2.1 compliant focus management
- Added `aria-hidden` management for modal backdrop
- Progress bar now updates `aria-valuenow` dynamically
- All interactive elements have proper ARIA labels and roles
- Comprehensive test suite with 98 tests and 80%+ coverage

## [0.5.0] - 2025-01-28

### Added
- **Visual progress bar** for geocoding with animated yellow gradient
- **Keyboard shortcuts help overlay** - Press '?' to see available shortcuts
- Progress indicator shows both processing status and located count

### Changed
- Progress bar tracks processing progress (all attempts) rather than just successful locations
- Progress text differentiates between "Processing X/Y..." and "Complete: Z/Y located"
- Improved user feedback during geocoding with dual status display

### Fixed
- Progress bar no longer gets stuck when some restaurants fail to geocode
- ESC key now closes help overlay before closing modal

## [0.4.0] - 2025-01-28

### Changed
- **Major refactoring (Phase 1 + 2)**: Complete modular architecture overhaul
- Extracted shared `constants.js` module for all configuration values
- Created unified `CacheManager` module for geocoding cache operations
- Extracted `dom-parser.js` module for restaurant data scraping and pagination
- Extracted `geocoder.js` module for address geocoding logic
- Eliminated ~270 lines of code duplication across all files
- All magic numbers replaced with named constants (timing, thresholds, coordinates)
- content.js reduced by 37% (904 → 571 lines)
- Overall code organization significantly improved

### Technical
- **Phase 1**: Cache management and constants unification
  - Refactored popup.js (87 → 52 lines, -40%)
  - Refactored background.js to use shared modules
  - Added ES6 module support for background service worker
- **Phase 2**: Core logic modularization
  - Created modules/dom-parser.js (153 lines) - restaurant scraping
  - Created modules/geocoder.js (158 lines) - address geocoding
  - content.js (904 → 571 lines, -37%)
- Added web_accessible_resources for dynamic module imports in content scripts
- Improved code separation of concerns and testability
- Each module has single responsibility and clear interface

## [0.3.0] - 2025-01-28

### Added
- Loading skeleton animation while fetching restaurants
- Empty state UI when no results found
- Smooth pin drop animations for newly geocoded locations
- Compact popup design with better visual hierarchy
- API usage threshold warning for 100+ uncached addresses

### Changed
- Pagination detection now case-insensitive (handles "SEITE" and "Seite")
- Progressive marker animation during geocoding (no auto-zoom jumps)
- Improved status indicators with visual feedback

### Fixed
- Map not auto-zooming during progressive updates
- Pagination regex not matching uppercase text

## [0.2.0] - 2025-01-XX

### Fixed
- Pagination detection edge cases with case-sensitive matching

### Changed
- Updated icon set for better visibility

## [0.1.0] - 2025-01-XX

### Added
- Initial release
- Interactive map view for Falter Lokalführer search results
- OpenStreetMap Nominatim geocoding with 1 req/sec rate limiting
- 30-day geocoding cache to minimize API usage
- Smart pagination - automatically fetches all result pages
- Keyboard navigation (arrow keys to navigate, ESC to close)
- Direct links to Falter details and Google Maps
- Extension popup with cache management

### Technical
- Chrome Manifest V3 implementation
- Leaflet.js for map rendering
- Local storage for geocoding cache with TTL expiration
- Address variation strategies for Vienna-specific formatting

[0.7.0]: https://github.com/paulzimmert/falter-map-extension/releases/tag/v0.7.0
[0.6.0]: https://github.com/paulzimmert/falter-map-extension/releases/tag/v0.6.0
[0.5.0]: https://github.com/paulzimmert/falter-map-extension/releases/tag/v0.5.0
[0.4.0]: https://github.com/paulzimmert/falter-map-extension/releases/tag/v0.4.0
[0.3.0]: https://github.com/paulzimmert/falter-map-extension/releases/tag/v0.3.0
[0.2.0]: https://github.com/paulzimmert/falter-map-extension/releases/tag/v0.2.0
[0.1.0]: https://github.com/paulzimmert/falter-map-extension/releases/tag/v0.1.0
