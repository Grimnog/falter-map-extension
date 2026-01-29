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
                if (!line.match(/^\d{4}\s*Wien/i) && !line.match(/^(derzeit|Jetzt|öffnet|geschlossen|bis\s)/i)) {
                    name = line;
                    break;
                }
            }
        }

        // Extract address components
        const addressMatch = text.match(/(\d{4})\s*Wien,?\s*([A-Za-zäöüÄÖÜßéèê\s\-\.]+?)[\s\n]+(\d+[A-Za-z\/\-]*)/i);

        if (name && addressMatch) {
            const district = addressMatch[1];
            const street = addressMatch[2].trim();
            const number = addressMatch[3].trim();

            const restaurant = {
                id: id,
                name: name.split('\n')[0].trim(),
                district: district,
                street: `${street} ${number}`,
                address: `${district} Wien, ${street} ${number}`,
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
