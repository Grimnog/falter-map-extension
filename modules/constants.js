// Configuration constants for Falter Map Extension

export const CONFIG = {
    COLORS: {
        FALTER_YELLOW: '#fbe51f', // Falter brand yellow - centralized for CI changes
        FALTER_YELLOW_RGB: 'rgb(251, 229, 31)', // RGB format for consistency
        FALTER_BLACK: '#190f0b', // Falter brand black - centralized for CI changes
        FALTER_BLACK_RGB: 'rgb(25, 15, 11)' // RGB format for consistency
    },

    CACHE: {
        TTL_DAYS: 30,
        TTL_MS: 30 * 24 * 60 * 60 * 1000,
        WARNING_SIZE_MB: 5,
        KEY: 'geocodeCache'
    },

    NOMINATIM: {
        RATE_LIMIT_MS: 1100,
        RETRY_DELAY_MS: 200,
        USER_AGENT: 'FalterMapExtension/1.0',
        API_URL: 'https://nominatim.openstreetmap.org/search'
    },

    GEOCODING: {
        MAX_RESULTS: 100,  // Hard limit to respect Nominatim TOS (non-configurable in UI)
        EXTREME_RESULT_THRESHOLD: 1000  // Threshold for additional "Alle Bundesländer" warning tip
    },

    PAGINATION: {
        FETCH_DELAY_MS: 300
    },

    MAP: {
        DEFAULT_CENTER: [48.2082, 16.3719],  // Wien (fallback for no ?r= parameter)
        DEFAULT_ZOOM: 13,
        SELECTED_ZOOM: 16,
        BOUNDS_PADDING: 0.1,
        CLUSTER: {
            MAX_RADIUS: 50,           // Cluster radius in pixels (tighter clustering)
            SPIDERFY: true,           // Spread out overlapping markers on click
            DISABLE_AT_ZOOM: 16,      // Disable clustering at district-level zoom
            SHOW_COVERAGE: false      // Don't show cluster coverage polygon
        }
    },

    // Bundesland center coordinates for dynamic map initialization
    // Coordinates are for each Bundesland's capital city
    // Source: OpenStreetMap Nominatim API (queried 2026-02-01)
    // Format: [latitude, longitude] (Leaflet format)
    BUNDESLAND_CENTERS: {
        'Wien': [48.2082, 16.3719],              // Wien (existing default)
        'Niederösterreich': [48.2044, 15.6229],  // St. Pölten
        'Oberösterreich': [48.3059, 14.2862],    // Linz
        'Salzburg': [47.7981, 13.0465],          // Salzburg
        'Tirol': [47.2654, 11.3928],             // Innsbruck
        'Vorarlberg': [47.5026, 9.7473],         // Bregenz
        'Steiermark': [47.0709, 15.4383],        // Graz
        'Kärnten': [46.6239, 14.3076],           // Klagenfurt
        'Burgenland': [47.8455, 16.5249]         // Eisenstadt
    },

    ANIMATION: {
        MARKER_STAGGER_MS: 50,
        MARKER_PULSE_MS: 600,
        MODAL_INIT_DELAY_MS: 100,
        BUTTON_INJECT_DELAY_MS: 500
    },

    UI: {
        SKELETON_ITEMS: 8,
        SKELETON_DELAY_MS: 300
    }
};
