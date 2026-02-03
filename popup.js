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
    const btn = document.getElementById('clearCacheBtn');
    const btnText = document.getElementById('btnText');

    if (!btn || !btnText) return;

    // Store original state
    const originalText = btnText.textContent;

    try {
        // Clear cache
        await CacheManager.clear();
        console.log('Cache cleared');

        // Update stats
        await updateCacheStats();

        // Success state - green button with checkmark
        btn.classList.add('success');
        btnText.textContent = 'GELEERT ✓';

        // Restore after 2 seconds
        setTimeout(() => {
            btn.classList.remove('success');
            btnText.textContent = originalText;
        }, 2000);

    } catch (error) {
        console.error('Cache clear error:', error);

        // Error state - red button
        btn.classList.add('error');
        btnText.textContent = 'FEHLER';

        // Restore after 2 seconds
        setTimeout(() => {
            btn.classList.remove('error');
            btnText.textContent = originalText;
        }, 2000);
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
