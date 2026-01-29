/**
 * MapModal - Manages the restaurant map modal UI
 * Handles modal lifecycle, Leaflet map, markers, results list, and navigation
 */

import { CONFIG } from './constants.js';

export class MapModal {
    constructor(restaurants) {
        this.restaurants = restaurants;
        this.map = null;
        this.markers = [];
        this.modalElement = null;
        this.selectedRestaurantIndex = -1;
        this.navigableRestaurants = [];

        // Cached DOM references
        this.dom = {
            geocodeStatus: null,
            progressBar: null,
            progressText: null,
            statusNote: null,
            results: null
        };

        // Callbacks
        this.onRestaurantClickCallback = null;
        this.onMarkerClickCallback = null;
        this.onCloseCallback = null;

        // Bind methods for event listeners
        this.handleClose = this.handleClose.bind(this);
        this.handleKeyboardNavigation = this.handleKeyboardNavigation.bind(this);
        this.handleResultsClick = this.handleResultsClick.bind(this);
    }

    /**
     * Show the modal and initialize the map
     */
    show() {
        // Remove existing modal if any
        if (this.modalElement) {
            this.destroy();
        }

        // Create modal HTML
        this.modalElement = document.createElement('div');
        this.modalElement.id = 'falter-map-modal';
        this.modalElement.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close" title="Close">&times;</button>
                <div class="modal-body">
                    <aside class="modal-sidebar">
                        <div class="modal-header">
                            <h1>Falter Restaurant Map</h1>
                            <p id="modal-info">${this.restaurants.length} restaurants</p>
                        </div>
                        <div class="modal-status">
                            <div class="status-row">
                                <span class="status-label">Geocoding</span>
                                <span class="status-value" id="modal-geocode-status">Starting...</span>
                            </div>
                            <div class="progress-container">
                                <div class="progress-bar" id="progress-bar"></div>
                                <div class="progress-text" id="progress-text">0/0 located</div>
                            </div>
                            <div class="status-note" id="status-note" style="display: none;">Addresses are being located, this may take a moment...</div>
                        </div>
                        <div class="modal-results" id="modal-results"></div>
                    </aside>
                    <div class="modal-map-container">
                        <div id="modal-map"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.modalElement);

        // Cache DOM element references
        this.dom.geocodeStatus = document.getElementById('modal-geocode-status');
        this.dom.progressBar = document.getElementById('progress-bar');
        this.dom.progressText = document.getElementById('progress-text');
        this.dom.statusNote = document.getElementById('status-note');
        this.dom.results = document.getElementById('modal-results');

        // Attach event listeners
        this.modalElement.querySelector('.modal-close').addEventListener('click', this.handleClose);
        this.modalElement.querySelector('.modal-overlay').addEventListener('click', this.handleClose);
        this.dom.results.addEventListener('click', this.handleResultsClick);
        document.addEventListener('keydown', this.handleKeyboardNavigation);

        // Initialize map after a short delay
        setTimeout(() => {
            this.initializeMap();
        }, CONFIG.ANIMATION.MODAL_INIT_DELAY_MS);
    }

    /**
     * Hide the modal (alias for destroy)
     */
    hide() {
        this.destroy();
    }

    /**
     * Destroy the modal and clean up resources
     */
    destroy() {
        if (!this.modalElement) return;

        // Remove keyboard listener
        document.removeEventListener('keydown', this.handleKeyboardNavigation);

        // Clean up Leaflet map to prevent memory leaks (Gemini recommendation)
        if (this.map) {
            this.map.remove();
            this.map = null;
        }

        // Remove modal from DOM
        this.modalElement.remove();
        this.modalElement = null;

        // Reset state
        this.markers = [];
        this.selectedRestaurantIndex = -1;
        this.navigableRestaurants = [];

        // Clear cached DOM references
        this.dom.geocodeStatus = null;
        this.dom.progressBar = null;
        this.dom.progressText = null;
        this.dom.statusNote = null;
        this.dom.results = null;

        // Trigger close callback
        if (this.onCloseCallback) {
            this.onCloseCallback();
        }
    }

    /**
     * Initialize the Leaflet map
     */
    initializeMap() {
        this.map = L.map('modal-map').setView(CONFIG.MAP.DEFAULT_CENTER, CONFIG.MAP.DEFAULT_ZOOM);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);
    }

    /**
     * Update progress bar and status text
     */
    updateProgress(processed, total, located) {
        // Status shows located count (successful geocoding)
        if (this.dom.geocodeStatus) {
            this.dom.geocodeStatus.textContent = `${located}/${total} located`;
        }

        // Progress bar shows processed count (all attempts, including failures)
        if (this.dom.progressText) {
            if (processed === total) {
                this.dom.progressText.textContent = `Complete: ${located}/${total} located`;
            } else {
                this.dom.progressText.textContent = `Processing ${processed}/${total}...`;
            }
        }

        if (this.dom.progressBar) {
            const percentage = total > 0 ? (processed / total) * 100 : 0;
            this.dom.progressBar.style.width = `${percentage}%`;
        }
    }

    /**
     * Set status message and type
     */
    setStatus(message, type = 'info') {
        if (!this.dom.geocodeStatus) return;

        this.dom.geocodeStatus.textContent = message;
        this.dom.geocodeStatus.className = `status-value ${type}`;
    }

    /**
     * Add a marker to the map
     */
    addMarker(restaurant, index, isNew = false) {
        if (!this.map || !restaurant.coords) return;

        const googleMapsQuery = encodeURIComponent(`${restaurant.name}, ${restaurant.address}, Austria`);
        const marker = L.marker([restaurant.coords.lat, restaurant.coords.lng], {
            icon: this.createNumberedMarker(index + 1, isNew)
        })
            .addTo(this.map)
            .bindPopup(`
                <div class="popup-name">${this.escapeHtml(restaurant.name)}</div>
                <div class="popup-address">${this.escapeHtml(restaurant.address)}</div>
                <div class="popup-links">
                    <a href="${restaurant.url}" target="_blank">Falter</a>
                    <a href="https://www.google.com/maps/search/?api=1&query=${googleMapsQuery}" target="_blank">Google Maps</a>
                </div>
            `);

        marker.restaurantId = restaurant.id;

        // Add marker click handler to propagate to coordinator (Gemini refinement)
        marker.on('click', () => {
            if (this.onMarkerClickCallback) {
                this.onMarkerClickCallback(restaurant, index);
            }
        });

        this.markers.push(marker);

        // Add pulse animation for newly added markers
        if (isNew && marker._icon) {
            marker._icon.classList.add('marker-pulse');
            setTimeout(() => {
                if (marker._icon) marker._icon.classList.remove('marker-pulse');
            }, CONFIG.ANIMATION.MARKER_PULSE_MS);
        }

        return marker;
    }

    /**
     * Select a restaurant by index
     */
    selectRestaurant(index) {
        const items = document.querySelectorAll('#modal-results .result-item:not(.no-coords)');
        if (index < 0 || index >= items.length) return;

        this.selectedRestaurantIndex = index;

        // Update visual state
        items.forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
                item.setAttribute('aria-selected', 'true');
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                item.classList.remove('active');
                item.setAttribute('aria-selected', 'false');
            }
        });

        // Zoom map to selected restaurant
        const restaurant = this.navigableRestaurants[index];
        if (restaurant && restaurant.coords) {
            this.map.setView([restaurant.coords.lat, restaurant.coords.lng], CONFIG.MAP.SELECTED_ZOOM);
            const marker = this.markers.find(m => m.restaurantId === restaurant.id);
            if (marker) marker.openPopup();
        }
    }

    /**
     * Get the Leaflet map instance
     */
    getMap() {
        return this.map;
    }

    /**
     * Register callback for restaurant list clicks
     */
    onRestaurantClick(callback) {
        this.onRestaurantClickCallback = callback;
    }

    /**
     * Register callback for map marker clicks (Gemini refinement)
     */
    onMarkerClick(callback) {
        this.onMarkerClickCallback = callback;
    }

    /**
     * Register callback for modal close
     */
    onClose(callback) {
        this.onCloseCallback = callback;
    }

    /**
     * Update the results list with restaurants
     */
    updateResultsList(restaurantList) {
        if (!this.dom.results) return;

        // Show skeleton if list is empty (during initial load)
        if (restaurantList.length === 0) {
            this.dom.results.innerHTML = this.createLoadingSkeleton(8);
            return;
        }

        this.dom.results.innerHTML = '';

        // Reset navigable restaurants array
        this.navigableRestaurants = [];

        restaurantList.forEach((restaurant, index) => {
            const item = document.createElement('div');
            item.className = 'result-item' + (restaurant.coords ? '' : ' no-coords');

            // Add ARIA attributes
            if (restaurant.coords) {
                item.setAttribute('role', 'option');
                item.setAttribute('aria-selected', 'false');
                item.setAttribute('tabindex', '-1');
            }

            item.innerHTML = `
                <div class="result-number">${index + 1}</div>
                <div class="result-content">
                    <div class="result-name">${this.escapeHtml(restaurant.name)}</div>
                    <div class="result-address">${this.escapeHtml(restaurant.address)}</div>
                </div>
            `;

            if (restaurant.coords) {
                // Track for keyboard navigation
                this.navigableRestaurants.push(restaurant);
            }

            this.dom.results.appendChild(item);
        });

        // Add ARIA role to container
        this.dom.results.setAttribute('role', 'listbox');
        this.dom.results.setAttribute('aria-label', 'Restaurant list');
    }

    /**
     * Update map markers with restaurant list
     */
    updateMapMarkers(restaurantList, animate = false) {
        if (!this.map) return;

        // When animate=false, do a full refresh (remove all and recreate)
        if (!animate) {
            this.markers.forEach(m => this.map.removeLayer(m));
            this.markers = [];

            restaurantList.forEach((restaurant, index) => {
                if (!restaurant.coords) return;
                this.addMarker(restaurant, index, false);
            });

            if (this.markers.length > 0) {
                const group = L.featureGroup(this.markers);
                this.map.fitBounds(group.getBounds().pad(CONFIG.MAP.BOUNDS_PADDING));
            }
            return;
        }

        // When animate=true, only add NEW markers that don't exist yet
        const existingMarkerIds = new Set(this.markers.map(m => m.restaurantId));
        let staggerDelay = 0;

        restaurantList.forEach((restaurant, index) => {
            if (!restaurant.coords) return;

            // Skip if marker already exists
            if (existingMarkerIds.has(restaurant.id)) {
                return;
            }

            // Add new marker with staggered animation
            setTimeout(() => {
                this.addMarker(restaurant, index, true);
            }, staggerDelay);

            staggerDelay += CONFIG.ANIMATION.MARKER_STAGGER_MS;
        });
    }

    /**
     * Show loading status with note
     */
    showLoadingStatus() {
        if (this.dom.statusNote) this.dom.statusNote.style.display = 'block';
        if (this.dom.geocodeStatus) this.dom.geocodeStatus.classList.add('loading');
    }

    /**
     * Hide loading status
     */
    hideLoadingStatus() {
        if (this.dom.statusNote) this.dom.statusNote.style.display = 'none';
        if (this.dom.geocodeStatus) this.dom.geocodeStatus.classList.remove('loading');
    }

    // ===== Private Helper Methods =====

    /**
     * Handle modal close button/overlay click
     */
    handleClose() {
        this.destroy();
    }

    /**
     * Handle results list clicks (event delegation)
     */
    handleResultsClick(event) {
        // Find the clicked result item (handle clicks on child elements)
        const item = event.target.closest('.result-item');
        if (!item || item.classList.contains('no-coords')) return;

        // Clear active state from all items
        document.querySelectorAll('.result-item').forEach(el => {
            el.classList.remove('active');
            el.setAttribute('aria-selected', 'false');
        });

        // Set active state on clicked item
        item.classList.add('active');
        item.setAttribute('aria-selected', 'true');

        // Find the index among navigable items
        const navigableItems = Array.from(document.querySelectorAll('#modal-results .result-item:not(.no-coords)'));
        this.selectedRestaurantIndex = navigableItems.indexOf(item);

        // Get the corresponding restaurant
        const restaurant = this.navigableRestaurants[this.selectedRestaurantIndex];
        if (restaurant && restaurant.coords) {
            this.map.setView([restaurant.coords.lat, restaurant.coords.lng], CONFIG.MAP.SELECTED_ZOOM);

            const marker = this.markers.find(m => m.restaurantId === restaurant.id);
            if (marker) marker.openPopup();

            // Trigger callback
            if (this.onRestaurantClickCallback) {
                this.onRestaurantClickCallback(restaurant, this.selectedRestaurantIndex);
            }
        }
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyboardNavigation(event) {
        // Only process if modal is open
        if (!this.modalElement) return;

        // Handle help shortcut (works regardless of items)
        if (event.key === '?' || event.key === '/') {
            event.preventDefault();
            this.showKeyboardHelp();
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
            this.destroy();
            return;
        }

        // Navigation shortcuts need items
        const items = document.querySelectorAll('#modal-results .result-item:not(.no-coords)');
        if (items.length === 0) return;

        switch(event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.navigateRestaurants(1, items);
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.navigateRestaurants(-1, items);
                break;
        }
    }

    /**
     * Navigate through restaurants with arrow keys
     */
    navigateRestaurants(direction, items) {
        // Initialize or update index with wrap-around
        if (this.selectedRestaurantIndex === -1) {
            this.selectedRestaurantIndex = direction > 0 ? 0 : items.length - 1;
        } else {
            this.selectedRestaurantIndex = (this.selectedRestaurantIndex + direction + items.length) % items.length;
        }

        // Update visual state and scroll
        items.forEach((item, index) => {
            if (index === this.selectedRestaurantIndex) {
                item.classList.add('active');
                item.setAttribute('aria-selected', 'true');
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                item.classList.remove('active');
                item.setAttribute('aria-selected', 'false');
            }
        });

        // Zoom map to selected restaurant
        const restaurant = this.navigableRestaurants[this.selectedRestaurantIndex];
        if (restaurant && restaurant.coords) {
            this.map.setView([restaurant.coords.lat, restaurant.coords.lng], CONFIG.MAP.SELECTED_ZOOM);
            const marker = this.markers.find(m => m.restaurantId === restaurant.id);
            if (marker) marker.openPopup();
        }
    }

    /**
     * Show keyboard shortcuts help overlay
     */
    showKeyboardHelp() {
        // Check if help is already visible
        if (document.getElementById('keyboard-help-overlay')) return;

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

        this.modalElement.appendChild(helpOverlay);

        // Close help on any key press
        const closeHelp = () => {
            helpOverlay.remove();
            document.removeEventListener('keydown', closeHelp);
        };
        setTimeout(() => document.addEventListener('keydown', closeHelp), 100);
    }

    /**
     * Create numbered marker icon
     */
    createNumberedMarker(number, isNew = false) {
        const pinClass = isNew ? 'marker-pin marker-new' : 'marker-pin';
        return L.divIcon({
            className: 'custom-marker',
            html: `<div class="${pinClass}">
                <div class="marker-number">${number}</div>
            </div>`,
            iconSize: [40, 50],
            iconAnchor: [20, 46],
            popupAnchor: [0, -48]
        });
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Create loading skeleton HTML
     */
    createLoadingSkeleton(count = 5) {
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
                <div class="skeleton-item">
                    <div class="skeleton skeleton-number"></div>
                    <div class="skeleton-content">
                        <div class="skeleton skeleton-title"></div>
                        <div class="skeleton skeleton-subtitle"></div>
                    </div>
                </div>
            `;
        }
        return html;
    }
}
