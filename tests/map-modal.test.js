/**
 * Tests for MapModal.js
 * Tests modal lifecycle, UI updates, and map integration
 */

import { MapModal } from '../modules/MapModal.js';
import { assert, MockLeaflet, AsyncHelpers, initializeTestRunner, finalizeTestRunner } from './test-utils.js';

// Install Leaflet mock
MockLeaflet.installLeafletMock();

async function runTests() {
    initializeTestRunner('MapModal Tests');

    const testRestaurants = [
        {
            id: '1',
            name: 'Test Restaurant One',
            address: '1010 Wien, Teststraße 1',
            coords: { lat: 48.2, lng: 16.3 },
            url: 'https://falter.at/lokal/1/'
        },
        {
            id: '2',
            name: 'Test Restaurant Two',
            address: '1020 Wien, Praterstraße 2',
            coords: { lat: 48.21, lng: 16.38 },
            url: 'https://falter.at/lokal/2/'
        },
        {
            id: '3',
            name: 'Failed Restaurant',
            address: '1030 Wien, Unknown 3',
            coords: null,
            url: 'https://falter.at/lokal/3/'
        }
    ];

    // Test 1: Modal creation
    assert.info('\n--- Test 1: Modal Creation ---');

    const modal = new MapModal(testRestaurants);
    assert.exists(modal, 'MapModal should be created');
    assert.equals(modal.restaurants.length, 3, 'Should store restaurants');

    // Test 2: Modal show
    assert.info('\n--- Test 2: Modal Show ---');

    modal.show();
    await AsyncHelpers.delay(100); // Wait for DOM

    const modalElement = document.getElementById('falter-map-modal');
    assert.exists(modalElement, 'Modal should be added to DOM');

    const mapContainer = document.getElementById('modal-map');
    assert.exists(mapContainer, 'Map container should exist');

    // Test 3: Update results list
    assert.info('\n--- Test 3: Update Results List ---');

    modal.updateResultsList(testRestaurants);
    await AsyncHelpers.delay(50);

    const resultItems = document.querySelectorAll('#modal-results .result-item');
    assert.equals(resultItems.length, 3, 'Should render all restaurant items');

    const noCoordItems = document.querySelectorAll('#modal-results .result-item.no-coords');
    assert.equals(noCoordItems.length, 1, 'Should mark restaurants without coords');

    // Test 4: Progress bar updates
    assert.info('\n--- Test 4: Progress Bar Updates ---');

    modal.updateProgress(2, 3, 2);
    await AsyncHelpers.delay(50);

    const progressBar = document.getElementById('progress-bar');
    assert.exists(progressBar, 'Progress bar should exist');

    const progressText = document.getElementById('progress-text');
    assert.exists(progressText, 'Progress text should exist');
    assert.isTrue(progressText.textContent.includes('2'), 'Progress should show current');
    assert.isTrue(progressText.textContent.includes('3'), 'Progress should show total');

    // Test 5: Status updates
    assert.info('\n--- Test 5: Status Updates ---');

    modal.setStatus('Test Status', 'info');
    await AsyncHelpers.delay(50);

    const statusElement = document.getElementById('modal-geocode-status');
    assert.exists(statusElement, 'Status element should exist');
    assert.equals(statusElement.textContent, 'Test Status', 'Status text should update');

    // Test 6: Marker addition (with mocked Leaflet)
    assert.info('\n--- Test 6: Marker Addition ---');

    modal.addMarker(testRestaurants[0], 0, false);
    assert.equals(modal.markers.length, 1, 'Should track added marker');

    modal.addMarker(testRestaurants[1], 1, true);
    assert.equals(modal.markers.length, 2, 'Should track multiple markers');

    // Test 7: Restaurant selection
    assert.info('\n--- Test 7: Restaurant Selection ---');

    modal.selectRestaurant(0, testRestaurants[0]);
    await AsyncHelpers.delay(50);

    const activeItems = document.querySelectorAll('#modal-results .result-item.active');
    assert.equals(activeItems.length, 1, 'Should mark one item as active');
    assert.equals(activeItems[0].getAttribute('aria-selected'), 'true', 'Should set ARIA selected');

    // Test 8: Loading/skeleton state
    assert.info('\n--- Test 8: Loading State ---');

    modal.updateResultsList([]);
    await AsyncHelpers.delay(50);

    const skeletonItems = document.querySelectorAll('#modal-results .skeleton-item');
    assert.isTrue(skeletonItems.length > 0, 'Should show skeleton for empty list');

    // Test 9: Loading status show/hide
    assert.info('\n--- Test 9: Loading Status ---');

    modal.showLoadingStatus();
    const statusNote = document.getElementById('status-note');
    assert.equals(statusNote.style.display, 'block', 'Status note should be visible');

    modal.hideLoadingStatus();
    assert.equals(statusNote.style.display, 'none', 'Status note should be hidden');

    // Test 10: Update map markers
    assert.info('\n--- Test 10: Update Map Markers ---');

    const locatedRestaurants = testRestaurants.filter(r => r.coords);
    modal.updateMapMarkers(locatedRestaurants, false);

    assert.equals(modal.markers.length, 2, 'Should create markers for located restaurants');

    // Test 11: Callbacks
    assert.info('\n--- Test 11: Callbacks ---');

    let restaurantClickCalled = false;
    let markerClickCalled = false;
    let closeCalled = false;

    modal.onRestaurantClick(() => { restaurantClickCalled = true; });
    modal.onMarkerClick(() => { markerClickCalled = true; });
    modal.onClose(() => { closeCalled = true; });

    // Trigger close to test callback
    modal.destroy();
    await AsyncHelpers.delay(50);

    assert.isTrue(closeCalled, 'Close callback should be called');
    assert.equals(document.getElementById('falter-map-modal'), null, 'Modal should be removed from DOM');

    // Test 12: Cleanup and memory leak prevention
    assert.info('\n--- Test 12: Cleanup ---');

    const modal2 = new MapModal(testRestaurants);
    modal2.show();
    await AsyncHelpers.delay(100);

    assert.exists(document.getElementById('falter-map-modal'), 'Modal should exist');

    modal2.destroy();
    await AsyncHelpers.delay(50);

    assert.equals(document.getElementById('falter-map-modal'), null, 'Modal should be removed');
    assert.equals(modal2.map, null, 'Map should be cleaned up');
    assert.arrayLength(modal2.markers, 0, 'Markers should be cleared');

    finalizeTestRunner();
}

// Run tests when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTests);
} else {
    runTests();
}
