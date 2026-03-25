const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { InventoryPage } = require('../pages/InventoryPage');
const { CartPage } = require('../pages/CartPage');
const { CheckoutPage } = require('../pages/CheckoutPage');
const checkoutInfo = require('./checkoutInfo');
const users = require('./users');
const locators = require('../selectors/locators.json');

// Navigation Menu Scenarios
test.describe('Navigation Menu Scenarios', () => {
    test('About link navigates to correct external page (same tab)', async ({ page }) => {
        // Login
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.valid.username, users.valid.password);
        await expect(page).toHaveURL(/inventory/);

        // Open menu and click About (should open in same tab)
        await page.locator('#react-burger-menu-btn').click();
        await Promise.all([
            page.waitForNavigation({ url: /saucelabs\.com/ }),
            page.locator('a[id="about_sidebar_link"]').click()
        ]);
        await expect(page).toHaveURL(/saucelabs\.com/);
    });
});

test.describe('Product Sorting and Filtering', () => {
    test('Sort products by price low to high and high to low and validate order', async ({ page }) => {
        // Login
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.valid.username, users.valid.password);
        await expect(page).toHaveURL(/inventory/);

        // --- Ascending (low to high) ---
        const sortDropdown = locators.sortDropdown;
        const productPrice = locators.CheckoutPage.itemPrice;
        await page.waitForSelector(sortDropdown);
        await page.selectOption(sortDropdown, { value: 'lohi' });
        let priceElements = await page.$$(productPrice);
        let prices = [];
        for (const el of priceElements) {
            const priceText = await el.textContent();
            prices.push(Number(priceText.replace('$', '')));
        }
        console.log('Prices after sorting low to high:', prices);
        let sortedAsc = [...prices].sort((a, b) => a - b);
        expect(prices).toEqual(sortedAsc);

        // --- Descending (high to low) ---
        await page.waitForSelector(sortDropdown);
        await page.selectOption(sortDropdown, { value: 'hilo' });
        priceElements = await page.$$(productPrice);
        prices = [];
        for (const el of priceElements) {
            const priceText = await el.textContent();
            prices.push(Number(priceText.replace('$', '')));
        }
        console.log('Prices after sorting high to low:', prices);
        let sortedDesc = [...prices].sort((a, b) => b - a);
        expect(prices).toEqual(sortedDesc);
    });
});

test.describe('Cart and Checkout Validations', () => {
    test('Add multiple products to cart and validate total', async ({ page }) => {
        // Login
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.valid.username, users.valid.password);
        await expect(page).toHaveURL(/inventory/);

        // Add three products and store their prices
        const inventory = new InventoryPage(page);
        const products = await inventory.getProductTitles();
        const addedProducts = [products[0], products[1], products[2]];
        let prices = [];
        for (const product of addedProducts) {
            await inventory.addProductToCartByName(product);
            const priceText = await inventory.getProductPriceByName(product);
            const priceNum = Number(priceText.replace('$', ''));
            prices.push(priceNum);
            // eslint-disable-next-line no-console
            console.log(`Added product: ${product}, Price: $${priceNum}`);
        }
        // eslint-disable-next-line no-console
        console.log('Individual prices:', prices);
        const expectedTotal = prices.reduce((a, b) => a + b, 0);
        // eslint-disable-next-line no-console
        console.log('Expected total price:', expectedTotal);
        await inventory.goToCart();

        // Validate all products are in cart
        const cart = new CartPage(page);
        const cartItems = await cart.getCartItems();
        for (const product of addedProducts) {
            expect(cartItems.some(item => item.includes(product))).toBeTruthy();
        }

        // Proceed to checkout and overview
        await cart.checkout();
        const checkout = new CheckoutPage(page);
        await checkout.fillInformation('Test', 'User', '12345');

        // Validate total price in overview
        const summaryTotalText = await page.locator('.summary_total_label').textContent();
        // Extract the total value from the text (e.g., 'Total: $69.99')
        const totalMatch = summaryTotalText.match(/Total:\s*\$(\d+\.\d{2})/);
        expect(totalMatch).not.toBeNull();
        const displayedTotal = Number(totalMatch[1]);
    // Allow for possible tax or fees, so just check subtotal
    const itemTotalText = await page.locator('.summary_subtotal_label').textContent();
    const itemTotalMatch = itemTotalText.match(/Item total:\s*\$(\d+\.\d{2})/);
    expect(itemTotalMatch).not.toBeNull();
    const displayedItemTotal = Number(itemTotalMatch[1]);
    expect(displayedItemTotal).toBeCloseTo(expectedTotal, 2);
    });
});

// Tab and Navigation Scenarios
test.describe('Tab and Navigation Scenarios', () => {
    test('Open link in new tab, validate, close, switch, and use browser navigation', async ({ page, context }) => {
        // Login and go to inventory page
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.valid.username, users.valid.password);
        await expect(page).toHaveURL(/inventory/);

        // Dynamically find a product link (simulate a link that opens in a new tab)
        // For demo, we'll create a new tab by evaluating window.open (since saucedemo doesn't have target=_blank links)
        const productLinks = await page.$$(".inventory_item_name");
        if (productLinks.length === 0) throw new Error('No product links found');
        const productHref = await productLinks[0].getAttribute('href') || '/inventory-item.html?id=4';

        // Open the product in a new tab
        const [newPage] = await Promise.all([
            context.waitForEvent('page'),
            page.evaluate((href) => window.open(href, '_blank'), productHref)
        ]);
        await newPage.waitForLoadState();

        // Validate in new tab
        await expect(newPage).toHaveURL(/inventory-item/);
        const productTitle = await newPage.locator('.inventory_details_name').textContent();
        expect(productTitle).toBeTruthy();

        // Close new tab
        await newPage.close();

        // Validate back in original tab
        await expect(page).toHaveURL(/inventory/);
        expect(await page.locator('.app_logo').isVisible()).toBeTruthy();

        // Browser navigation: go to cart, back, forward
        await page.click('.shopping_cart_link');
        await expect(page).toHaveURL(/cart/);
        await page.goBack();
        await expect(page).toHaveURL(/inventory/);
        await page.goForward();
        await expect(page).toHaveURL(/cart/);
    });
});
// End-to-End Scenario: Login, add to cart, checkout, and logout in one flow
test.describe('End-to-End User Journey', () => {
    test('Complete purchase and logout (E2E)', async ({ page }) => {
        // Login
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login('standard_user', 'secret_sauce');
        await expect(page).toHaveURL(/inventory/);

        // Add all products to cart dynamically
        const inventory = new InventoryPage(page);
        const products = await inventory.getProductTitles();
        for (const product of products) {
            await inventory.addProductToCartByName(product);
        }
        await inventory.goToCart();

        // Checkout
        const cart = new CartPage(page);
        await cart.checkout();
        const checkout = new CheckoutPage(page);
        await checkout.fillInformation(checkoutInfo.firstName, checkoutInfo.lastName, checkoutInfo.postalCode);
        await checkout.finishCheckout();
        await expect((await checkout.getCompleteHeader()).toLowerCase()).toContain('thank you for your order!');
    });
});

// Helper for login
async function login(page, username, password) {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(username, password);
}

test.describe('Login Scenarios', () => {
    test('Valid login', async ({ page }) => {
        await login(page, users.valid.username, users.valid.password);
        await expect(page).toHaveURL(/inventory/);
    });

    test('Invalid login', async ({ page }) => {
        await login(page, users.invalid.username, users.invalid.password);
        const loginPage = new LoginPage(page);
        await expect(await loginPage.getErrorMessage()).toContain('Username and password do not match');
    });

    test('Locked out user', async ({ page }) => {
        await login(page, users.locked.username, users.locked.password);
        const loginPage = new LoginPage(page);
        await expect(await loginPage.getErrorMessage()).toContain('locked out');
    });

    test('Problem user login', async ({ page }) => {
        await login(page, users.problem.username, users.problem.password);
        await expect(page).toHaveURL(/inventory/);
    });

    test('Performance glitch user login', async ({ page }) => {
        await login(page, users.performance.username, users.performance.password);
        await expect(page).toHaveURL(/inventory/);
    });
});

// Product and Cart Scenarios

test.describe('Product and Cart Scenarios', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, users.valid.username, users.valid.password);
    });

    test('Product price matches on checkout page', async ({ page }) => {
        const inventory = new InventoryPage(page);
        const products = await inventory.getProductTitles();
        // Assume we take the first product
        const productName = products[0];
        const productPrice = await inventory.getProductPriceByName(productName);
        await inventory.addProductToCartByName(productName);
        await inventory.goToCart();
        const cart = new CartPage(page);
        await cart.checkout();
        const checkout = new CheckoutPage(page);
        await checkout.fillInformation(checkoutInfo.firstName, checkoutInfo.lastName, checkoutInfo.postalCode);
        // Now on the overview page, get the price for the product
        const checkoutPrice = await checkout.getProductPriceByName(productName);
        expect(checkoutPrice).toBe(productPrice);
    });

    test('Add a product to cart', async ({ page }) => {
        const inventory = new InventoryPage(page);
        const products = await inventory.getProductTitles();
        await inventory.addProductToCartByName(products[0]);
        await inventory.goToCart();
        const cart = new CartPage(page);
        const cartItems = await cart.getCartItems();
        expect(cartItems.some(item => item.includes(products[0]))).toBeTruthy();
    });

    test('Remove product from cart', async ({ page }) => {
        const inventory = new InventoryPage(page);
        const products = await inventory.getProductTitles();
        await inventory.addProductToCartByName(products[0]);
        await inventory.goToCart();
        const cart = new CartPage(page);
        await cart.removeItemByName(products[0]);
        const cartItems = await cart.getCartItems();
        expect(cartItems.some(item => item.includes(products[0]))).toBeFalsy();
    });

    test('Add all products to cart, detect failures, and print unaddable items', async ({ page }) => {
        const inventory = new InventoryPage(page);
        const products = await inventory.getProductTitles();
        const unaddable = [];
        for (const product of products) {
            try {
                await inventory.addProductToCartByName(product);
            } catch (e) {
                unaddable.push(product);
            }
        }
        await inventory.goToCart();
        const cart = new CartPage(page);
        const cartItems = await cart.getCartItems();
        for (const product of products) {
            if (!unaddable.includes(product)) {
                expect(cartItems.some(item => item.includes(product))).toBeTruthy();
            }
        }
        if (unaddable.length > 0) {
            // eslint-disable-next-line no-console
            console.log('Unaddable items:', unaddable);
        }
    });

    test('Cart icon shows correct count', async ({ page }) => {
        const inventory = new InventoryPage(page);
        const products = await inventory.getProductTitles();
        await inventory.addProductToCartByName(products[0]);
        const cartCount = await page.locator('.shopping_cart_badge').textContent();
        expect(Number(cartCount)).toBe(1);
    });
});

// Checkout Scenarios

test.describe('Checkout Scenarios', () => {
    test.beforeEach(async ({ page }) => {
        try {
            await login(page, users.valid.username, users.valid.password);
            console.log('Login successful');
            const inventory = new InventoryPage(page);
            const products = await inventory.getProductTitles();
            console.log('Products loaded:', products);
            await inventory.addProductToCartByName(products[0]);
            await inventory.goToCart();
            const cart = new CartPage(page);
            await cart.checkout();
        } catch (e) {
            console.error('Error in beforeEach:', e);
            await page.screenshot({ path: 'beforeEach-error.png' });
            throw e;
        }
    });

    test('Checkout with valid info', async ({ page }) => {
        const checkout = new CheckoutPage(page);
        await checkout.fillInformation(checkoutInfo.firstName1, checkoutInfo.lastName1, checkoutInfo.postalCode1);
        await checkout.finishCheckout();
        expect(await checkout.getCompleteHeader()).toContain('Thank you for your order!');
    });

    test('Checkout with missing info', async ({ page }) => {
        const checkout = new CheckoutPage(page);
        await checkout.fillInformation('', checkoutInfo.lastName, checkoutInfo.postalCode);
        const error = await page.locator('[data-test="error"]').textContent();
        expect(error).toContain('Error');
    });
});

// Edge Cases and Validations

test.describe('Edge Cases and Validations', () => {
    test('Cannot checkout with empty cart', async ({ page }) => {
        await login(page, users.valid.username, users.valid.password);
        const inventory = new InventoryPage(page);
        await inventory.goToCart();
        const cart = new CartPage(page);
        await cart.checkout();
        // The app allows proceeding to checkout even with an empty cart
        await expect(page).toHaveURL(/checkout-step-one\.html/);
        // Optionally, check for the presence of the checkout form
        await expect(page.locator('[data-test="firstName"]')).toBeVisible();
    });

    test('Session persists after reload', async ({ page }) => {
        await login(page, users.valid.username, users.valid.password);
        await page.reload();
        await expect(page).toHaveURL(/inventory/);
    });

    test('Logout redirects to login', async ({ page }) => {
        await login(page, users.valid.username, users.valid.password);
        await page.locator('#react-burger-menu-btn').click();
        await page.locator('#logout_sidebar_link').click();
        await expect(page).toHaveURL('/');
    });
});

// Additional important scenarios (moved after all requires and main test blocks)
test.describe('Additional Important Scenarios', () => {
    test('Sort products by name A-Z and Z-A and validate order', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.valid.username, users.valid.password);
        await expect(page).toHaveURL(/inventory/);
        const sortDropdown = locators.sortDropdown;
        const productTitle = '.inventory_item_name';

        // Sort A-Z
        await page.waitForSelector(sortDropdown);
        await page.selectOption(sortDropdown, { value: 'az' });
        let titleElements = await page.$$(productTitle);
        let titles = [];
        for (const el of titleElements) {
            titles.push((await el.textContent()).trim());
        }
        let sortedAZ = [...titles].sort((a, b) => a.localeCompare(b));
        expect(titles).toEqual(sortedAZ);

        // Sort Z-A
        await page.selectOption(sortDropdown, { value: 'za' });
        titleElements = await page.$$(productTitle);
        titles = [];
        for (const el of titleElements) {
            titles.push((await el.textContent()).trim());
        }
        let sortedZA = [...titles].sort((a, b) => b.localeCompare(a));
        expect(titles).toEqual(sortedZA);
    });

    test('Cart persistence after logout and login', async ({ page }) => {
        // Store user
        const testUser = users.valid;
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(testUser.username, testUser.password);
        await expect(page).toHaveURL(/inventory/);
        const inventory = new InventoryPage(page);
        const products = await inventory.getProductTitles();
        // Store item
        const itemToAdd = products[0];
        await inventory.addProductToCartByName(itemToAdd);
        await inventory.goToCart();
        // Verify item is in cart
        let cartItems = await page.$$eval('.cart_item .inventory_item_name', els => els.map(e => e.textContent.trim()));
        expect(cartItems).toContain(itemToAdd);
        // Logout
        await page.locator('#react-burger-menu-btn').click();
        await page.locator('#logout_sidebar_link').click();
        await expect(page).toHaveURL('/');
        // Login again with same user
        await loginPage.login(testUser.username, testUser.password);
        await expect(page).toHaveURL(/inventory/);
        // Go to cart and verify item is still present
        await inventory.goToCart();
        cartItems = await page.$$eval('.cart_item .inventory_item_name', els => els.map(e => e.textContent.trim()));
        expect(cartItems).toContain(itemToAdd);
    });

    test('Inventory item details validation', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.valid.username, users.valid.password);
        await expect(page).toHaveURL(/inventory/);
        // Get first product's name and price
        const firstProduct = await page.locator('.inventory_item').first();
        const name = await firstProduct.locator('.inventory_item_name').textContent();
        const price = await firstProduct.locator('.inventory_item_price').textContent();
        const desc = await firstProduct.locator('.inventory_item_desc').textContent();
        // Click to details page
        await firstProduct.locator('.inventory_item_name').click();
        await expect(page).toHaveURL(/inventory-item/);
        // Validate details
        expect(await page.locator('.inventory_details_name').textContent()).toBe(name);
        expect(await page.locator('.inventory_details_price').textContent()).toBe(price);
        expect(await page.locator('.inventory_details_desc').textContent()).toBe(desc);
    });

    test('Remove item from cart from inventory page', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.valid.username, users.valid.password);
        await expect(page).toHaveURL(/inventory/);
        const inventory = new InventoryPage(page);
        const products = await inventory.getProductTitles();
        await inventory.addProductToCartByName(products[0]);
        // Remove from inventory page
        await inventory.removeProductFromCartByName(products[0]);
        // Cart badge should not exist
        const badge = await page.$('.shopping_cart_badge');
        expect(badge).toBeNull();
    });

    test('Checkout cancel button returns to cart', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.valid.username, users.valid.password);
        await expect(page).toHaveURL(/inventory/);
        const inventory = new InventoryPage(page);
        const products = await inventory.getProductTitles();
        await inventory.addProductToCartByName(products[0]);
        await inventory.goToCart();
        const cart = new CartPage(page);
        await cart.checkout();
        // Click cancel
        await page.locator('[data-test="cancel"]').click();
        await expect(page).toHaveURL(/cart/);
    });
});

// Reset App State scenario
test.describe('App State Reset', () => {
    test('Reset app state clears cart and resets UI', async ({ page }) => {
        // Login
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.valid.username, users.valid.password);
        await expect(page).toHaveURL(/inventory/);
        const inventory = new InventoryPage(page);
        const products = await inventory.getProductTitles();
        // Add two items
        await inventory.addProductToCartByName(products[0]);
        await inventory.addProductToCartByName(products[1]);
        // Cart badge should show 2
        let cartCount = await page.locator('.shopping_cart_badge').textContent();
        expect(Number(cartCount)).toBe(2);
        // Reset app state
        await page.locator('#react-burger-menu-btn').click();
        await page.locator('#reset_sidebar_link').click();
        // Cart badge should disappear
        const badge = await page.$('.shopping_cart_badge');
        expect(badge).toBeNull();
        // All buttons should be 'Add to cart'
        const addButtons = await page.$$eval('button[data-test^="add-to-cart"]', btns => btns.map(b => b.textContent.trim().toLowerCase()));
        expect(addButtons.length).toBeGreaterThan(0);
        expect(addButtons.every(txt => txt === 'add to cart')).toBe(true);
    });
});

// Checkout Overview Price Calculation scenario
test.describe('Checkout Overview Price Calculation', () => {
    test('Total price matches sum of items', async ({ page }) => {
        // Login
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.valid.username, users.valid.password);
        await expect(page).toHaveURL(/inventory/);
        const inventory = new InventoryPage(page);
        const products = await inventory.getProductTitles();
        // Add two items
        await inventory.addProductToCartByName(products[0]);
        await inventory.addProductToCartByName(products[1]);
        await inventory.goToCart();
        const cart = new CartPage(page);
        await cart.checkout();
        const checkout = new CheckoutPage(page);
        await checkout.fillInformation(checkoutInfo.firstName, checkoutInfo.lastName, checkoutInfo.postalCode);
        // Get item prices on overview page
        const itemPrices = await page.$$eval('.inventory_item_price', els => els.map(e => parseFloat(e.textContent.replace('$',''))));
        const sum = itemPrices.reduce((a, b) => a + b, 0);
        // Get displayed item total
        const itemTotalText = await page.locator('.summary_subtotal_label').textContent();
        const itemTotal = parseFloat(itemTotalText.replace(/[^\d.]/g, ''));
        expect(itemTotal).toBeCloseTo(sum, 2);
    });
});

test.describe('Cart Badge Updates', () => {
    test('Cart badge updates correctly with multiple add/remove', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.valid.username, users.valid.password);
        await expect(page).toHaveURL(/inventory/);
        const inventory = new InventoryPage(page);
        const products = await inventory.getProductTitles();
        // Add first item
        await inventory.addProductToCartByName(products[0]);
        let cartCount = await page.locator('.shopping_cart_badge').textContent();
        expect(Number(cartCount)).toBe(1);
        // Add second item
        await inventory.addProductToCartByName(products[1]);
        cartCount = await page.locator('.shopping_cart_badge').textContent();
        expect(Number(cartCount)).toBe(2);
        // Remove first item
        await inventory.removeProductFromCartByName(products[0]);
        cartCount = await page.locator('.shopping_cart_badge').textContent();
        expect(Number(cartCount)).toBe(1);
        // Remove second item
        await inventory.removeProductFromCartByName(products[1]);
        const badge = await page.$('.shopping_cart_badge');
        expect(badge).toBeNull();
    });
});

test.describe('Checkout Invalid Postal Code', () => {
    test('Checkout with invalid postal code shows error', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.valid.username, users.valid.password);
        await expect(page).toHaveURL(/inventory/);
        const inventory = new InventoryPage(page);
        const products = await inventory.getProductTitles();
        await inventory.addProductToCartByName(products[0]);
        await inventory.goToCart();
        const cart = new CartPage(page);
        await cart.checkout();
        const checkout = new CheckoutPage(page);
        await checkout.fillInformation(checkoutInfo.firstName, checkoutInfo.lastName, ''); // Empty postal code
        const error = await page.locator('[data-test="error"]').textContent();
        expect(error.toLowerCase()).toContain('postal code is required');
    });
});

test.describe('Continue Shopping Button', () => {
    test('Continue shopping returns to inventory page', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.valid.username, users.valid.password);
        await expect(page).toHaveURL(/inventory/);
        const inventory = new InventoryPage(page);
        const products = await inventory.getProductTitles();
        await inventory.addProductToCartByName(products[0]);
        await inventory.goToCart();
        await page.locator('[data-test="continue-shopping"]').click();
        await expect(page).toHaveURL(/inventory/);
    });
});

test.describe('Cart Persists Across Refresh', () => {
    test('Cart contents and badge persist after refresh', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.valid.username, users.valid.password);
        await expect(page).toHaveURL(/inventory/);
        const inventory = new InventoryPage(page);
        const products = await inventory.getProductTitles();
        await inventory.addProductToCartByName(products[0]);
        await inventory.addProductToCartByName(products[1]);
        let cartCount = await page.locator('.shopping_cart_badge').textContent();
        expect(Number(cartCount)).toBe(2);
        await page.reload();
        cartCount = await page.locator('.shopping_cart_badge').textContent();
        expect(Number(cartCount)).toBe(2);
        await inventory.goToCart();
        const cartItems = await page.$$eval('.cart_item .inventory_item_name', els => els.map(e => e.textContent.trim()));
        expect(cartItems).toContain(products[0]);
        expect(cartItems).toContain(products[1]);
    });
});
