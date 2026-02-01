/**
 * Tests for url-utils.js
 * Tests URL parameter parsing for Bundesland detection
 */

import { getBundeslandFromURL } from '../modules/url-utils.js';
import { assert, initializeTestRunner, finalizeTestRunner } from './test-utils.js';

// Mock window.location
function mockLocation(search) {
    delete window.location;
    window.location = { search };
}

async function runTests() {
    initializeTestRunner('URL Utils Tests');

    // ===== Test 1: Valid Bundesland Names =====
    assert.info('\n--- Test 1: Valid Bundesland Names ---');

    mockLocation('?r=Wien');
    assert.equals(getBundeslandFromURL(), 'Wien', 'Should detect Wien');

    mockLocation('?r=Niederösterreich');
    assert.equals(getBundeslandFromURL(), 'Niederösterreich', 'Should detect Niederösterreich');

    mockLocation('?r=Oberösterreich');
    assert.equals(getBundeslandFromURL(), 'Oberösterreich', 'Should detect Oberösterreich');

    mockLocation('?r=Salzburg');
    assert.equals(getBundeslandFromURL(), 'Salzburg', 'Should detect Salzburg');

    mockLocation('?r=Tirol');
    assert.equals(getBundeslandFromURL(), 'Tirol', 'Should detect Tirol');

    mockLocation('?r=Vorarlberg');
    assert.equals(getBundeslandFromURL(), 'Vorarlberg', 'Should detect Vorarlberg');

    mockLocation('?r=Steiermark');
    assert.equals(getBundeslandFromURL(), 'Steiermark', 'Should detect Steiermark');

    mockLocation('?r=Kärnten');
    assert.equals(getBundeslandFromURL(), 'Kärnten', 'Should detect Kärnten');

    mockLocation('?r=Burgenland');
    assert.equals(getBundeslandFromURL(), 'Burgenland', 'Should detect Burgenland');

    // ===== Test 2: Case-Insensitive Matching =====
    assert.info('\n--- Test 2: Case-Insensitive Matching ---');

    mockLocation('?r=wien');
    assert.equals(getBundeslandFromURL(), 'Wien', 'Should normalize lowercase wien');

    mockLocation('?r=SALZBURG');
    assert.equals(getBundeslandFromURL(), 'Salzburg', 'Should normalize uppercase SALZBURG');

    mockLocation('?r=TiRoL');
    assert.equals(getBundeslandFromURL(), 'Tirol', 'Should normalize mixed case TiRoL');

    mockLocation('?r=niederösterreich');
    assert.equals(getBundeslandFromURL(), 'Niederösterreich', 'Should normalize lowercase niederösterreich');

    // ===== Test 3: URL Encoding =====
    assert.info('\n--- Test 3: URL Encoding ---');

    mockLocation('?r=Nieder%C3%B6sterreich');
    assert.equals(getBundeslandFromURL(), 'Niederösterreich', 'Should decode URL-encoded ö');

    mockLocation('?r=Ober%C3%B6sterreich');
    assert.equals(getBundeslandFromURL(), 'Oberösterreich', 'Should decode URL-encoded Oberösterreich');

    mockLocation('?r=K%C3%A4rnten');
    assert.equals(getBundeslandFromURL(), 'Kärnten', 'Should decode URL-encoded ä');

    // ===== Test 4: Edge Cases - Should Return Null =====
    assert.info('\n--- Test 4: Edge Cases (Should Return Null) ---');

    mockLocation('');
    assert.equals(getBundeslandFromURL(), null, 'Should return null for no search params');

    mockLocation('?r=');
    assert.equals(getBundeslandFromURL(), null, 'Should return null for empty r parameter');

    mockLocation('?r=%20%20');
    assert.equals(getBundeslandFromURL(), null, 'Should return null for whitespace-only parameter');

    mockLocation('?r=InvalidBundesland');
    assert.equals(getBundeslandFromURL(), null, 'Should return null for invalid Bundesland name');

    mockLocation('?r=Germany');
    assert.equals(getBundeslandFromURL(), null, 'Should return null for non-Austrian region');

    mockLocation('?r=Vienna');
    assert.equals(getBundeslandFromURL(), null, 'Should return null for English name (not German)');

    mockLocation('?other=Wien');
    assert.equals(getBundeslandFromURL(), null, 'Should return null if r parameter not present');

    // ===== Test 5: Multiple Parameters =====
    assert.info('\n--- Test 5: Multiple Parameters ---');

    mockLocation('?r=Salzburg&pc=4');
    assert.equals(getBundeslandFromURL(), 'Salzburg', 'Should extract r parameter with other params present');

    mockLocation('?pc=4&r=Tirol&sort=name');
    assert.equals(getBundeslandFromURL(), 'Tirol', 'Should extract r parameter from middle of query string');

    mockLocation('?search=test&r=Wien');
    assert.equals(getBundeslandFromURL(), 'Wien', 'Should extract r parameter with search param');

    // ===== Test 6: Whitespace Handling =====
    assert.info('\n--- Test 6: Whitespace Handling ---');

    mockLocation('?r=%20Wien%20');
    assert.equals(getBundeslandFromURL(), 'Wien', 'Should trim whitespace from parameter');

    mockLocation('?r=Wien%20');
    assert.equals(getBundeslandFromURL(), 'Wien', 'Should trim trailing whitespace');

    mockLocation('?r=%20Salzburg');
    assert.equals(getBundeslandFromURL(), 'Salzburg', 'Should trim leading whitespace');

    finalizeTestRunner();
}

// Run tests
runTests();
