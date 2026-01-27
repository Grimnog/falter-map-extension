// Popup script for Falter Map Extension
console.log('=== POPUP SCRIPT LOADED ===');

// Load cached geocode data
async function loadGeocodeCache() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['geocodeCache'], (result) => {
            const cache = result.geocodeCache || {};
            const now = Date.now();
            const validCache = {};

            // Filter out expired entries and migrate old format
            for (const [address, data] of Object.entries(cache)) {
                // Handle old format (no expiresAt) - migrate it
                if (!data.expiresAt) {
                    // Old format: { lat, lng }
                    validCache[address] = {
                        coords: data,
                        cachedAt: now,
                        expiresAt: now + (30 * 24 * 60 * 60 * 1000) // 30 days
                    };
                } else if (data.expiresAt > now) {
                    // New format and not expired
                    validCache[address] = data;
                }
                // Skip expired entries (implicit cleanup)
            }

            resolve(validCache);
        });
    });
}

// Update cache statistics display
async function updateCacheStats() {
    const cache = await loadGeocodeCache();
    const count = Object.keys(cache).length;

    chrome.storage.local.getBytesInUse(['geocodeCache'], (bytes) => {
        const kb = (bytes / 1024).toFixed(1);

        const cacheCountEl = document.getElementById('cacheCount');
        const cacheSizeEl = document.getElementById('cacheSize');

        if (cacheCountEl) {
            cacheCountEl.textContent = count;
        }

        if (cacheSizeEl) {
            cacheSizeEl.textContent = `${kb} KB`;
        }
    });
}

// Clear geocoding cache
async function clearCache() {
    const confirmed = confirm(
        'Clear all cached geocoding data?\n\n' +
        'You can rebuild the cache by using the extension on Falter.at.'
    );

    if (confirmed) {
        chrome.storage.local.remove(['geocodeCache'], () => {
            console.log('Cache cleared');
            updateCacheStats();
            alert('Cache cleared successfully!');
        });
    }
}

// Initialize
function init() {
    console.log('Popup: Initializing...');

    // Update cache stats
    updateCacheStats();

    // Setup clear cache button
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', clearCache);
    }
}

// Start
document.addEventListener('DOMContentLoaded', init);
