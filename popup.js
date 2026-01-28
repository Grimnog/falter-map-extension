// Popup script for Falter Map Extension
import { CacheManager } from './modules/cache-utils.js';

console.log('=== POPUP SCRIPT LOADED ===');

// Update cache statistics display
async function updateCacheStats() {
    const stats = await CacheManager.getStats();

    const cacheCountEl = document.getElementById('cacheCount');
    const cacheSizeEl = document.getElementById('cacheSize');

    if (cacheCountEl) {
        cacheCountEl.textContent = stats.count;
    }

    if (cacheSizeEl) {
        cacheSizeEl.textContent = `${stats.sizeKB} KB`;
    }
}

// Clear geocoding cache
async function clearCache() {
    const confirmed = confirm(
        'Clear all cached geocoding data?\n\n' +
        'You can rebuild the cache by using the extension on Falter.at.'
    );

    if (confirmed) {
        await CacheManager.clear();
        console.log('Cache cleared');
        updateCacheStats();
        alert('Cache cleared successfully!');
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
