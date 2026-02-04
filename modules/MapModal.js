/**
 * MapModal - Manages the restaurant map modal UI
 * Handles modal lifecycle, Leaflet map, markers, results list, and navigation
 */

import { CONFIG } from './constants.js';
import { ErrorHandler } from './error-handler.js';
import { getBundeslandFromURL } from './url-utils.js';

export class MapModal {
    constructor(restaurants, estimatedTotal = null) {
        this.restaurants = restaurants;
        this.estimatedTotal = estimatedTotal; // Total results before limiting
        this.currentRestaurants = []; // Track current list with coords
        this.map = null;
        this.markers = [];
        this.markerClusterGroup = null; // Cluster group for markers
        this.modalElement = null;
        this.triggerElement = null; // Store trigger for focus restoration
        this.hiddenElements = []; // Track elements hidden from screen readers
        this.hasStartedGeocoding = false; // Track if geocoding has started
        this.isProgressComplete = false; // Track if completion message was shown

        // Cached DOM references
        this.dom = {
            statusLabel: null,
            geocodeStatus: null,
            results: null,
            statusSubtitle: null,
            progressBar: null,
            progressFill: null
        };

        // Callbacks
        this.onRestaurantClickCallback = null;
        this.onMarkerClickCallback = null;
        this.onCloseCallback = null;

        // Bind methods for event listeners
        this.handleClose = this.handleClose.bind(this);
        this.handleResultsClick = this.handleResultsClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    /**
     * Show the modal and initialize the map
     * @param {HTMLElement} triggerElement - The element that triggered the modal (for focus restoration)
     */
    show(triggerElement = null) {
        // Store trigger element for focus restoration
        this.triggerElement = triggerElement;

        // Remove existing modal if any
        if (this.modalElement) {
            this.destroy();
        }

        // Create modal HTML
        this.modalElement = document.createElement('div');
        this.modalElement.id = 'falter-map-modal';
        this.modalElement.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-info">
                <button class="modal-close" title="Close" aria-label="Close restaurant map">&times;</button>
                <div class="modal-body">
                    <aside class="modal-sidebar">
                        <div class="modal-header">
                            <h1 id="modal-title"><span class="falter-brand">Falter</span> Restaurant Map</h1>
                            <p class="modal-subtitle" id="modal-status-subtitle" aria-live="polite">Restaurants werden gesucht...</p>
                        </div>
                        <div class="modal-progress-bar" id="modal-progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
                            <div class="progress-fill" id="modal-progress-fill"></div>
                        </div>
                        <div class="modal-results" id="modal-results" role="listbox" aria-label="Restaurant list"></div>
                    </aside>
                    <div class="modal-map-container">
                        <div id="modal-map" aria-label="Interactive map showing restaurant locations"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.modalElement);

        // Cache DOM element references
        this.dom.statusLabel = document.getElementById('modal-status-label');
        this.dom.geocodeStatus = document.getElementById('modal-geocode-status');
        this.dom.results = document.getElementById('modal-results');
        this.dom.statusSubtitle = document.getElementById('modal-status-subtitle');
        this.dom.progressBar = document.getElementById('modal-progress-bar');
        this.dom.progressFill = document.getElementById('modal-progress-fill');

        // Attach event listeners
        this.modalElement.querySelector('.modal-close').addEventListener('click', this.handleClose);
        this.modalElement.querySelector('.modal-overlay').addEventListener('click', this.handleClose);
        this.dom.results.addEventListener('click', this.handleResultsClick);

        // Add keyboard event listener for focus trap
        document.addEventListener('keydown', this.handleKeyDown);

        // Hide background content from screen readers
        this.hideBackgroundFromScreenReaders();

        // Move focus to modal content for accessibility
        const modalContent = this.modalElement.querySelector('.modal-content');
        if (modalContent) {
            modalContent.setAttribute('tabindex', '-1');
            modalContent.focus();
        }

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

        // Remove keyboard event listener
        document.removeEventListener('keydown', this.handleKeyDown);

        // Restore background content for screen readers
        this.restoreBackgroundForScreenReaders();

        // Restore focus to trigger element
        if (this.triggerElement && typeof this.triggerElement.focus === 'function') {
            this.triggerElement.focus();
        }

        // Clean up Leaflet map to prevent memory leaks (Gemini recommendation)
        if (this.map) {
            // Clean up cluster group first
            if (this.markerClusterGroup) {
                this.markerClusterGroup.clearLayers();
                this.map.removeLayer(this.markerClusterGroup);
                this.markerClusterGroup = null;
            }
            this.map.remove();
            this.map = null;
        }

        // Remove modal from DOM
        this.modalElement.remove();
        this.modalElement = null;

        // Reset state
        this.markers = [];
        this.triggerElement = null;
        this.hasStartedGeocoding = false;
        this.isProgressComplete = false;

        // Clear cached DOM references
        this.dom.statusLabel = null;
        this.dom.geocodeStatus = null;
        this.dom.results = null;
        this.dom.statusSubtitle = null;
        this.dom.progressBar = null;
        this.dom.progressFill = null;

        // Trigger close callback
        if (this.onCloseCallback) {
            this.onCloseCallback();
        }
    }

    /**
     * Initialize the Leaflet map
     * Dynamically centers map based on Bundesland from URL parameter ?r=
     * Falls back to Wien if no parameter or invalid Bundesland
     * Uses state-level zoom (9) for Bundesländer, city-level zoom (13) for Wien
     */
    initializeMap() {
        try {
            // Detect Bundesland from URL and get appropriate center coordinates
            const bundesland = getBundeslandFromURL();
            const initialCenter = bundesland && CONFIG.BUNDESLAND_CENTERS[bundesland]
                ? CONFIG.BUNDESLAND_CENTERS[bundesland]
                : CONFIG.MAP.DEFAULT_CENTER;

            // Use wider zoom for Bundesländer (restaurants spread across region)
            // Wien uses city-level zoom (restaurants clustered in one city)
            const initialZoom = bundesland && bundesland !== 'Wien'
                ? 9  // State-level zoom: shows ~1/3 to 1/2 of Bundesland
                : CONFIG.MAP.DEFAULT_ZOOM;  // City-level zoom (13) for Wien

            console.log('Map initialization:', bundesland ? `${bundesland} center, zoom ${initialZoom}` : `Wien default (no ?r= parameter), zoom ${initialZoom}`);

            this.map = L.map('modal-map', {
                zoomControl: false // Disable default top-left position
            }).setView(initialCenter, initialZoom);

            // Add zoom control to bottom-right
            L.control.zoom({
                position: 'bottomright'
            }).addTo(this.map);

            // Add tile layer with OSM attribution
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Geocoding via <a href="https://nominatim.org">Nominatim</a>',
                maxZoom: 19
            }).addTo(this.map);

            // Add custom result limiting info as HTML element if applicable
            if (this.estimatedTotal && this.estimatedTotal > this.restaurants.length) {
                const customInfo = document.createElement('div');
                customInfo.className = 'custom-map-attribution';
                customInfo.innerHTML = `<strong>${this.restaurants.length} von ${this.estimatedTotal} angezeigt (Limit) · Mit Filter eingrenzen</strong>`;

                // Add to map container
                const mapContainer = document.getElementById('modal-map');
                if (mapContainer) {
                    mapContainer.appendChild(customInfo);
                }
            }

            // Create marker cluster group
            this.markerClusterGroup = L.markerClusterGroup({
                maxClusterRadius: CONFIG.MAP.CLUSTER.MAX_RADIUS,
                spiderfyOnMaxZoom: CONFIG.MAP.CLUSTER.SPIDERFY,
                disableClusteringAtZoom: CONFIG.MAP.CLUSTER.DISABLE_AT_ZOOM,
                showCoverageOnHover: CONFIG.MAP.CLUSTER.SHOW_COVERAGE,
                animateAddingMarkers: true
            });
            this.map.addLayer(this.markerClusterGroup);
        } catch (error) {
            console.error('Map initialization error:', error);
            ErrorHandler.showMapError();
            // Still allow modal to function without map
        }
    }

    /**
     * Update progress bar and status text
     * @param {boolean} isFinal - True if this is the final call after geocoding completes
     */
    updateProgress(processed, total, located, isFinal = false) {
        // Update progress bar width
        if (this.dom.progressFill && this.dom.progressBar) {
            const percentage = total > 0 ? (processed / total) * 100 : 0;
            this.dom.progressFill.style.width = `${percentage}%`;
            this.dom.progressBar.setAttribute('aria-valuenow', Math.round(percentage));
        }

        // Update subtitle text
        if (this.dom.statusSubtitle) {
            if (processed < total) {
                // Geocoding in progress
                this.hasStartedGeocoding = true;
                this.dom.statusSubtitle.textContent = 'Restaurants werden gesucht...';
            } else if (isFinal && !this.isProgressComplete) {
                // Show completion with checkmark (for both fresh geocoding and cached data)
                this.isProgressComplete = true;
                this.dom.statusSubtitle.innerHTML = `<span class="status-checkmark">✓</span> ${located} ${located === 1 ? 'Restaurant' : 'Restaurants'} gefunden`;

                // Fade out progress bar after completion
                if (this.dom.progressBar) {
                    setTimeout(() => {
                        this.dom.progressBar.style.opacity = '0';
                    }, 500);
                }
            }
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
            .addTo(this.markerClusterGroup)
            .bindPopup(`
                <a href="${restaurant.url}" target="_blank" rel="noopener noreferrer" class="falter-popup-link">${this.escapeHtml(restaurant.name)}</a>
                <div class="falter-popup-address">${this.escapeHtml(restaurant.address)}</div>
                <a href="https://www.google.com/maps/search/?api=1&query=${googleMapsQuery}" target="_blank" rel="noopener noreferrer" class="falter-maps-link">Auf Google Maps ansehen</a>
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
     * Select a restaurant by index (called by Navigation module)
     */
    selectRestaurant(index, restaurant) {
        const items = document.querySelectorAll('#modal-results .result-item:not(.no-coords)');
        if (index < 0 || index >= items.length) return;

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
     * Get the marker cluster group
     */
    getMarkerClusterGroup() {
        return this.markerClusterGroup;
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

        // Store current restaurant list for click handling
        this.currentRestaurants = restaurantList;

        // Show skeleton if list is empty (during initial load)
        if (restaurantList.length === 0) {
            this.dom.results.innerHTML = this.createLoadingSkeleton(8);
            return;
        }

        this.dom.results.innerHTML = '';

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

            this.dom.results.appendChild(item);
        });

        // Add ARIA role to container and make it tab-focusable
        this.dom.results.setAttribute('role', 'listbox');
        this.dom.results.setAttribute('aria-label', 'Restaurant list');
        this.dom.results.setAttribute('tabindex', '0');
    }

    /**
     * Update map markers with restaurant list
     */
    updateMapMarkers(restaurantList, animate = false) {
        if (!this.map) return;

        // When animate=false, do a full refresh (remove all and recreate)
        if (!animate) {
            // Clear cluster group
            if (this.markerClusterGroup) {
                this.markerClusterGroup.clearLayers();
            }
            this.markers = [];

            restaurantList.forEach((restaurant, index) => {
                if (!restaurant.coords) return;
                this.addMarker(restaurant, index, false);
            });

            // Fit bounds to cluster group
            if (this.markers.length > 0 && this.markerClusterGroup) {
                const bounds = this.markerClusterGroup.getBounds();
                if (bounds.isValid()) {
                    this.map.fitBounds(bounds.pad(CONFIG.MAP.BOUNDS_PADDING));
                }
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
     * Show loading status
     */
    showLoadingStatus() {
        if (this.dom.geocodeStatus) this.dom.geocodeStatus.classList.add('loading');
    }

    /**
     * Hide loading status and mark as complete
     */
    hideLoadingStatus() {
        if (this.dom.geocodeStatus) this.dom.geocodeStatus.classList.remove('loading');
        if (this.dom.statusLabel) this.dom.statusLabel.textContent = 'Suche abgeschlossen';
    }

    /**
     * Show geocoding error status
     */
    showGeocodingError(message = 'Geokodierung fehlgeschlagen') {
        if (this.dom.statusSubtitle) {
            this.dom.statusSubtitle.innerHTML = `<span class="status-error">✗</span> ${message}`;
        }
        if (this.dom.progressBar) {
            this.dom.progressBar.style.display = 'none';
        }
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
     * Coordinator (content.js) will sync with Navigation module
     */
    handleResultsClick(event) {
        // Find the clicked result item (handle clicks on child elements)
        const item = event.target.closest('.result-item');
        if (!item || item.classList.contains('no-coords')) return;

        // Find the index among all items and navigable items
        const allItems = Array.from(document.querySelectorAll('#modal-results .result-item'));
        const navigableItems = Array.from(document.querySelectorAll('#modal-results .result-item:not(.no-coords)'));
        const allIndex = allItems.indexOf(item);
        const navigableIndex = navigableItems.indexOf(item);

        // Get the corresponding restaurant from current list
        const restaurant = this.currentRestaurants[allIndex];

        if (restaurant && restaurant.coords) {
            // Clear active state from all items
            document.querySelectorAll('.result-item').forEach(el => {
                el.classList.remove('active');
                el.setAttribute('aria-selected', 'false');
            });

            // Set active state on clicked item
            item.classList.add('active');
            item.setAttribute('aria-selected', 'true');

            // Zoom map to restaurant
            this.map.setView([restaurant.coords.lat, restaurant.coords.lng], CONFIG.MAP.SELECTED_ZOOM);

            const marker = this.markers.find(m => m.restaurantId === restaurant.id);
            if (marker) marker.openPopup();

            // Trigger callback with navigable index
            if (this.onRestaurantClickCallback) {
                this.onRestaurantClickCallback(restaurant, navigableIndex);
            }
        }
    }

    /**
     * Handle keyboard events for focus trap
     */
    handleKeyDown(event) {
        // Only handle Tab key for focus trap
        if (event.key !== 'Tab') return;

        if (!this.modalElement) return;

        // Get all focusable elements within the modal
        const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusableElements = this.modalElement.querySelectorAll(focusableSelector);
        const focusableArray = Array.from(focusableElements);

        if (focusableArray.length === 0) return;

        const firstFocusable = focusableArray[0];
        const lastFocusable = focusableArray[focusableArray.length - 1];

        // Shift+Tab: moving backwards
        if (event.shiftKey) {
            if (document.activeElement === firstFocusable) {
                event.preventDefault();
                lastFocusable.focus();
            }
        }
        // Tab: moving forwards
        else {
            if (document.activeElement === lastFocusable) {
                event.preventDefault();
                firstFocusable.focus();
            }
        }
    }

    /**
     * Hide background content from screen readers
     */
    hideBackgroundFromScreenReaders() {
        // Hide all direct children of body except our modal
        const bodyChildren = Array.from(document.body.children);
        bodyChildren.forEach(element => {
            if (element !== this.modalElement && !element.hasAttribute('aria-hidden')) {
                element.setAttribute('aria-hidden', 'true');
                this.hiddenElements.push(element);
            }
        });
    }

    /**
     * Restore background content for screen readers
     */
    restoreBackgroundForScreenReaders() {
        // Remove aria-hidden from elements we added it to
        this.hiddenElements.forEach(element => {
            element.removeAttribute('aria-hidden');
        });
        this.hiddenElements = [];
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
