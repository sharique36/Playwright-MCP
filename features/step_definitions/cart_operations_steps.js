const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { locators } = require('../../config');

When('the user adds the first product to the cart', async function () {
  const firstProduct = await this.page.textContent(locators.InventoryPage.productTitles);
  const productSelector = `xpath=//div[text()='${firstProduct}']/ancestor::div[contains(@class,'inventory_item')]//button[contains(@data-test,'add-to-cart')]`;
  await this.page.click(productSelector);
  await this.page.click(locators.InventoryPage.cartIcon);
});

When('the user removes the first product from the cart', async function () {
  const firstProduct = await this.page.textContent(locators.InventoryPage.productTitles);
  const removeSelector = `xpath=//div[text()='${firstProduct}']/ancestor::div[contains(@class,'cart_item')]//button[contains(@data-test,'remove')]`;
  await this.page.click(removeSelector);
});

Then('the cart should be empty', async function () {
  const cartItems = await this.page.$$(locators.CartPage.cartItems);
  expect(cartItems.length).toBe(0);
});

Then('the filter dropdown should have the following options:', async function (dataTable) {
  // Assume the filter dropdown is the only select element on the page
  const options = await this.page.$$eval('select', selectEls => {
    const opts = Array.from(selectEls[0].options).map(o => o.textContent.trim());
    return opts;
  });
  const expected = dataTable.raw().map(row => row[0]);
  expect(options).toEqual(expected);
});
