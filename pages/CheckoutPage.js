
const locators = require('../selectors/locators.json').CheckoutPage;

class CheckoutPage {
  constructor(page) {
    this.page = page;
    this.firstNameInput = page.locator(locators.firstNameInput);
    this.lastNameInput = page.locator(locators.lastNameInput);
    this.postalCodeInput = page.locator(locators.postalCodeInput);
    this.continueButton = page.locator(locators.continueButton);
    this.finishButton = page.locator(locators.finishButton);
    this.summaryContainer = page.locator(locators.summaryContainer);
    this.completeHeader = page.locator(locators.completeHeader);
  }

  async fillInformation(first, last, postal) {
    await this.firstNameInput.fill(first);
    await this.lastNameInput.fill(last);
    await this.postalCodeInput.fill(postal);
    await this.continueButton.click();
  }

  async finishCheckout() {
    await this.finishButton.click();
  }

  async getSummary() {
    return this.summaryContainer.textContent();
  }

  async getCompleteHeader() {
    return this.completeHeader.textContent();
  }

  async getProductPriceByName(name) {
    // Wait for at least one cart item to be visible
    await this.page.waitForSelector(locators.cartItems, { state: 'visible', timeout: 5000 });
    const items = await this.page.$$(locators.cartItems);
    for (const item of items) {
      const title = (await item.$eval(locators.itemName, el => el.textContent)).trim();
      if (title === name.trim()) {
        const price = await item.$eval(locators.itemPrice, el => el.textContent.trim());
        return price;
      }
    }
    return null;
  }
}

module.exports = { CheckoutPage };
