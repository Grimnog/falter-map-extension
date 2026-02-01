// Simple test runner - just runs all tests sequentially
const output = document.getElementById('output');
const runBtn = document.getElementById('run-btn');
const copyBtn = document.getElementById('copy-btn');

const testSuites = [
    { name: 'URL Utils', file: 'url-utils.test.js' },
    { name: 'Cache Manager', file: 'cache-utils.test.js' },
    { name: 'Geocoder', file: 'geocoder.test.js' },
    { name: 'DOM Parser', file: 'dom-parser.test.js' },
    { name: 'Map Modal', file: 'map-modal.test.js' }
];

let totalPass = 0;
let totalFail = 0;
let startTime = 0;

function log(message, className = '') {
    const div = document.createElement('div');
    div.className = className;
    div.textContent = message;
    output.appendChild(div);
    console.log(message);
}

function logSuiteHeader(suiteName) {
    const div = document.createElement('div');
    div.className = 'suite-header';
    div.textContent = `\n=== ${suiteName} Tests ===`;
    output.appendChild(div);
}

async function runAllTests() {
    // Disable button and clear output
    runBtn.disabled = true;
    output.innerHTML = '';
    totalPass = 0;
    totalFail = 0;
    startTime = Date.now();

    log('Starting test suite...', 'info');

    // Run each test suite sequentially
    for (const suite of testSuites) {
        logSuiteHeader(suite.name);

        // Wait for test to complete
        await new Promise((resolve) => {
            // Set current suite name globally so tests can use it
            window.currentSuiteName = suite.name;

            // Load the test script with cache-busting to allow re-runs
            const script = document.createElement('script');
            script.type = 'module';
            script.src = `./${suite.file}?t=${Date.now()}`;

            let timeoutId;
            let completed = false;

            // Wait for test completion event
            const handler = (event) => {
                if (completed) return;
                completed = true;

                if (event.detail && event.detail.results) {
                    totalPass += event.detail.results.pass || 0;
                    totalFail += event.detail.results.fail || 0;
                }

                clearTimeout(timeoutId);
                window.removeEventListener('testComplete', handler);
                script.remove();
                resolve();
            };

            window.addEventListener('testComplete', handler);

            // Fallback timeout in case event doesn't fire
            timeoutId = setTimeout(() => {
                if (completed) return;
                completed = true;

                window.removeEventListener('testComplete', handler);
                log(`⚠️ Warning: ${suite.name} test timed out after 15 seconds`, 'fail');
                script.remove();
                resolve();
            }, 15000); // 15 second timeout per suite

            document.body.appendChild(script);
        });
    }

    // Show final summary
    const duration = Date.now() - startTime;
    const total = totalPass + totalFail;
    const passRate = total > 0 ? ((totalPass / total) * 100).toFixed(1) : 0;

    const summary = document.createElement('div');
    summary.className = totalFail === 0 ? 'summary' : 'summary fail';
    summary.textContent = `\n=== FINAL RESULTS ===\n` +
                         `Total: ${total} | Pass: ${totalPass} | Fail: ${totalFail} | ` +
                         `Pass Rate: ${passRate}% | Duration: ${duration}ms | Suites: ${testSuites.length}`;
    output.appendChild(summary);

    log(`\n✅ Test run complete!`, 'info');

    // Re-enable buttons
    runBtn.disabled = false;
    copyBtn.style.display = 'inline-block';
}

function copyResults() {
    const text = output.innerText;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy results to clipboard');
    });
}

// Initialize
runBtn.addEventListener('click', runAllTests);
copyBtn.addEventListener('click', copyResults);
