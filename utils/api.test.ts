/**
 * API Client Tests
 * Tests the basic functionality of the API client
 */

import { transformBackendProduct, type BackendProduct } from './api';

describe('API Client', () => {
  describe('transformBackendProduct', () => {
    it('should transform backend product to frontend format', () => {
      const backendProduct: BackendProduct = {
        id: '12345678',
        navn: 'Test Product',
        vvsnr: '12345678',
        produsent: 'Test Supplier',
        lagerstatus: 'På lager',
        anbrekk: 'Ja',
        lh: 'LH123',
        nobbNumber: '12345678',
        pakningAntall: 1,
        prisenhet: 'STK',
        lagerantall: 100,
        grunnpris: 299.99,
        nettopris: 269.99
      };

      const result = transformBackendProduct(backendProduct);

      expect(result.id).toBe('12345678');
      expect(result.navn).toBe('Test Product');
      expect(result.produsent).toBe('Test Supplier');
      expect(result.lagerstatus).toBe('På lager');
      expect(result.anbrekk).toBe('Ja');
      expect(result.lh).toBe('LH123');
    });

    it('should handle null values correctly', () => {
      const backendProduct: BackendProduct = {
        id: '12345678',
        navn: 'Test Product',
        vvsnr: '12345678',
        anbrekk: 'Nei',
        lh: '',
        nobbNumber: '12345678',
        pakningAntall: 1,
        prisenhet: 'STK',
        lagerantall: null,
        grunnpris: null,
        nettopris: null
      };

      const result = transformBackendProduct(backendProduct);

      expect(result.produsent).toBeUndefined();
      expect(result.lh).toBeNull(); // Empty string should transform to null
      expect(result.lagerantall).toBeNull();
    });
  });
});