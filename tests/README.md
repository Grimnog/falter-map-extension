# Test Suite Documentation

Comprehensive test suite for the Falter Map Extension covering all critical modules.

## 🚀 Quick Start

### Running Tests

1. Load the extension as an unpacked extension in `chrome://extensions/`
2. Find your extension ID (e.g., `abcdefghijklmnopqrstuvwxyz123456`)
3. Navigate to: `chrome-extension://YOUR_EXTENSION_ID/tests/test-runner.html`
4. Click **"Run All Tests"** or run individual test suites
5. Open the browser console (F12) for detailed output

### What Gets Tested

| Test Suite | File | Coverage |
|------------|------|----------|
| **Cache Manager** | `cache-utils.test.js` | Caching, TTL migration, storage operations |
| **Geocoder** | `geocoder.test.js` | Address geocoding, API rate limiting, batch processing |
| **DOM Parser** | `dom-parser.test.js` | Restaurant extraction, pagination, HTML parsing |
| **Map Modal** | `map-modal.test.js` | Modal lifecycle, UI updates, Leaflet integration |

---

## 📊 Test Coverage Target

**Goal:** 80% line coverage for all critical modules

Current test suites cover:
- ✅ Core service modules (geocoder, cache, parser)
- ✅ UI components (MapModal)
- ✅ Error handling paths
- ✅ Edge cases and boundary conditions

---

## 🛠️ Test Architecture

### Test Utilities (`test-utils.js`)

Provides shared helpers for all test suites:

**Assertions:**
- `assert.isTrue(condition, message)`
- `assert.equals(actual, expected, message)`
- `assert.deepEquals(obj1, obj2, message)`
- `assert.exists(value, message)`
- `assert.arrayLength(array, length, message)`
- `assert.inRange(value, min, max, message)`

**Mocks:**
- `MockChrome.installStorageMock()` - Mock chrome.storage.local
- `MockLeaflet.installLeafletMock()` - Mock Leaflet map library

**Async Helpers:**
- `AsyncHelpers.waitFor(condition, timeout)` - Wait for condition
- `AsyncHelpers.delay(ms)` - Delay execution

**Fixtures:**
- `Fixtures.loadHTML(filename)` - Load HTML fixture
- `Fixtures.createDOM(html)` - Create DOM from HTML string

---

## 📝 Test Suite Details

### Cache Manager Tests (`cache-utils.test.js`)

Tests the caching system that stores geocoded addresses.

**Scenarios:**
- Load empty cache
- Save and retrieve entries
- Overwrite existing entries
- TTL migration from old format
- Expired entry filtering
- Cache statistics
- Clear all entries

**Key Tests:**
- Verifies 30-day TTL enforcement
- Ensures cache keys are normalized (lowercase, trimmed)
- Validates old format migration

### Geocoder Tests (`geocoder.test.js`)

Tests address geocoding with the Nominatim API.

**Scenarios:**
- Address variation generation for Vienna addresses
- Market stall address handling (e.g., "Stand 65")
- Failed geocoding (returns null)
- Network error handling
- Rate limiting detection (429 status)
- Batch geocoding with cache hits
- Cache persistence after geocoding

**Key Tests:**
- Verifies multiple address format attempts
- Ensures rate limit respecting (1 req/sec)
- Tests progress callback functionality

### DOM Parser Tests (`dom-parser.test.js`)

Tests extraction of restaurant data from Falter HTML pages.

**Scenarios:**
- Parse valid restaurant entries
- Extract all required fields (name, address, district, URL)
- Handle market stall addresses
- Skip invalid entries (missing address)
- Parse pagination info (case-insensitive)
- Handle missing pagination
- Empty results list

**Key Tests:**
- Validates data structure completeness
- Tests pagination regex (supports "Seite" and "SEITE")
- Ensures duplicate filtering

### Map Modal Tests (`map-modal.test.js`)

Tests the modal UI component and Leaflet integration.

**Scenarios:**
- Modal creation and DOM injection
- Show/hide functionality
- Results list rendering
- Progress bar updates
- Status message updates
- Marker addition and tracking
- Restaurant selection
- Loading/skeleton state
- Callback system
- Cleanup and memory leak prevention

**Key Tests:**
- Verifies proper DOM manipulation
- Ensures markers are tracked correctly
- Tests cleanup prevents memory leaks
- Validates ARIA attributes for accessibility

---

## 🔧 Adding New Tests

### 1. Create Test File

```javascript
import { assert, initializeTestRunner, finalizeTestRunner } from './test-utils.js';

async function runTests() {
    initializeTestRunner('My Test Suite');

    assert.info('\n--- Test 1: Description ---');
    // Your test logic
    assert.isTrue(condition, 'Test description');

    finalizeTestRunner();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTests);
} else {
    runTests();
}
```

### 2. Add to Test Runner

Edit `test-runner.html` and add your test to the grid:

```html
<div class="test-suite-card">
    <h3>📦 My Module</h3>
    <p>Tests my module functionality.</p>
    <button onclick="runTest('my-module.test.js')">Run Tests</button>
</div>
```

### 3. Update Test Files Array

Add to the `testFiles` array in `test-runner.html`:

```javascript
const testFiles = [
    'cache-utils.test.js',
    'geocoder.test.js',
    'dom-parser.test.js',
    'map-modal.test.js',
    'my-module.test.js'  // Add here
];
```

---

## 🐛 Debugging Failed Tests

### Check Console Output

Open DevTools Console (F12) for detailed logs:
- ✅ Green messages = passing tests
- ❌ Red messages = failing tests
- ℹ️ Blue messages = informational

### Common Issues

**Test fails to load:**
- Check that the extension is loaded as unpacked
- Verify the extension ID in the URL is correct
- Ensure test file exists in `tests/` directory

**Assertion failures:**
- Check expected vs. actual values in error message
- Verify test fixtures are correct
- Ensure mocks are properly installed

**Async timing issues:**
- Use `AsyncHelpers.delay()` to wait for DOM updates
- Use `AsyncHelpers.waitFor()` for condition-based waiting
- Increase timeouts if needed

---

## 📈 Test Results Interpretation

### Pass Rate

- **100%** - All tests passing ✅
- **90-99%** - Mostly passing, review failures
- **<90%** - Significant issues, investigate

### Performance

- Tests should complete in <5 seconds total
- Individual test suites should run in <2 seconds
- Slow tests may indicate real performance issues

---

## 🔄 Continuous Testing

### When to Run Tests

- ✅ Before every commit (per "Test Before Commit" workflow)
- ✅ After refactoring any module
- ✅ When fixing bugs
- ✅ When adding new features

### Test-Driven Development

For new features:
1. Write failing test first
2. Implement feature to pass test
3. Refactor with confidence

For bug fixes:
1. Write test that reproduces bug
2. Fix bug
3. Verify test passes

---

## 🤝 Contributing Tests

### General Principle

**Always think about tests when implementing changes.** Every code change should have you asking: "What tests do I need to add or update?"

### When to Write Tests

| Change Type | Test Requirement | Example |
|------------|------------------|---------|
| **New Feature** | ✅ Required | Adding a new function to `cache-utils.js` → Add tests for all code paths |
| **Bug Fix** | ✅ Required | Pagination parsing fails → Add test that reproduces the bug, then fix |
| **Refactoring** | ✅ Verify existing | Extracting shared logic → Ensure all existing tests still pass |
| **Edge Case** | ✅ Required | User reports geocoding fails for "1010 Wien" → Add test for this specific case |
| **Performance** | ⚠️ Optional | Optimizing cache lookup → Add benchmark test if measurable |
| **Documentation** | ❌ Not needed | Updating README.md → No tests required |
| **Configuration** | ❌ Not needed | Updating .gitignore → No tests required |

### Coverage Targets

Aim for these minimum coverage levels:

- **Critical modules** (cache-utils, geocoder, dom-parser, map-modal): **80%+ line coverage**
- **Utility modules**: **70%+ coverage**
- **UI components**: Test all user interactions and state changes

### Writing Quality Tests

**Good tests are:**
- ✅ **Descriptive:** Test names clearly explain what is being tested
- ✅ **Isolated:** Each test is independent and can run alone
- ✅ **Fast:** Tests complete quickly (most under 100ms)
- ✅ **Focused:** One test per logical scenario
- ✅ **Readable:** Easy to understand what is being verified

**Example of a good test:**
```javascript
// Test 3: Handle market stall addresses
assert.info('\n--- Test 3: Market Stall Handling ---');
const marketAddress = '1020 Wien, Karmelitermarkt Stand 65';
const result = await geocodeAddress(marketAddress);
assert.exists(result, 'Should geocode market stall address');
assert.inRange(result.lat, 48.0, 49.0, 'Latitude should be in Vienna range');
```

**Example of a bad test:**
```javascript
// Test everything
const result = doStuff();
assert.isTrue(result); // What does this test?
```

### Test Organization

Follow these conventions:

1. **File naming:** `{module-name}.test.js` (e.g., `cache-utils.test.js`)
2. **Test grouping:** Use clear section headers with `assert.info()`
3. **Test numbering:** Number tests sequentially: `Test 1:`, `Test 2:`, etc.
4. **Async handling:** Always use `async/await` for async operations
5. **Setup/teardown:** Use `initializeTestRunner()` and `finalizeTestRunner()`

### Contributing Workflow

1. **Before implementing:**
   - Ask: "What scenarios need testing?"
   - Identify edge cases upfront

2. **While implementing:**
   - Write tests alongside code (not after)
   - Run tests frequently to catch issues early

3. **Before committing:**
   - Run full test suite (`test-runner.html`)
   - Verify 100% pass rate
   - Check console for warnings

4. **In commit message:**
   - Mention if tests were added (e.g., `test: add market stall address handling`)

### Common Testing Patterns

**Testing async operations:**
```javascript
const result = await someAsyncFunction();
assert.exists(result, 'Should return a result');
```

**Testing error handling:**
```javascript
const result = await functionThatMightFail();
assert.equals(result, null, 'Should return null on error');
```

**Using mocks:**
```javascript
MockChrome.installStorageMock();
// Now chrome.storage.local is mocked
```

**Testing DOM updates:**
```javascript
await AsyncHelpers.delay(100); // Wait for DOM update
const element = document.querySelector('.my-class');
assert.exists(element, 'Element should be rendered');
```

### Questions to Ask Yourself

Before marking your work complete, ask:

- [ ] Did I write tests for all new functions?
- [ ] Did I add tests for edge cases I discovered?
- [ ] Do all existing tests still pass?
- [ ] Are my test names clear and descriptive?
- [ ] Did I test error/failure scenarios?
- [ ] Is my test coverage at or above the target?

---

## 📚 Additional Resources

- **Engineering Guide:** `docs/CLAUDE.md`
- **Implementation Plan:** `docs/IMPLEMENTATION.md`
- **Architecture Analysis:** `docs/REFACTORING_ANALYSIS.md`

---

**Last Updated:** 2026-01-29
**Test Framework:** Custom HTML-based test runner
**Coverage Target:** 80% line coverage
