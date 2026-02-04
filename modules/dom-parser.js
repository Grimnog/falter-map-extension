// DOM parsing utilities for extracting restaurant data from Falter pages

import { CONFIG } from './constants.js';
import { ErrorHandler } from './error-handler.js';

// ============================================
// SELECTORS & PATTERNS
// ============================================

const SELECTORS = {
    restaurantLink: 'a.group.block[href*="/lokal/"]',
    restaurantName: 'h2'
};

const PATTERNS = {
    // Extract restaurant ID from URL: /lokal/12345/
    restaurantId: /\/lokal\/(\d+)\//,

    // Pagination: "Seite 1 / 5"
    pagination: /seite\s+(\d+)\s*\/\s*(\d+)/i,

    // Lines to skip when extracting name (status messages)
    skipLine: /^(derzeit|jetzt|öffnet|geschlossen|bis\s)/i,

    // Address line detection: starts with 4-digit ZIP
    addressLine: /^\d{4}\s+[A-Za-zäöüÄÖÜß]/i,

    // Street number at end of street name: "Hauptstraße 15" or "Gasse 7a"
    streetNumber: /^(.+?)\s+(\d+[A-Za-z\/\-]*)$/
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parse address from text using step-by-step approach
 * Handles: "1040 Wien, Wiedner Hauptstraße 15" or "7083 Purbach am See, Hauptgasse 64"
 * @param {string} text - Text containing address
 * @returns {Object|null} { zip, city, street, number } or null if not found
 */
function parseAddress(text) {
    const lines = text.split('\n').map(l => l.trim());

    // Step 1: Find the address line (starts with 4-digit ZIP)
    const addressLine = lines.find(line => PATTERNS.addressLine.test(line));
    if (!addressLine) return null;

    // Step 2: Split on comma - "1040 Wien, Wiedner Hauptstraße 15"
    const commaIndex = addressLine.indexOf(',');
    if (commaIndex === -1) return null;

    const locationPart = addressLine.substring(0, commaIndex).trim();
    const streetPart = addressLine.substring(commaIndex + 1).trim();

    if (!locationPart || !streetPart) return null;

    // Step 3: Extract ZIP and city from location part
    const zipMatch = locationPart.match(/^(\d{4})\s+(.+)$/);
    if (!zipMatch) return null;

    const zip = zipMatch[1];
    const city = zipMatch[2].trim();

    // Step 4: Extract street and optional number
    const numberMatch = streetPart.match(PATTERNS.streetNumber);

    if (numberMatch) {
        return {
            zip,
            city,
            street: numberMatch[1].trim(),
            number: numberMatch[2].trim()
        };
    }

    // No street number - entire part is street/location name
    return {
        zip,
        city,
        street: streetPart,
        number: ''
    };
}

/**
 * Extract restaurant name from link element
 * @param {Element} link - Link element
 * @param {string} text - Text content
 * @returns {string} Restaurant name or empty string
 */
function parseName(link, text) {
    // Try to find h2 element first
    const h2 = link.querySelector(SELECTORS.restaurantName);
    if (h2) {
        return h2.textContent.trim();
    }

    // Fallback: find first line that's not an address or status message
    const lines = text.split('\n').map(l => l.trim()).filter(l => l && l.length > 2);
    for (const line of lines) {
        if (!PATTERNS.addressLine.test(line) && !PATTERNS.skipLine.test(line)) {
            return line;
        }
    }

    return '';
}

// ============================================
// MAIN PARSING FUNCTIONS
// ============================================

/**
 * Parse restaurant data from DOM
 * @param {Document} doc - DOM document to parse
 * @returns {Array} Array of restaurant objects
 */
export function parseRestaurantsFromDOM(doc) {
    const restaurants = [];
    const links = doc.querySelectorAll(SELECTORS.restaurantLink);

    // Track parsing stats for debugging
    let stats = { found: links.length, parsed: 0, noName: 0, noAddress: 0, duplicate: 0 };

    links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        const idMatch = href.match(PATTERNS.restaurantId);
        if (!idMatch) return;

        const id = idMatch[1];
        const text = link.innerText || link.textContent || '';

        // Extract name and address using helper functions
        const name = parseName(link, text);
        const address = parseAddress(text);

        // Track failure reasons
        if (!name) { stats.noName++; return; }
        if (!address) { stats.noAddress++; return; }

        const { zip, city, street, number } = address;

        const restaurant = {
            id,
            name: name.split('\n')[0].trim(),
            city,
            zip,
            street: number ? `${street} ${number}` : street,
            address: number ? `${zip} ${city}, ${street} ${number}` : `${zip} ${city}, ${street}`,
            url: href.startsWith('http') ? href : `https://www.falter.at${href}`
        };

        if (restaurants.find(r => r.id === id)) {
            stats.duplicate++;
        } else {
            restaurants.push(restaurant);
            stats.parsed++;
        }
    });

    // Log parsing summary
    console.log(`Parsing: ${stats.parsed}/${stats.found} restaurants` +
        (stats.noName ? `, ${stats.noName} no name` : '') +
        (stats.noAddress ? `, ${stats.noAddress} no address` : '') +
        (stats.duplicate ? `, ${stats.duplicate} duplicates` : ''));

    return restaurants;
}

/**
 * Get pagination information from current page
 * @returns {Object} Pagination info {current, total}
 */
export function getPaginationInfo() {
    const pageText = document.body.innerText || '';
    const pageMatch = pageText.match(PATTERNS.pagination);

    if (pageMatch) {
        return {
            current: parseInt(pageMatch[1]),
            total: parseInt(pageMatch[2])
        };
    }
    return { current: 1, total: 1 };
}

/**
 * Get search URL base without page parameter
 * @returns {string} Base URL
 */
function getSearchUrlBase() {
    const url = new URL(window.location.href);
    url.searchParams.delete('page');
    return url.toString();
}

/**
 * Fetch a specific page of results
 * @param {number} pageNum - Page number to fetch
 * @returns {Promise<Array>} Array of restaurants
 */
async function fetchPage(pageNum) {
    const baseUrl = getSearchUrlBase();
    const separator = baseUrl.includes('?') ? '&' : '?';
    const url = pageNum > 1 ? `${baseUrl}${separator}page=${pageNum}` : baseUrl;

    console.log('Fetching page:', pageNum);

    try {
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`HTTP error fetching page ${pageNum}: ${response.status}`);
            ErrorHandler.showToast(`Failed to load page ${pageNum}. Continuing with available data.`, {
                type: 'warning',
                duration: 4000
            });
            return [];
        }

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return parseRestaurantsFromDOM(doc);
    } catch (error) {
        console.error(`Error fetching page ${pageNum}:`, error);
        ErrorHandler.showToast(`Network error loading page ${pageNum}. Continuing with available data.`, {
            type: 'warning',
            duration: 4000
        });
        return [];
    }
}

/**
 * Unified fetch function for paginated restaurant results
 * @param {Object} options - Fetch options
 * @param {number} [options.maxResults=Infinity] - Maximum restaurants to fetch
 * @param {Function} [options.onProgress] - Progress callback (current, total)
 * @returns {Promise<Object>} { restaurants, totalPages, estimatedTotal }
 */
async function fetchPages({ maxResults = Infinity, onProgress = null } = {}) {
    const pagination = getPaginationInfo();
    console.log('Pagination:', pagination);

    const allRestaurants = [];
    const seenIds = new Set();

    // Parse current page first (needed for estimation and caching)
    const currentPageRestaurants = parseRestaurantsFromDOM(document);
    const avgPerPage = currentPageRestaurants.length || 15;
    const estimatedTotal = avgPerPage * pagination.total;

    // Calculate pages to fetch based on limit
    let pagesToFetch = pagination.total;
    const hasLimit = maxResults !== Infinity;

    if (hasLimit && estimatedTotal > maxResults) {
        pagesToFetch = Math.ceil(maxResults / avgPerPage);
        console.log(`Limiting: ${pagesToFetch} pages to get ~${maxResults} results`);
    }

    for (let page = 1; page <= pagesToFetch; page++) {
        // Check limit before fetching next page
        if (hasLimit && allRestaurants.length >= maxResults) {
            console.log(`Reached limit of ${maxResults} restaurants`);
            break;
        }

        if (onProgress) onProgress(page, pagesToFetch);

        // Use cached current page or fetch remote page
        const restaurants = (page === pagination.current)
            ? currentPageRestaurants
            : await fetchPage(page);

        // Add unique restaurants (respecting limit if set)
        for (const r of restaurants) {
            if (seenIds.has(r.id)) continue;
            if (hasLimit && allRestaurants.length >= maxResults) break;

            seenIds.add(r.id);
            allRestaurants.push(r);
        }

        // Delay between page fetches (except after last page)
        if (page < pagesToFetch) {
            await new Promise(resolve => setTimeout(resolve, CONFIG.PAGINATION.FETCH_DELAY_MS));
        }
    }

    console.log('Total restaurants:', allRestaurants.length);
    return {
        restaurants: allRestaurants,
        totalPages: pagination.total,
        estimatedTotal
    };
}

/**
 * Fetch all pages of search results
 * @param {Function} progressCallback - Optional callback for progress updates
 * @returns {Promise<Array>} All restaurants from all pages
 */
export async function fetchAllPages(progressCallback) {
    const result = await fetchPages({ onProgress: progressCallback });
    return result.restaurants;
}

/**
 * Fetch restaurants up to a specified limit
 * @param {number} maxResults - Maximum number of restaurants to fetch
 * @param {Function} progressCallback - Optional callback for progress updates
 * @returns {Promise<Object>} Object with { restaurants, totalPages, estimatedTotal }
 */
export async function fetchUpToLimit(maxResults, progressCallback) {
    return fetchPages({ maxResults, onProgress: progressCallback });
}
