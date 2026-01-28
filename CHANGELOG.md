# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2025-01-28

### Changed
- **Major refactoring (Phase 1)**: Improved code maintainability and consistency
- Extracted shared `constants.js` module for all configuration values
- Created unified `CacheManager` module for geocoding cache operations
- Eliminated ~70 lines of duplicated cache management code
- All magic numbers replaced with named constants (timing, thresholds, coordinates)
- Reduced custom code by ~16% while maintaining all functionality

### Technical
- Refactored content.js (904 → 838 lines)
- Refactored popup.js (87 → 52 lines)
- Refactored background.js to use shared modules
- Added ES6 module support for background service worker
- Added web_accessible_resources for dynamic module imports in content scripts
- Improved code separation of concerns and testability

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

[0.4.0]: https://github.com/paulzimmert/falter-map-extension/releases/tag/v0.4.0
[0.3.0]: https://github.com/paulzimmert/falter-map-extension/releases/tag/v0.3.0
[0.2.0]: https://github.com/paulzimmert/falter-map-extension/releases/tag/v0.2.0
[0.1.0]: https://github.com/paulzimmert/falter-map-extension/releases/tag/v0.1.0
