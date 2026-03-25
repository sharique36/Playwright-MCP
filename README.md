# Playwright E2E Automation Framework for saucedemo.com

## Overview
This project is an end-to-end (E2E) automation framework for [saucedemo.com](https://www.saucedemo.com/) using Playwright and the Page Object Model (POM) pattern. It covers 30+ meaningful test cases for login, product, cart, checkout, and edge cases.

## Folder Structure
- `pages/` - Page Object Model classes for each page
- `tests/` - All test cases
- `utils/` - Utility functions and helpers
- `reports/` - Test execution reports
- `.github/` - Copilot and workflow instructions


## Setup Instructions
1. **Install dependencies:**
    ```sh
    npm install
    ```

## Running Playwright (UI) Tests

- **Headless mode (default):**
   ```sh
   npm test
   # or
   npx playwright test
   ```

- **Headed mode:**
   ```sh
   npm run test:headed
   # or
   npx playwright test --headed
   ```

- **UI mode (interactive):**
   ```sh
   npx playwright test --ui
   ```

- **Generate HTML report:**
   ```sh
   npm run test:report
   npx playwright show-report
   ```

## Running BDD (Cucumber) Tests

- **Headless mode (default):**
   ```sh
   npm run bdd
   # or
   node run-bdd.js
   ```

- **Headed mode:**
   ```sh
   node run-bdd.js headed
   ```

## Run Both Playwright and BDD Tests

- **All (headless):**
   ```sh
   npm run test:all
   ```

- **All (headed):**
   ```sh
   npm run test:headed && node run-bdd.js headed
   ```


## Test Cases Covered
- Login scenarios (valid, invalid, locked, problem, performance users)
- Product interactions (add, remove, multiple products)
- Product sorting by price and by name (A-Z, Z-A)
- Inventory item details validation (name, price, description)
- Remove item from cart directly from inventory page
- Cart persistence after logout/login
- Cart and checkout flows (valid/invalid info, empty cart)
- Checkout cancel button returns to cart
- Edge cases (session persistence, logout, error handling)
- Navigation menu scenarios (About link opens Sauce Labs homepage)
- Add multiple products to cart and validate total: Adds three products to the cart, prints their individual prices, sums them, and validates the item total in the checkout overview matches the sum of the added products.
- More than 30 meaningful user journeys


## Author
- [Your Name]

---

> **Note:** Replace placeholder values and add more details as you expand the framework.
