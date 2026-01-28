// Configuration constants for Falter Map Extension

export const CONFIG = {
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
        API_URL: 'https://nominatim.openstreetmap.org/search',
        WARNING_THRESHOLD: 100
    },

    PAGINATION: {
        FETCH_DELAY_MS: 300
    },

    MAP: {
        DEFAULT_CENTER: [48.2082, 16.3719],
        DEFAULT_ZOOM: 13,
        SELECTED_ZOOM: 16,
        BOUNDS_PADDING: 0.1
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
