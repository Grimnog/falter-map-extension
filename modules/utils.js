// Utility functions for Falter Map Extension

import { CONFIG } from './constants.js';

/**
 * Extract Bundesland from current page URL
 * Parses the ?r= parameter used by Falter.at to filter by region
 *
 * @returns {string|null} Bundesland name (normalized case) or null if not found/invalid
 *
 * @example
 * // URL: https://www.falter.at/lokalfuehrer/suche?r=Salzburg
 * getBundeslandFromURL(); // Returns: 'Salzburg'
 *
 * @example
 * // URL: https://www.falter.at/lokalfuehrer/suche?r=salzburg (lowercase)
 * getBundeslandFromURL(); // Returns: 'Salzburg' (normalized)
 *
 * @example
 * // URL: https://www.falter.at/lokalfuehrer/suche (no parameter)
 * getBundeslandFromURL(); // Returns: null
 *
 * @example
 * // URL: https://www.falter.at/lokalfuehrer/suche?r=InvalidName
 * getBundeslandFromURL(); // Returns: null
 */
export function getBundeslandFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const bundesland = urlParams.get('r');

    // No parameter found
    if (!bundesland) return null;

    // Normalize: decode URI encoding, trim whitespace
    const normalized = decodeURIComponent(bundesland).trim();

    // Empty after normalization
    if (!normalized) return null;

    // Valid Bundesländer (same keys as CONFIG.BUNDESLAND_CENTERS)
    const validBundeslaender = Object.keys(CONFIG.BUNDESLAND_CENTERS);

    // Find matching Bundesland (case-insensitive)
    const match = validBundeslaender.find(
        b => b.toLowerCase() === normalized.toLowerCase()
    );

    // Return matched name (preserves correct casing) or null
    return match || null;
}
