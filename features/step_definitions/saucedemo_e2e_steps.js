const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { locators } = require('../../config');
const config = require('../../playwright.config');
const baseURL = config.use.baseURL;

Given('the user navigates to the SauceDemo login page', async function () {
  await this.page.goto(baseURL);
});

When('the user logs in with username {string} and password {string}', async function (username, password) {
  await this.page.fill(locators.LoginPage.usernameInput, username);
  await this.page.fill(locators.LoginPage.passwordInput, password);
  await this.page.click(locators.LoginPage.loginButton);
});

When('the user adds all products to the cart', async function () {
  const products = await this.page.$$eval(locators.InventoryPage.productTitles, els => els.map(e => e.textContent));
  for (const name of products) {
    const productSelector = `xpath=//div[text()='${name}']/ancestor::div[contains(@class,'inventory_item')]//button[contains(@data-test,'add-to-cart')]`;
    await this.page.click(productSelector);
  }
  await this.page.click(locators.InventoryPage.cartIcon);
});

When('the user proceeds to checkout and completes the purchase', async function () {
  await this.page.click(locators.CartPage.checkoutButton);
  await this.page.fill(locators.CheckoutPage.firstNameInput, 'BDD');
  await this.page.fill(locators.CheckoutPage.lastNameInput, 'User');
  await this.page.fill(locators.CheckoutPage.postalCodeInput, '12345');
  await this.page.click(locators.CheckoutPage.continueButton);
  await this.page.click(locators.CheckoutPage.finishButton);
  await expect(this.page.locator(locators.CheckoutPage.completeHeader)).toBeVisible();
});

When('the user logs out', async function () {
  await this.page.click('#react-burger-menu-btn');
  await this.page.click('#logout_sidebar_link');
});

Then('the user should be redirected to the login page', async function () {
  await expect(this.page).toHaveURL(baseURL);
});

Then('the user should see an error message', async function () {
  await expect(this.page.locator(locators.LoginPage.errorMessage)).toBeVisible();
});

When('the user proceeds to checkout with missing first name', async function () {
  await this.page.click(locators.CartPage.checkoutButton);
  await this.page.fill(locators.CheckoutPage.firstNameInput, '');
  await this.page.fill(locators.CheckoutPage.lastNameInput, 'User');
  await this.page.fill(locators.CheckoutPage.postalCodeInput, '12345');
  await this.page.click(locators.CheckoutPage.continueButton);
});

Then('the user should see a checkout error message', async function () {
  await expect(this.page.locator(locators.LoginPage.errorMessage)).toBeVisible();
});
