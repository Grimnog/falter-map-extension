# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-02-09

### Fixed
- Removed unused `activeTab` and `tabs` permissions (Chrome Web Store compliance)

### Changed
- Updated terminology: "Bundesländer" → "federal states" in documentation

---

## [1.0.0] - 2026-02-04

### First Stable Release

**Production-ready release** with all planned features complete and security hardening for Chrome Web Store submission.

### Added
- Screenshots in README documentation
- Tech stack badges (Leaflet, OpenStreetMap, Bunny Fonts)
- Privacy policy for Chrome Web Store compliance

### Changed
- Replaced all dynamic innerHTML with createElement + textContent (XSS hardening)
- Cleaned up project structure (removed unused tests folder)

### Security
- All user-controlled content now uses safe DOM methods
- referrerPolicy: 'no-referrer' on all fetch requests
- URL validation for external links

---

## [0.10.0] - 2026-02-03

### 🎨 Complete UI/UX Refinement - High-Density Editorial Design

**Major Polish Release:** Professional, cohesive high-density editorial design across all extension components with consistent Falter branding.

### Added
- **Progress bar system** - Sleek 2px black progress bar replaces numerical badge
- **Editorial header redesign** - 24px title, status subtitle with checkmark completion icon
- **Static yellow underlines** - Permanent brand accent on Leaflet popup links (KISS principle)
- **Soft floating effects** - Subtle shadows on sidebar and map popups
- **Bottom-right zoom controls** - Modern convention (matches Google Maps, Apple Maps)
- **High-density compact popup** - 280px width, 40% smaller footprint
- **Unified card system** - Consistent grouped containers across all sections
- **Invincible hit boxes** - 100% reliable click areas with !important overrides
- **Clean speech bubble arrows** - White Leaflet popup tips without shadow

### Changed
- **Popup dimensions** - Width 320px → 280px, all vertical spacing reduced 30-40%
- **Modal sidebar density** - Header padding 32px → 24px, list items 30% reduction
- **Typography hierarchy** - Bold black names (1rem), charcoal grey addresses (0.8rem)
- **Number markers** - 28px → 24px (modal), 20px → 18px (sidebar), 20px → 16px (popup)
- **Leaflet popup design** - 240px width, 20px spacious padding, editorial label style
- **Restaurant name interaction** - Static 4px yellow underline (no hover needed)
- **Color system** - All components use `var(--falter-yellow)` or `#fbe51f` (brand consistency)
- **Header subtitle** - Shows "Restaurants werden gesucht..." → "✓ X Restaurants gefunden"
- **Zoom control styling** - Black border, yellow hover state, 36px buttons
- **List hover effect** - Yellow tint rgba(255, 237, 0, 0.1) instead of grey

### Fixed
- **Map pin visual glitch** - Removed staggered animation causing pins to appear at edge before jumping
- **Status badge pulsing** - Removed noisy border animation during geocoding
- **Badge size instability** - Fixed width (60px) prevents layout shift with double/triple digits
- **Progress completion race** - Added state flags to show completion message exactly once
- **German localization** - All progress text in German ("Restaurants gefunden")
- **Color inconsistency** - Replaced hardcoded `#FFED00` with correct brand yellow `#fbe51f`
- **Browser default links** - Killed standard blue with !important color overrides
- **Hit box reliability** - z-index: 10, position: relative, 100% width ensures clicks work
- **Arrow shadow clunk** - Clean white speech bubble tips (box-shadow: none)

### Technical
- Removed 40 lines dead code (progress-container, unused DOM references)
- Updated `updateProgress()` with `isFinal` parameter for race-free completion
- Added state management flags: `hasStartedGeocoding`, `isProgressComplete`
- Leaflet popup classes: `.falter-popup-link`, `.falter-popup-address`, `.falter-maps-link`
- Popup unified classes: `.card-group`, `.row-item` for consistent design
- CSS variables enforced throughout for brand color management
- Map initialization: `zoomControl: false`, custom bottom-right positioning
- All critical popup styles use !important to override browser defaults
- Popup HTML restructured: header 10px 14px, cards 10px 12px padding

**Sprint 9 Complete:** All 4 UI/UX tickets delivered (FALTMAP-40, 41, 42, 43)

**Design Philosophy:** High-density editorial inspired by premium publications (NYT, Zeit). KISS principle - static underlines over hover effects, !important over specificity battles, consistent spacing over arbitrary values.

---

## [0.9.0] - 2026-02-01

### 🇦🇹 Austria-Wide Support

**Major Feature Release:** The extension now works seamlessly across all 9 Austrian federal states, not just Vienna!

### Added
- **Austria-wide Bundesland support** - Works for all 9 Austrian states (Wien, Niederösterreich, Oberösterreich, Salzburg, Tirol, Vorarlberg, Steiermark, Kärnten, Burgenland)
- **Smart map centering** - Map automatically centers on the Bundesland capital you're searching (e.g., Salzburg search → map starts on Salzburg city)
- **Optimized zoom levels** - State-level zoom (9) for federal states, city-level zoom (13) for Vienna
- **Bundesland center coordinates** - Accurate coordinates for all 9 Bundesland capitals
- **URL parameter detection** - Detects region from Falter.at's `?r=` filter parameter
- **Multi-word city support** - Handles cities like "Purbach am Neusiedler See", "Weiden am See", "Schützen am Gebirge"
- **Hyphenated city support** - Parses cities like "Deutsch Schützen-Eisenberg"
- **Building-level precision geocoding** - Across all Austrian regions
- **Comprehensive test suite** - 88 automated tests covering all Austria-wide features

### Changed
- **Geocoding system completely refactored** - Switched from free-form queries to structured Nominatim API
- **7-tier fallback strategy** - Maximizes geocoding success rate across all regions
  - Tier 1: Restaurant name (amenity) - 70-80% success rate (80/20 principle validated!)
  - Tier 2: Street address - 15-20% success rate
  - Tier 3: Combined street + amenity
  - Tier 4: Amenity types (restaurant, cafe, bar, fast_food, pub)
  - Tier 5: Cleaned street names (removes prefixes, blocks, parentheses)
  - Tier 6: Free-form query (handles complex addresses)
  - Tier 7: City-level approximate (last resort)
- **Address parsing enhanced** - Handles optional street numbers, em-dashes, parenthesized descriptors
- **Street name cleaning** - Generic regex-based cleaning (removes "Strombad", "Nord/Süd/Ost/West", "Block VI", "Stand XX", parentheses, Roman numerals)
- **Dynamic map initialization** - Uses Bundesland-specific center if detected, Wien default otherwise
- **Backward compatibility maintained** - Wien searches work identically to v0.8.0 (no regressions)

### Fixed
- **Multi-word city parsing** - "Purbach am Neusiedler See" now correctly extracted (was failing with single-word regex)
- **DOM parser Wien-only regex** - Extended to support all Austrian city names
- **Tier execution order** - Free-form (Tier 6) now runs before city-level approximate (Tier 7)
- **Em-dash handling** - Addresses with "–" (em-dash) now parse correctly
- **Addresses without numbers** - Location descriptors like "(Göschl Tourismusprojekte – Seepark)" now supported

### Technical
- Added `modules/url-utils.js` - URL parameter parsing utilities
- Added `BUNDESLAND_CENTERS` to constants.js (9 coordinate pairs from Nominatim)
- Added `getBundeslandFromURL()` utility function
- Extended `geocoder.js` - Structured query API with multi-tier fallback
- Extended `dom-parser.js` - Austria-wide address pattern support
- Updated `MapModal.js` - Dynamic center and zoom based on detected Bundesland
- Added `tests/url-utils.test.js` - 56 tests for URL parsing
- Updated `tests/geocoder.test.js` - 17 tests (10 new) for tier system
- Updated `tests/dom-parser.test.js` - 15 tests (6 new) for address patterns
- Rate limiting respected (1 req/sec, stop at first successful tier)
- Most queries resolved in 1-2 API calls (Tier 1 or Tier 2)

**Sprint 8 Complete:** All 7 Austria-wide support sub-tickets delivered (FALTMAP-26.1 through 26.7)

**Tested:** All 9 federal states validated with real Falter.at searches

---

## [0.8.0] - 2026-01-30

### Added
- **Bunny Fonts integration** - GDPR-compliant EU-based font hosting via Bunny Fonts CDN
- **Nunito font** - Clean, modern geometric sans-serif for improved readability
- **Integrated header badge** - Status indicator positioned in modal header (right-aligned)
- **German popup redesign** - Fully localized, compact, professional popup interface
- **Clickable Lokalführer link** - Direct access to Falter.at from popup

### Changed
- **Status message redesign** - Pill-shaped badge with translucent background and black border
- Status no longer resembles a textbox (clear visual hierarchy)
- Header gets Falter black bottom border (2px) separating it from restaurant list
- Modal header padding optimized (26px → 18px) for compact design
- Popup fully German (no English/German mixing)
- Clear cache confirmation now subtle (green message, 3-second auto-hide, no browser alerts)
- Cache usage display remains visible and functional
- Typography improvements throughout for better readability

### Fixed
- Status badge positioning (center-aligned with title text baseline)
- Header text overflow prevention (max-width: 180px prevents badge overlap)
- Popup design consistency (matches modal colors, fonts, spacing)
- Cache clear button sizing (no longer oversized)

### Technical
- CSS variable system for centralized color management (DRY principle)
- Bunny Fonts loaded via CDN (https://fonts.bunny.net)
- Status badge uses absolute positioning within header (z-index: 10)
- Popup uses Nunito font family with proper fallbacks
- All privacy-compliant: EU-based font CDN respects European privacy laws

**Sprint 6 Complete:** All 3 UI/UX Polish tickets delivered (FALTMAP-27, FALTMAP-30, FALTMAP-28)

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

[0.8.0]: https://github.com/paulzimmert/falter-map-extension/releases/tag/v0.8.0
[0.7.0]: https://github.com/paulzimmert/falter-map-extension/releases/tag/v0.7.0
[0.6.0]: https://github.com/paulzimmert/falter-map-extension/releases/tag/v0.6.0
[0.5.0]: https://github.com/paulzimmert/falter-map-extension/releases/tag/v0.5.0
[0.4.0]: https://github.com/paulzimmert/falter-map-extension/releases/tag/v0.4.0
[0.3.0]: https://github.com/paulzimmert/falter-map-extension/releases/tag/v0.3.0
[0.2.0]: https://github.com/paulzimmert/falter-map-extension/releases/tag/v0.2.0
[0.1.0]: https://github.com/paulzimmert/falter-map-extension/releases/tag/v0.1.0
