@api
Feature: Practice Software Testing API

  Background:
    Given the API base URL is configured

  Scenario: Register and log in a new user
    Given I prepare a new user registration payload
    When I register the new user
    Then the registration response status should be 201
    When I log in with the registered user
    Then the login response status should be 200
    And the response should contain an access token
    And I save the access token to "credentials/auth-token.json"

  Scenario: Get products filtered by price
    When I request products using "test-data/products.json"
    Then the products response status should be 200
    And the products response should match the "GET_product-info_schema.json" schema
    And the first product price should be 14.15
    And the first product should have a string id
    And the first product image URL should be "https://unsplash.com/@fantin"
