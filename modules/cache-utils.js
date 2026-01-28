// Shared cache management utilities for geocoding cache

import { CONFIG } from './constants.js';

export const CacheManager = {
    /**
     * Load and validate geocoding cache from chrome.storage.local
     * Automatically migrates old format and filters expired entries
     * @returns {Promise<Object>} Valid cache entries
     */
    async load() {
        return new Promise((resolve) => {
            chrome.storage.local.get([CONFIG.CACHE.KEY], (result) => {
                const cache = result[CONFIG.CACHE.KEY] || {};
                const now = Date.now();
                const validCache = {};

                // Filter and migrate cache entries
                for (const [address, data] of Object.entries(cache)) {
                    if (!data.expiresAt) {
                        // Migrate old format: { lat, lng } -> { coords, cachedAt, expiresAt }
                        validCache[address] = {
                            coords: data,
                            cachedAt: now,
                            expiresAt: now + CONFIG.CACHE.TTL_MS
                        };
                    } else if (data.expiresAt > now) {
                        // Keep valid entries
                        validCache[address] = data;
                    }
                    // Expired entries are implicitly filtered out
                }

                resolve(validCache);
            });
        });
    },

    /**
     * Save a geocoded address to cache with TTL
     * @param {string} address - The address to cache
     * @param {Object} coords - Coordinates {lat, lng}
     * @returns {Promise<void>}
     */
    async save(address, coords) {
        const cache = await this.load();
        const now = Date.now();

        cache[address.toLowerCase().trim()] = {
            coords,
            cachedAt: now,
            expiresAt: now + CONFIG.CACHE.TTL_MS
        };

        return new Promise((resolve) => {
            chrome.storage.local.set({ [CONFIG.CACHE.KEY]: cache }, resolve);
        });
    },

    /**
     * Clear all cached geocoding data
     * @returns {Promise<void>}
     */
    async clear() {
        return new Promise((resolve) => {
            chrome.storage.local.remove([CONFIG.CACHE.KEY], resolve);
        });
    },

    /**
     * Get cache statistics
     * @returns {Promise<Object>} Stats object with count, sizeKB, sizeBytes
     */
    async getStats() {
        const cache = await this.load();
        return new Promise((resolve) => {
            chrome.storage.local.getBytesInUse([CONFIG.CACHE.KEY], (bytes) => {
                resolve({
                    count: Object.keys(cache).length,
                    sizeKB: (bytes / 1024).toFixed(1),
                    sizeBytes: bytes
                });
            });
        });
    },

    /**
     * Clean expired entries and save back to storage
     * @returns {Promise<void>}
     */
    async cleanExpired() {
        console.log('Cleaning expired geocode cache...');
        const cache = await this.load(); // load() already filters expired entries

        return new Promise((resolve) => {
            chrome.storage.local.set({ [CONFIG.CACHE.KEY]: cache }, () => {
                console.log('Cache cleanup complete');

                // Log cache stats
                chrome.storage.local.getBytesInUse([CONFIG.CACHE.KEY], (bytes) => {
                    const kb = (bytes / 1024).toFixed(2);
                    const count = Object.keys(cache).length;
                    console.log(`Cache: ${count} addresses, ${kb} KB`);

                    if (bytes > CONFIG.CACHE.WARNING_SIZE_MB * 1024 * 1024) {
                        console.warn(`Cache size exceeds ${CONFIG.CACHE.WARNING_SIZE_MB}MB - consider clearing`);
                    }
                });

                resolve();
            });
        });
    }
};
