// DOM parsing utilities for extracting restaurant data from Falter pages

import { CONFIG } from './constants.js';
import { ErrorHandler } from './error-handler.js';

/**
 * Parse restaurant data from DOM
 * @param {Document} doc - DOM document to parse
 * @returns {Array} Array of restaurant objects
 */
export function parseRestaurantsFromDOM(doc) {
    const restaurants = [];
    const links = doc.querySelectorAll('a.group.block[href*="/lokal/"]');

    console.log('Found restaurant links:', links.length);

    links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        const idMatch = href.match(/\/lokal\/(\d+)\//);
        if (!idMatch) return;

        const id = idMatch[1];
        const text = link.innerText || link.textContent || '';

        // Extract restaurant name
        let name = '';
        const h2 = link.querySelector('h2');
        if (h2) {
            name = h2.textContent.trim();
        } else {
            const lines = text.split('\n').map(l => l.trim()).filter(l => l && l.length > 2);
            for (const line of lines) {
                // Skip lines that look like addresses or status messages
                if (!line.match(/^\d{4}\s+[A-Za-zäöüÄÖÜß]/i) && !line.match(/^(derzeit|Jetzt|öffnet|geschlossen|bis\s)/i)) {
                    name = line;
                    break;
                }
            }
        }

        // Extract address components - supports all Austrian cities
        // Pattern: "{ZIP} {City}, {Street} {Number}"
        // Examples: "3420 Klosterneuburg, Donaulände 15"
        //           "8010 Graz, Heinrichstraße 56"
        //           "1040 Wien, Rechte Wienzeile 1"
        const addressMatch = text.match(/(\d{4})\s+([A-Za-zäöüÄÖÜß]+),?\s*([A-Za-zäöüÄÖÜßéèê\s\-\.]+?)\s+(\d+[A-Za-z\/\-]*)/i);

        if (name && addressMatch) {
            const zip = addressMatch[1];
            const city = addressMatch[2].trim();
            const street = addressMatch[3].trim();
            const number = addressMatch[4].trim();

            const restaurant = {
                id: id,
                name: name.split('\n')[0].trim(),
                city: city,
                zip: zip,
                street: `${street} ${number}`,
                address: `${zip} ${city}, ${street} ${number}`,
                url: href.startsWith('http') ? href : `https://www.falter.at${href}`
            };

            if (!restaurants.find(r => r.id === id)) {
                restaurants.push(restaurant);
                console.log('Parsed:', restaurant.name, '-', restaurant.address);
            }
        }
    });

    return restaurants;
}

/**
 * Get pagination information from current page
 * @returns {Object} Pagination info {current, total}
 */
export function getPaginationInfo() {
    const pageText = document.body.innerText || '';
    // Match both "Seite" and "SEITE" (case-insensitive)
    const pageMatch = pageText.match(/seite\s+(\d+)\s*\/\s*(\d+)/i);

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
 * Fetch all pages of search results
 * @param {Function} progressCallback - Optional callback for progress updates
 * @returns {Promise<Array>} All restaurants from all pages
 */
export async function fetchAllPages(progressCallback) {
    const pagination = getPaginationInfo();
    console.log('Pagination:', pagination);

    const allRestaurants = [];
    const seenIds = new Set();

    for (let page = 1; page <= pagination.total; page++) {
        if (progressCallback) progressCallback(page, pagination.total);

        const restaurants = (page === pagination.current)
            ? parseRestaurantsFromDOM(document)
            : await fetchPage(page);

        restaurants.forEach(r => {
            if (!seenIds.has(r.id)) {
                seenIds.add(r.id);
                allRestaurants.push(r);
            }
        });

        if (page < pagination.total) {
            await new Promise(resolve => setTimeout(resolve, CONFIG.PAGINATION.FETCH_DELAY_MS));
        }
    }

    console.log('Total restaurants:', allRestaurants.length);
    return allRestaurants;
}

/**
 * Fetch restaurants up to a specified limit
 * @param {number} maxResults - Maximum number of restaurants to fetch
 * @param {Function} progressCallback - Optional callback for progress updates
 * @returns {Promise<Object>} Object with { restaurants: Array, totalPages: number, estimatedTotal: number }
 */
export async function fetchUpToLimit(maxResults, progressCallback) {
    const pagination = getPaginationInfo();
    console.log('Pagination:', pagination);

    const allRestaurants = [];
    const seenIds = new Set();
    let pagesToFetch = pagination.total;

    // Estimate restaurants per page from current page
    const currentPageRestaurants = parseRestaurantsFromDOM(document);
    const avgPerPage = currentPageRestaurants.length || 15; // Default estimate if parsing fails
    const estimatedTotal = avgPerPage * pagination.total;

    // Calculate how many pages we need to fetch to get ~maxResults
    if (estimatedTotal > maxResults) {
        pagesToFetch = Math.ceil(maxResults / avgPerPage);
        console.log(`Limiting fetch: ${pagesToFetch} pages (estimated ${avgPerPage} per page) to get ~${maxResults} results`);
    }

    for (let page = 1; page <= pagesToFetch && allRestaurants.length < maxResults; page++) {
        if (progressCallback) progressCallback(page, pagesToFetch);

        const restaurants = (page === pagination.current)
            ? currentPageRestaurants
            : await fetchPage(page);

        restaurants.forEach(r => {
            if (!seenIds.has(r.id) && allRestaurants.length < maxResults) {
                seenIds.add(r.id);
                allRestaurants.push(r);
            }
        });

        // Stop if we've reached the limit
        if (allRestaurants.length >= maxResults) {
            console.log(`Reached limit of ${maxResults} restaurants, stopping fetch`);
            break;
        }

        if (page < pagesToFetch) {
            await new Promise(resolve => setTimeout(resolve, CONFIG.PAGINATION.FETCH_DELAY_MS));
        }
    }

    console.log('Total restaurants fetched:', allRestaurants.length);
    return {
        restaurants: allRestaurants,
        totalPages: pagination.total,
        estimatedTotal: estimatedTotal
    };
}
