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

### Product and Cart Scenarios
8. Add a product to cart (positive)
9. Remove product from cart (positive)
10. Add multiple products to cart (positive)
11. Cart icon shows correct count (positive)
12. Add all products to cart dynamically (positive)
13. Remove all products from cart dynamically (positive)

### Checkout Scenarios
14. Checkout with valid info (positive)
15. Checkout with missing info (negative)
16. Checkout with invalid postal code (negative)
17. Checkout with long names (edge)

### Edge Cases and Validations
18. Cannot checkout with empty cart (edge/negative)
19. Session persists after reload (edge)
20. Logout redirects to login (positive)
21. Add/remove product repeatedly (dynamic, edge)

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
