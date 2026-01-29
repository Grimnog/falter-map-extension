/**
 * Tests for dom-parser.js
 * Tests restaurant data extraction, pagination, and error handling
 */

import { parseRestaurantsFromDOM, getPaginationInfo } from '../modules/dom-parser.js';
import { assert, Fixtures, initializeTestRunner, finalizeTestRunner } from './test-utils.js';

async function runTests() {
    initializeTestRunner('DOM Parser Tests');

    // Test 1: Parse valid restaurant HTML
    assert.info('\n--- Test 1: Parse Valid Restaurants ---');

    const html = await Fixtures.loadHTML('sample-restaurants.html');
    const doc = Fixtures.createDOM(html);
    const restaurants = parseRestaurantsFromDOM(doc);

    assert.isTrue(restaurants.length >= 3, 'Should parse at least 3 valid restaurants');
    assert.exists(restaurants[0].id, 'Restaurant should have ID');
    assert.exists(restaurants[0].name, 'Restaurant should have name');
    assert.exists(restaurants[0].address, 'Restaurant should have address');
    assert.exists(restaurants[0].url, 'Restaurant should have URL');

    // Test 2: Verify restaurant data structure
    assert.info('\n--- Test 2: Verify Data Structure ---');

    const first = restaurants[0];
    assert.equals(first.id, '12345', 'ID should match');
    assert.equals(first.name, 'Test Restaurant One', 'Name should match');
    assert.isTrue(first.address.includes('1010'), 'Address should include district');
    assert.isTrue(first.address.includes('Teststraße'), 'Address should include street');
    assert.isTrue(first.url.includes('/lokal/12345/'), 'URL should be correct');

    // Test 3: Handle market stall addresses
    assert.info('\n--- Test 3: Market Stall Handling ---');

    const marketStall = restaurants.find(r => r.name === 'Market Stall');
    assert.exists(marketStall, 'Should find market stall restaurant');
    assert.isTrue(marketStall.address.includes('Karmelitermarkt'), 'Should preserve market name');

    // Test 4: Skip invalid entries
    assert.info('\n--- Test 4: Skip Invalid Entries ---');

    const invalid = restaurants.find(r => r.id === '99999');
    assert.equals(invalid, undefined, 'Should skip entries without valid address');

    // Test 5: Parse pagination info
    assert.info('\n--- Test 5: Pagination Parsing ---');

    // Create a temporary DOM with pagination
    const paginationHTML = `
        <html><body>
            <div>Seite 2 / 5</div>
        </body></html>
    `;
    const paginationDoc = Fixtures.createDOM(paginationHTML);

    // Temporarily replace document for pagination test
    const originalBody = document.body;
    document.body = paginationDoc.body;

    const pagination = getPaginationInfo();
    assert.equals(pagination.current, 2, 'Current page should be 2');
    assert.equals(pagination.total, 5, 'Total pages should be 5');

    // Restore original body
    document.body = originalBody;

    // Test 6: Handle uppercase pagination text
    assert.info('\n--- Test 6: Case-Insensitive Pagination ---');

    const uppercaseHTML = `
        <html><body>
            <div>SEITE 3 / 10</div>
        </body></html>
    `;
    const uppercaseDoc = Fixtures.createDOM(uppercaseHTML);
    document.body = uppercaseDoc.body;

    const uppercasePagination = getPaginationInfo();
    assert.equals(uppercasePagination.current, 3, 'Should parse uppercase SEITE');
    assert.equals(uppercasePagination.total, 10, 'Total should match');

    document.body = originalBody;

    // Test 7: Handle missing pagination
    assert.info('\n--- Test 7: Missing Pagination ---');

    const noPaginationHTML = `<html><body><div>No pagination here</div></body></html>`;
    const noPaginationDoc = Fixtures.createDOM(noPaginationHTML);
    document.body = noPaginationDoc.body;

    const noPagination = getPaginationInfo();
    assert.equals(noPagination.current, 1, 'Should default to page 1');
    assert.equals(noPagination.total, 1, 'Should default to 1 total page');

    document.body = originalBody;

    // Test 8: Extract all required fields
    assert.info('\n--- Test 8: Required Fields ---');

    restaurants.forEach((restaurant, index) => {
        assert.exists(restaurant.id, `Restaurant ${index} should have id`);
        assert.exists(restaurant.name, `Restaurant ${index} should have name`);
        assert.exists(restaurant.district, `Restaurant ${index} should have district`);
        assert.exists(restaurant.street, `Restaurant ${index} should have street`);
        assert.exists(restaurant.address, `Restaurant ${index} should have address`);
        assert.exists(restaurant.url, `Restaurant ${index} should have url`);
    });

    // Test 9: Handle empty results
    assert.info('\n--- Test 9: Empty Results ---');

    const emptyHTML = `<html><body><div id="entries"></div></body></html>`;
    const emptyDoc = Fixtures.createDOM(emptyHTML);
    const emptyResults = parseRestaurantsFromDOM(emptyDoc);

    assert.arrayLength(emptyResults, 0, 'Should return empty array for no results');

    finalizeTestRunner();
}

// Run tests when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTests);
} else {
    runTests();
}
