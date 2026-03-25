# Test Cases for saucedemo.com E2E Automation (MCP + Healer)

This project uses the Model Context Protocol (MCP) for test case generation and the Healer approach for self-healing and robust test execution. All tests are automated using Playwright and run in Chrome.

## Test Case List (Automated)



### Login Scenarios
1. Valid login (positive)
2. Invalid login (negative)
3. Locked out user login (negative)
4. Problem user login (edge)
5. Performance glitch user login (edge)
6. Login with empty username (negative)
7. Login with empty password (negative)

### Navigation and Menu Scenarios
8. About link navigates to correct external page (same tab)
9. Logout redirects to login
10. Reset app state clears cart and resets UI

### Product and Cart Scenarios
11. Add a product to cart (positive)
12. Remove product from cart (positive)
13. Add all products to cart dynamically (positive)
14. Remove all products from cart dynamically (positive)
15. Add multiple products to cart and validate total
16. Cart icon shows correct count (positive)
17. Cart badge updates correctly with multiple add/remove
18. Cart badge and contents persist after refresh
19. Cart persistence after logout and login
20. Remove item from cart from inventory page
21. Continue shopping button returns to inventory page

### Product Sorting and Details
22. Sort products by price low to high and high to low and validate order
23. Sort products by name A-Z and Z-A and validate order
24. Inventory item details validation (name, price, description)
25. Product price matches on checkout page

### Checkout Scenarios
26. Checkout with valid info (positive)
27. Checkout with missing info (negative)
28. Checkout with invalid postal code (negative)
29. Checkout with long names (edge)
30. Checkout cancel button returns to cart
31. Checkout overview price calculation (total matches sum of items)

### End-to-End and Tab/Navigation Scenarios
32. Complete purchase and logout (E2E)
33. Open link in new tab, validate, close, switch, and use browser navigation

### Edge Cases and Validations
34. Cannot checkout with empty cart (edge/negative)
35. Session persists after reload (edge)
36. Add/remove product repeatedly (dynamic, edge)
37. Add all products to cart, detect failures, and print unaddable items

---


## Automation Mapping & Dynamic Strategies
- Each test case above is implemented in `tests/saucedemo.e2e.spec.js` using Playwright's test runner.
- Page Object Model (POM) is used for maintainability and healing (see `pages/` folder).
- Dynamic data: Test data (user credentials, product names, checkout info) is parameterized and reused via helper functions and data objects.
- Repetitive actions (e.g., adding/removing products) are implemented with dynamic loops and utility methods to maximize code reuse and coverage.
- All tests are executed in Chrome for consistency.

## How to Run All Test Cases in Chrome

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Run all tests in Chrome only:**
   ```sh
   npx playwright test --project=chromium
   ```

3. **Generate Allure report:**
   ```sh
   # If you haven't already, install Allure commandline globally:
   npm install -g allure-commandline --save-dev

   # After running your tests, generate and open the Allure report:
   npx allure generate ./allure-results --clean -o ./allure-report
   npx allure open ./allure-report
   ```
3. **Run all tests with UI (recommended for debugging and healing):**
   ```sh
   npx playwright test --ui
   ```
3. **Generate HTML report:**
   ```sh
   npx playwright test --project=chromium --reporter=html
   npx playwright show-report reports
   ```

## Notes
- MCP is used for systematic test case generation and coverage.
- Healer ensures tests are robust to UI changes (via POM and locator strategies).
- Both positive and negative scenarios, as well as edge cases, are included.
- All test cases listed above are automated and maintained in sync with this documentation.
