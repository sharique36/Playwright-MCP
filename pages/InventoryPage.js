
const locators = require('../selectors/locators.json').InventoryPage;

class InventoryPage {
  async removeProductFromCartByName(name) {
    const products = await this.page.$$('.inventory_item');
    for (const product of products) {
      const title = await product.$eval(locators.productTitles, el => el.textContent);
      if (title === name) {
        // Find the remove button inside this product card
        const removeBtn = await product.$('button[data-test^="remove"]');
        if (removeBtn) {
          await removeBtn.click();
        }
        break;
      }
    }
  }
  constructor(page) {
    this.page = page;
    this.productTitles = page.locator(locators.productTitles);
    this.addToCartButtons = page.locator(locators.addToCartButtons);
    this.cartIcon = page.locator(locators.cartIcon);
  }

  async getProductTitles() {
    return this.productTitles.allTextContents();
  }

  async addProductToCartByName(name) {
    const products = await this.page.$$('.inventory_item');
    for (const product of products) {
      const title = await product.$eval(locators.productTitles, el => el.textContent);
      if (title === name) {
        await product.$eval(locators.addToCartButtons, btn => btn.click());
        break;
      }
    }
  }

  async getProductPriceByName(name) {
    const products = await this.page.$$('.inventory_item');
    for (const product of products) {
      const title = await product.$eval(locators.productTitles, el => el.textContent);
      if (title === name) {
        const price = await product.$eval('.inventory_item_price', el => el.textContent.trim());
        return price;
      }
    }
    return null;
  }

  async goToCart() {
    await this.cartIcon.click();
  }
}

module.exports = { InventoryPage };
