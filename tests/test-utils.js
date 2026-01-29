/**
 * Test Utilities - Shared helpers for testing
 * Provides assertions, mocks, and fixtures
 */

// ===== Assertion Library =====

export const assert = {
    /**
     * Assert that a condition is true
     */
    isTrue(condition, message) {
        if (condition) {
            this.pass(message);
            return true;
        } else {
            this.fail(message);
            return false;
        }
    },

    /**
     * Assert that a condition is false
     */
    isFalse(condition, message) {
        return this.isTrue(!condition, message);
    },

    /**
     * Assert that two values are equal
     */
    equals(actual, expected, message) {
        if (actual === expected) {
            this.pass(message);
            return true;
        } else {
            this.fail(`${message} | Expected: ${expected}, Got: ${actual}`);
            return false;
        }
    },

    /**
     * Assert that two objects are deeply equal
     */
    deepEquals(actual, expected, message) {
        const match = JSON.stringify(actual) === JSON.stringify(expected);
        if (match) {
            this.pass(message);
            return true;
        } else {
            this.fail(`${message} | Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)}`);
            return false;
        }
    },

    /**
     * Assert that a value is not null/undefined
     */
    exists(value, message) {
        if (value !== null && value !== undefined) {
            this.pass(message);
            return true;
        } else {
            this.fail(message);
            return false;
        }
    },

    /**
     * Assert that an array has a specific length
     */
    arrayLength(array, expectedLength, message) {
        if (Array.isArray(array) && array.length === expectedLength) {
            this.pass(message);
            return true;
        } else {
            this.fail(`${message} | Expected length: ${expectedLength}, Got: ${array?.length || 'not an array'}`);
            return false;
        }
    },

    /**
     * Assert that a value is within a range
     */
    inRange(value, min, max, message) {
        if (value >= min && value <= max) {
            this.pass(message);
            return true;
        } else {
            this.fail(`${message} | Expected ${value} to be between ${min} and ${max}`);
            return false;
        }
    },

    /**
     * Log a passing test
     */
    pass(message) {
        console.log(`%c✅ Pass: ${message}`, 'color: green');
        if (window.testResults) {
            window.testResults.pass++;
            this.logToUI(message, 'pass');
        }
    },

    /**
     * Log a failing test
     */
    fail(message) {
        console.error(`%c❌ Fail: ${message}`, 'color: red');
        if (window.testResults) {
            window.testResults.fail++;
            this.logToUI(message, 'fail');
        }
    },

    /**
     * Log informational message
     */
    info(message) {
        console.log(`%cℹ️ ${message}`, 'color: blue');
        if (window.testResults) {
            this.logToUI(message, 'info');
        }
    },

    /**
     * Log to UI output div
     */
    logToUI(message, className) {
        const output = document.getElementById('output');
        if (output) {
            const div = document.createElement('div');
            div.className = className;
            div.textContent = message;
            output.appendChild(div);
        }
    }
};

// ===== Mock Chrome APIs =====

export const MockChrome = {
    /**
     * Create a mock chrome.storage.local
     */
    createStorageMock() {
        const storage = {};
        return {
            get: (keys, callback) => {
                if (typeof keys === 'string') {
                    callback({ [keys]: storage[keys] });
                } else if (Array.isArray(keys)) {
                    const result = {};
                    keys.forEach(key => {
                        result[key] = storage[key];
                    });
                    callback(result);
                } else {
                    callback(storage);
                }
            },
            set: (items, callback) => {
                Object.assign(storage, items);
                if (callback) callback();
            },
            remove: (keys, callback) => {
                if (typeof keys === 'string') {
                    delete storage[keys];
                } else if (Array.isArray(keys)) {
                    keys.forEach(key => delete storage[key]);
                }
                if (callback) callback();
            },
            clear: (callback) => {
                Object.keys(storage).forEach(key => delete storage[key]);
                if (callback) callback();
            },
            getBytesInUse: (keys, callback) => {
                // Mock implementation - estimate size in bytes
                let data;
                if (!keys) {
                    data = storage;
                } else if (typeof keys === 'string') {
                    data = { [keys]: storage[keys] };
                } else if (Array.isArray(keys)) {
                    data = {};
                    keys.forEach(key => {
                        if (storage[key] !== undefined) {
                            data[key] = storage[key];
                        }
                    });
                }
                const sizeInBytes = JSON.stringify(data).length;
                if (callback) callback(sizeInBytes);
                return Promise.resolve(sizeInBytes);
            },
            _getStorage: () => storage // For testing
        };
    },

    /**
     * Install chrome.storage.local mock
     */
    installStorageMock() {
        if (!window.chrome) window.chrome = {};
        if (!window.chrome.storage) window.chrome.storage = {};
        window.chrome.storage.local = this.createStorageMock();
        return window.chrome.storage.local;
    }
};

// ===== Mock Leaflet =====

export const MockLeaflet = {
    /**
     * Create a mock Leaflet map
     */
    createMapMock() {
        const markers = [];
        const mockMap = {
            setView: function(center, zoom) { return this; },
            fitBounds: function(bounds) { return this; },
            remove: function() {},
            removeLayer: function(marker) {
                const index = markers.indexOf(marker);
                if (index > -1) markers.splice(index, 1);
            },
            addMarker: function(marker) {
                markers.push(marker);
                return this;
            },
            getMarkers: () => markers
        };
        return mockMap;
    },

    /**
     * Create a mock Leaflet marker
     */
    createMarkerMock(latLng, options = {}) {
        const marker = {
            _latlng: latLng,
            options: options,
            popup: null,
            restaurantId: options.restaurantId,
            _icon: null,
            addTo: function(map) {
                if (map && map.addMarker) {
                    map.addMarker(this);
                }
                return this;
            },
            bindPopup: function(content) {
                this.popup = content;
                return this;
            },
            openPopup: function() {},
            on: function(event, callback) {
                this[`_${event}Handler`] = callback;
                return this;
            }
        };
        return marker;
    },

    /**
     * Install minimal Leaflet mock
     */
    installLeafletMock() {
        if (!window.L) {
            window.L = {
                map: (id) => this.createMapMock(),
                marker: (latLng, options) => this.createMarkerMock(latLng, options),
                tileLayer: (url, options) => ({
                    addTo: function(map) { return this; }
                }),
                featureGroup: (markers) => ({
                    getBounds: () => ({
                        pad: () => ({ isValid: () => true })
                    })
                }),
                divIcon: (options) => options // Return options as icon mock
            };
        }
        return window.L;
    }
};

// ===== Async Test Helpers =====

export const AsyncHelpers = {
    /**
     * Wait for a condition to be true
     */
    async waitFor(condition, timeout = 5000, interval = 100) {
        const startTime = Date.now();
        while (!condition()) {
            if (Date.now() - startTime > timeout) {
                throw new Error('waitFor timeout');
            }
            await this.delay(interval);
        }
    },

    /**
     * Delay execution
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// ===== Fixture Helpers =====

export const Fixtures = {
    /**
     * Load HTML fixture from fixtures directory
     * Uses XMLHttpRequest to avoid fetch mocking issues
     */
    async loadHTML(filename) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `./fixtures/${filename}`, true);
            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                } else {
                    reject(new Error(`Failed to load fixture: ${filename}`));
                }
            };
            xhr.onerror = () => reject(new Error(`Network error loading fixture: ${filename}`));
            xhr.send();
        });
    },

    /**
     * Create a DOM from HTML string
     */
    createDOM(html) {
        const parser = new DOMParser();
        return parser.parseFromString(html, 'text/html');
    }
};

// ===== Test Runner Helpers =====

export function initializeTestRunner(testName) {
    // Initialize test results tracking
    window.testResults = {
        name: testName,
        pass: 0,
        fail: 0,
        startTime: Date.now()
    };

    // Get suite name from global (set by test runner)
    const suiteName = window.currentSuiteName || 'Test';

    console.log(`\n========== ${suiteName}: ${testName} ==========`);
}

export function finalizeTestRunner() {
    const results = window.testResults;
    const duration = Date.now() - results.startTime;
    const total = results.pass + results.fail;
    const passRate = total > 0 ? ((results.pass / total) * 100).toFixed(1) : 0;
    const suiteName = window.currentSuiteName || 'Test';

    const summary = `\n${suiteName} Summary: ${results.pass}/${total} passed (${passRate}%) in ${duration}ms\n`;
    console.log(summary);

    const output = document.getElementById('output');
    if (output) {
        const summaryDiv = document.createElement('div');
        summaryDiv.className = results.fail === 0 ? 'summary' : 'summary fail';
        summaryDiv.innerHTML = `
            <strong>${suiteName} Summary:</strong> ${results.pass}/${total} passed (${passRate}%) in ${duration}ms
        `;
        output.appendChild(summaryDiv);
    }

    // Dispatch event to signal test completion
    window.dispatchEvent(new CustomEvent('testComplete', {
        detail: { results: results }
    }));

    return results;
}
