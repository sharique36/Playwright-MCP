Feature: SauceDemo Login and Purchase

  @e2e
  Scenario: Valid user can login, add product to cart, checkout, and logout
    Given the user navigates to the SauceDemo login page
    When the user logs in with username "standard_user" and password "secret_sauce"
    And the user adds all products to the cart
    And the user proceeds to checkout and completes the purchase
    And the user logs out
    Then the user should be redirected to the login page

  @negative
  Scenario: Invalid login attempt
    Given the user navigates to the SauceDemo login page
    When the user logs in with username "invalid_user" and password "wrong_pass"
    Then the user should see an error message

  @edge
  Scenario: Checkout with missing information
    Given the user navigates to the SauceDemo login page
    When the user logs in with username "standard_user" and password "secret_sauce"
    And the user adds all products to the cart
    And the user proceeds to checkout with missing first name
    Then the user should see a checkout error message
