const locators = require('../selectors/locators.json').CartPage;

class CartPage {
  constructor(page) {
    this.page = page;
    this.cartItems = page.locator(locators.cartItems);
    this.checkoutButton = page.locator(locators.checkoutButton);
    this.removeButtons = page.locator(locators.removeButtons);
  }

  async getCartItems() {
    return this.cartItems.allTextContents();
  }

  async removeItemByName(name) {
    const items = await this.page.$$(locators.cartItems);
    for (const item of items) {
      const title = await item.$eval('.inventory_item_name', el => el.textContent);
      if (title === name) {
        await item.$eval(locators.removeButtons, btn => btn.click());
        break;
      }
    }
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}

module.exports = { CartPage };
