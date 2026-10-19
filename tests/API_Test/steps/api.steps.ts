import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { faker } from '@faker-js/faker';
import fs from 'fs/promises';
import path from 'path';
import { validateSchema } from '../../../utils/schema-validator';
import { readJson } from '../../../utils/test-data';
import { test } from '../fixture/fixtures';

const { Given, When, Then } = createBdd(test);

const apiBaseUrl = 'https://api.practicesoftwaretesting.com/';

type ProductRequestData = {
  page: number;
  priceRange: string;
  isRental: boolean;
};

Given('the API base URL is configured', async ({ apiState }) => {
  apiState.baseUrl = apiBaseUrl;
});

Given('I prepare a new user registration payload', async ({ apiState }) => {
  apiState.registrationPayload = {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    dob: '1990-01-01',
    phone: '1234567890',
    email: faker.internet.email(),
    password: 'Test@9099',
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: 'US',
      postal_code: '12345',
    },
  };
});

When('I register the new user', async ({ request, apiState }) => {
  if (!apiState.baseUrl || !apiState.registrationPayload) {
    throw new Error('Registration data is not prepared');
  }

  apiState.response = await request.post(`${apiState.baseUrl}users/register`, {
    data: apiState.registrationPayload,
  });
  apiState.responseBody = await apiState.response.json();
});

When('I log in with the registered user', async ({ request, apiState }) => {
  if (!apiState.baseUrl || !apiState.registrationPayload) {
    throw new Error('Registration data is not prepared');
  }

  apiState.response = await request.post(`${apiState.baseUrl}users/login`, {
    data: {
      email: apiState.registrationPayload.email,
      password: apiState.registrationPayload.password,
    },
  });
  apiState.responseBody = await apiState.response.json();
});

Then(
  'the registration response status should be {int}',
  async ({ apiState }, expectedStatus) => {
    expect(apiState.response?.status()).toBe(expectedStatus);
  }
);

Then(
  'the login response status should be {int}',
  async ({ apiState }, expectedStatus) => {
    expect(apiState.response?.status()).toBe(expectedStatus);
  }
);

Then('the response should contain an access token', async ({ apiState }) => {
  expect(apiState.responseBody?.access_token).toEqual(expect.any(String));
});

Then(
  'I save the access token to {string}',
  async ({ apiState }, relativeFilePath: string) => {
    const token = apiState.responseBody?.access_token;
    if (typeof token !== 'string') {
      throw new Error(
        'Cannot save the access token because it was not returned'
      );
    }

    const filePath = path.resolve(relativeFilePath);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify({ token }, null, 2));
  }
);

When(
  'I request products using {string}',
  async ({ request, apiState }, dataFilePath: string) => {
    if (!apiState.baseUrl) {
      throw new Error('API base URL is not configured');
    }

    const productRequest = readJson<ProductRequestData>(dataFilePath);

    apiState.response = await request.get(`${apiState.baseUrl}products`, {
      params: {
        page: productRequest.page,
        between: `price,${productRequest.priceRange}`,
        is_rental: productRequest.isRental,
      },
    });
    apiState.responseBody = await apiState.response.json();
  }
);

Then(
  'the products response status should be {int}',
  async ({ apiState }, expectedStatus) => {
    expect(apiState.response?.status()).toBe(expectedStatus);
  }
);

Then(
  'the products response should match the {string} schema',
  async ({ apiState }, schemaFileName: string) => {
    if (!apiState.responseBody) {
      throw new Error('Products response body is not available');
    }
    await validateSchema(apiState.responseBody, schemaFileName);
  }
);

Then(
  'the first product price should be {float}',
  async ({ apiState }, expectedPrice) => {
    expect(apiState.responseBody?.data?.[0]?.price).toBe(expectedPrice);
  }
);

Then('the first product should have a string id', async ({ apiState }) => {
  expect(apiState.responseBody?.data?.[0]?.id).toEqual(expect.any(String));
});

Then(
  'the first product image URL should be {string}',
  async ({ apiState }, expectedUrl: string) => {
    expect(apiState.responseBody?.data?.[0]?.product_image?.by_url).toBe(
      expectedUrl
    );
  }
);
