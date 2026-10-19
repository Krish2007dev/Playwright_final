import { test as base } from 'playwright-bdd';

export type RegistrationPayload = {
  first_name: string;
  last_name: string;
  dob: string;
  phone: string;
  email: string;
  password: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
};

export type ApiResponseBody = {
  access_token?: unknown;
  data?: Array<{
    price?: unknown;
    id?: unknown;
    product_image?: {
      by_url?: unknown;
    };
  }>;
};

export type ApiState = {
  baseUrl?: string;
  registrationPayload?: RegistrationPayload;
  response?: {
    status(): number;
    json(): Promise<Record<string, unknown>>;
  };
  responseBody?: ApiResponseBody;
};

type ApiFixtures = {
  apiState: ApiState;
};

export const test = base.extend<ApiFixtures>({
  apiState: async ({}, use) => {
    await use({});
  },
});
