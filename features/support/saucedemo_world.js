const { setWorldConstructor, setDefaultTimeout, World } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

class SauceDemoWorld extends World {
  async launchBrowser() {
    const headless = process.env.HEADLESS !== 'false';
    this.browser = await chromium.launch({ headless });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }
  async closeBrowser() {
    if (this.browser) await this.browser.close();
  }
}

setWorldConstructor(SauceDemoWorld);
setDefaultTimeout(60 * 1000);

const { Before, After } = require('@cucumber/cucumber');

Before(async function () {
  await this.launchBrowser();
});

After(async function () {
  await this.closeBrowser();
});
