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

    // ===== NEW TESTS FOR AUSTRIA-WIDE ADDRESS PATTERNS =====

    // Test 10: Multi-Word City Names
    assert.info('\n--- Test 10: Multi-Word City Names ---');

    const multiWordHTML = `
        <html><body>
            <a class="group block" href="/lokal/11111/">
                <h2>Test Restaurant Purbach</h2>
                <div>7083 Purbach am Neusiedler See, Hauptgasse 64</div>
            </a>
            <a class="group block" href="/lokal/22222/">
                <h2>Test Restaurant Weiden</h2>
                <div>7121 Weiden am See, Seestraße 1</div>
            </a>
            <a class="group block" href="/lokal/33333/">
                <h2>Test Restaurant Schützen</h2>
                <div>7081 Schützen am Gebirge, Hauptstraße 33</div>
            </a>
        </body></html>
    `;
    const multiWordDoc = Fixtures.createDOM(multiWordHTML);
    const multiWordResults = parseRestaurantsFromDOM(multiWordDoc);

    assert.arrayLength(multiWordResults, 3, 'Should parse all multi-word city addresses');
    assert.equals(multiWordResults[0].city, 'Purbach am Neusiedler See', 'Should parse full city name with spaces');
    assert.equals(multiWordResults[1].city, 'Weiden am See', 'Should parse city with "am See"');
    assert.equals(multiWordResults[2].city, 'Schützen am Gebirge', 'Should parse city with "am Gebirge"');
    assert.isTrue(multiWordResults[0].address.includes('Purbach am Neusiedler See'), 'Address should include full city name');

    // Test 11: Hyphenated City Names
    assert.info('\n--- Test 11: Hyphenated City Names ---');

    const hyphenatedHTML = `
        <html><body>
            <a class="group block" href="/lokal/44444/">
                <h2>Ratschens Restaurant</h2>
                <div>7474 Deutsch Schützen-Eisenberg, Am Ratschen 5</div>
            </a>
        </body></html>
    `;
    const hyphenatedDoc = Fixtures.createDOM(hyphenatedHTML);
    const hyphenatedResults = parseRestaurantsFromDOM(hyphenatedDoc);

    assert.arrayLength(hyphenatedResults, 1, 'Should parse hyphenated city name');
    assert.equals(hyphenatedResults[0].city, 'Deutsch Schützen-Eisenberg', 'Should parse full hyphenated city');
    assert.isTrue(hyphenatedResults[0].address.includes('Deutsch Schützen-Eisenberg'), 'Address should include hyphenated city');

    // Test 12: Addresses Without Street Numbers
    assert.info('\n--- Test 12: Addresses Without Street Numbers ---');

    const noNumberHTML = `
        <html><body>
            <a class="group block" href="/lokal/55555/">
                <h2>Restaurant Zur Blauen Gans</h2>
                <div>7121 Weiden am See, (Göschl Tourismusprojekte – Seepark)</div>
            </a>
        </body></html>
    `;
    const noNumberDoc = Fixtures.createDOM(noNumberHTML);
    const noNumberResults = parseRestaurantsFromDOM(noNumberDoc);

    assert.arrayLength(noNumberResults, 1, 'Should parse address without street number');
    assert.equals(noNumberResults[0].city, 'Weiden am See', 'Should parse city correctly');
    assert.isTrue(noNumberResults[0].street.includes('Göschl'), 'Should include location descriptor');
    assert.isTrue(noNumberResults[0].street.includes('Seepark'), 'Should include full descriptor');

    // Test 13: Em-Dash in Address
    assert.info('\n--- Test 13: Em-Dash in Street/Location ---');

    const emDashHTML = `
        <html><body>
            <a class="group block" href="/lokal/66666/">
                <h2>Test Restaurant</h2>
                <div>1010 Wien, Tourismusprojekte – Seepark 5</div>
            </a>
        </body></html>
    `;
    const emDashDoc = Fixtures.createDOM(emDashHTML);
    const emDashResults = parseRestaurantsFromDOM(emDashDoc);

    assert.arrayLength(emDashResults, 1, 'Should parse address with em-dash');
    assert.isTrue(emDashResults[0].street.includes('–'), 'Should preserve em-dash in street');

    // Test 14: All Austrian Bundesländer ZIP Codes
    assert.info('\n--- Test 14: Bundesland ZIP Code Patterns ---');

    const bundeslandHTML = `
        <html><body>
            <a class="group block" href="/lokal/70001/">
                <h2>Wien Restaurant</h2>
                <div>1010 Wien, Stephansplatz 1</div>
            </a>
            <a class="group block" href="/lokal/70002/">
                <h2>NÖ Restaurant</h2>
                <div>3100 St. Pölten, Rathausplatz 1</div>
            </a>
            <a class="group block" href="/lokal/70003/">
                <h2>OÖ Restaurant</h2>
                <div>4020 Linz, Hauptplatz 1</div>
            </a>
            <a class="group block" href="/lokal/70004/">
                <h2>Salzburg Restaurant</h2>
                <div>5020 Salzburg, Getreidegasse 9</div>
            </a>
            <a class="group block" href="/lokal/70005/">
                <h2>Tirol Restaurant</h2>
                <div>6020 Innsbruck, Maria-Theresien-Straße 1</div>
            </a>
            <a class="group block" href="/lokal/70006/">
                <h2>Vorarlberg Restaurant</h2>
                <div>6900 Bregenz, Kornmarktplatz 1</div>
            </a>
            <a class="group block" href="/lokal/70007/">
                <h2>Steiermark Restaurant</h2>
                <div>8010 Graz, Hauptplatz 1</div>
            </a>
            <a class="group block" href="/lokal/70008/">
                <h2>Kärnten Restaurant</h2>
                <div>9020 Klagenfurt, Neuer Platz 1</div>
            </a>
            <a class="group block" href="/lokal/70009/">
                <h2>Burgenland Restaurant</h2>
                <div>7000 Eisenstadt, Hauptstraße 1</div>
            </a>
        </body></html>
    `;
    const bundeslandDoc = Fixtures.createDOM(bundeslandHTML);
    const bundeslandResults = parseRestaurantsFromDOM(bundeslandDoc);

    assert.arrayLength(bundeslandResults, 9, 'Should parse addresses from all 9 Bundesländer');
    assert.equals(bundeslandResults[0].zip, '1010', 'Wien ZIP should be parsed');
    assert.equals(bundeslandResults[1].zip, '3100', 'NÖ ZIP should be parsed');
    assert.equals(bundeslandResults[2].zip, '4020', 'OÖ ZIP should be parsed');
    assert.equals(bundeslandResults[3].zip, '5020', 'Salzburg ZIP should be parsed');
    assert.equals(bundeslandResults[4].zip, '6020', 'Tirol ZIP should be parsed');
    assert.equals(bundeslandResults[5].zip, '6900', 'Vorarlberg ZIP should be parsed');
    assert.equals(bundeslandResults[6].zip, '8010', 'Steiermark ZIP should be parsed');
    assert.equals(bundeslandResults[7].zip, '9020', 'Kärnten ZIP should be parsed');
    assert.equals(bundeslandResults[8].zip, '7000', 'Burgenland ZIP should be parsed');

    // Test 15: Complex Address with Status Text
    assert.info('\n--- Test 15: Address with Following Status Text ---');

    const statusTextHTML = `
        <html><body>
            <a class="group block" href="/lokal/77777/">
                <h2>Test Restaurant</h2>
                <div>7121 Weiden am See, Hauptstraße 10</div>
                <div>derzeit geschlossen</div>
            </a>
        </body></html>
    `;
    const statusTextDoc = Fixtures.createDOM(statusTextHTML);
    const statusTextResults = parseRestaurantsFromDOM(statusTextDoc);

    assert.arrayLength(statusTextResults, 1, 'Should parse address with following status text');
    assert.equals(statusTextResults[0].city, 'Weiden am See', 'Should not include status text in city');
    assert.isFalse(statusTextResults[0].street.includes('geschlossen'), 'Should not include status in street');

    finalizeTestRunner();
}

// Run tests when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTests);
} else {
    runTests();
}
