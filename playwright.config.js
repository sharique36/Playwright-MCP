const { devices } = require('@playwright/test');

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
    testDir: './tests',
    timeout: 30000,
    retries: 1,
    //reporter: [['list'], ['html', { outputFolder: 'reports', open: 'never' }]],
    reporter: [
        ['html'],
        ['allure-playwright']
    ],
    use: {
        baseURL: 'https://www.saucedemo.com/',
        headless: process.env.HEADLESS !== 'false',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'on-first-retry',
        viewport: null, // maximize window
        launchOptions: {
            args: ['--start-maximized']
        }
    },
    // All browsers are defined below. By default, Playwright runs all projects, but you can run a single browser using:
    // npx playwright test --project=chromium
    // npx playwright test --project=firefox
    // npx playwright test --project=webkit
    projects: [
        {
            name: 'chromium',
            use: {
                viewport: null,
                launchOptions: { args: ['--start-maximized'] }
            },
        },
        {
            name: 'firefox',
            use: {
                viewport: null,
                launchOptions: { args: ['--start-maximized'] }
            },
        },
        {
            name: 'webkit',
            use: {
                viewport: null,
                launchOptions: { args: ['--start-maximized'] }
            },
        },
    ],
};

module.exports = config;
