import { Injectable } from '@nestjs/common';

@Injectable()
export class CountriesService {
  list() {
    return [
      {
        code: 'DE',
        name: 'Germany',
        regionCode: 'de',
        regionBaseUrl: process.env.REGION_DE_BASE_URL || 'http://region-de:4101',
        regionPublicBaseUrl: process.env.REGION_DE_PUBLIC_BASE_URL || 'http://localhost:4101',
      },
      {
        code: 'IN',
        name: 'India',
        regionCode: 'in',
        regionBaseUrl: process.env.REGION_IN_BASE_URL || 'http://region-in:4102',
        regionPublicBaseUrl: process.env.REGION_IN_PUBLIC_BASE_URL || 'http://localhost:4102',
      },
      {
        code: 'US',
        name: 'United States',
        regionCode: 'de',
        regionBaseUrl: process.env.REGION_DE_BASE_URL || 'http://region-de:4101',
        regionPublicBaseUrl: process.env.REGION_DE_PUBLIC_BASE_URL || 'http://localhost:4101',
      },
    ];
  }

  getByCountryCode(code: string) {
    return this.list().find((country) => country.code === code.toUpperCase());
  }
}
