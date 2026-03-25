Feature: SauceDemo Cart Operations

  @cart
  Scenario: Add and remove a single product
    Given the user navigates to the SauceDemo login page
    When the user logs in with username "standard_user" and password "secret_sauce"
    And the user adds the first product to the cart
    And the user removes the first product from the cart
    Then the cart should be empty

  @filter
  Scenario: Validate filter dropdown options
    Given the user navigates to the SauceDemo login page
    When the user logs in with username "standard_user" and password "secret_sauce"
    Then the filter dropdown should have the following options:
      | Name (A to Z)       |
      | Name (Z to A)       |
      | Price (low to high) |
      | Price (high to low) |
