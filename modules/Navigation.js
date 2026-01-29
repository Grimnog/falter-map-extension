/**
 * Navigation - Manages keyboard navigation for the map modal
 * Handles arrow keys, ESC, help overlay, and navigation state
 */

import { CONFIG } from './constants.js';

export class Navigation {
    constructor(restaurants, mapModal) {
        this.restaurants = restaurants;
        this.mapModal = mapModal;
        this.selectedIndex = -1;
        this.navigableRestaurants = [];
        this.enabled = false;

        // Callbacks
        this.onNavigateCallback = null;
        this.onCloseCallback = null;

        // Bind methods for event listeners
        this.handleKeydown = this.handleKeydown.bind(this);
    }

    /**
     * Enable keyboard navigation
     */
    enable() {
        if (this.enabled) return;
        this.enabled = true;
        document.addEventListener('keydown', this.handleKeydown);
    }

    /**
     * Disable keyboard navigation
     */
    disable() {
        if (!this.enabled) return;
        this.enabled = false;
        document.removeEventListener('keydown', this.handleKeydown);
    }

    /**
     * Destroy and clean up
     */
    destroy() {
        this.disable();
        this.selectedIndex = -1;
        this.navigableRestaurants = [];
        this.onNavigateCallback = null;
        this.onCloseCallback = null;
    }

    /**
     * Navigate to next restaurant
     */
    selectNext() {
        const items = this.getNavigableItems();
        if (items.length === 0) return;

        this.navigate(1, items);
    }

    /**
     * Navigate to previous restaurant
     */
    selectPrevious() {
        const items = this.getNavigableItems();
        if (items.length === 0) return;

        this.navigate(-1, items);
    }

    /**
     * Get current selected index
     */
    getCurrentIndex() {
        return this.selectedIndex;
    }

    /**
     * Set selected index programmatically
     */
    setIndex(index) {
        const items = this.getNavigableItems();
        if (index < 0 || index >= items.length) return;

        this.selectedIndex = index;
        const restaurant = this.navigableRestaurants[index];
        this.mapModal.selectRestaurant(index, restaurant);

        if (this.onNavigateCallback) {
            this.onNavigateCallback(index, restaurant);
        }
    }

    /**
     * Toggle help overlay
     */
    toggleHelp() {
        const helpOverlay = document.getElementById('keyboard-help-overlay');
        if (helpOverlay) {
            helpOverlay.remove();
        } else {
            this.showKeyboardHelp();
        }
    }

    /**
     * Register callback for navigation events
     */
    onNavigate(callback) {
        this.onNavigateCallback = callback;
    }

    /**
     * Register callback for close events (ESC pressed)
     */
    onClose(callback) {
        this.onCloseCallback = callback;
    }

    /**
     * Update the list of navigable restaurants (called when results change)
     */
    updateNavigableRestaurants(restaurants) {
        this.navigableRestaurants = restaurants.filter(r => r.coords);
    }

    // ===== Private Helper Methods =====

    /**
     * Handle keyboard events
     */
    handleKeydown(event) {
        // Only process if enabled
        if (!this.enabled) return;

        // Handle help shortcut (works regardless of items)
        if (event.key === '?' || event.key === '/') {
            event.preventDefault();
            this.toggleHelp();
            return;
        }

        // Handle escape (works regardless of items)
        if (event.key === 'Escape') {
            event.preventDefault();
            // Close help overlay if visible
            const helpOverlay = document.getElementById('keyboard-help-overlay');
            if (helpOverlay) {
                helpOverlay.remove();
                return;
            }
            // Otherwise, trigger close callback
            if (this.onCloseCallback) {
                this.onCloseCallback();
            }
            return;
        }

        // Navigation shortcuts need items
        const items = this.getNavigableItems();
        if (items.length === 0) return;

        switch(event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.navigate(1, items);
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.navigate(-1, items);
                break;
        }
    }

    /**
     * Navigate through restaurants with arrow keys
     */
    navigate(direction, items) {
        // Initialize or update index with wrap-around
        if (this.selectedIndex === -1) {
            this.selectedIndex = direction > 0 ? 0 : items.length - 1;
        } else {
            this.selectedIndex = (this.selectedIndex + direction + items.length) % items.length;
        }

        // Update MapModal visual state
        const restaurant = this.navigableRestaurants[this.selectedIndex];
        this.mapModal.selectRestaurant(this.selectedIndex, restaurant);

        // Trigger navigation callback
        if (this.onNavigateCallback) {
            this.onNavigateCallback(this.selectedIndex, restaurant);
        }
    }

    /**
     * Get navigable items from DOM
     */
    getNavigableItems() {
        return document.querySelectorAll('#modal-results .result-item:not(.no-coords)');
    }

    /**
     * Show keyboard shortcuts help overlay
     */
    showKeyboardHelp() {
        // Check if help is already visible
        if (document.getElementById('keyboard-help-overlay')) return;

        // Get modal element
        const modalElement = document.getElementById('falter-map-modal');
        if (!modalElement) return;

        const helpOverlay = document.createElement('div');
        helpOverlay.id = 'keyboard-help-overlay';
        helpOverlay.innerHTML = `
            <div class="keyboard-help">
                <h3>⌨️ Keyboard Shortcuts</h3>
                <dl>
                    <dt><kbd>↑</kbd> <kbd>↓</kbd></dt>
                    <dd>Navigate restaurants</dd>
                    <dt><kbd>ESC</kbd></dt>
                    <dd>Close map</dd>
                    <dt><kbd>?</kbd></dt>
                    <dd>Show this help</dd>
                </dl>
                <p class="help-hint">Press any key to close</p>
            </div>
        `;

        modalElement.appendChild(helpOverlay);

        // Close help on any key press
        const closeHelp = () => {
            helpOverlay.remove();
            document.removeEventListener('keydown', closeHelp);
        };
        setTimeout(() => document.addEventListener('keydown', closeHelp), 100);
    }
}
