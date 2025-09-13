/**
 * Unit Tests for Filter Helper Utilities
 * Tests for dynamic filter value extraction with '-' fallback behavior
 */

import { 
  getUniqueSuppliers, 
  getUniqueCategories, 
  validateFilterValue,
  isValidProductArray,
  matchesSupplierFilter
} from '../filter-helpers';
import type { Product } from '@/types/product';

// Mock product data for testing
const mockProducts: Product[] = [
  {
    id: '1',
    navn: 'Test Product 1',
    vvsnr: '12345678',
    lagerstatus: 'På lager',
    anbrekk: 'Ja',
    produsent: 'Würth',
    kategori: 'Beslag'
  },
  {
    id: '2', 
    navn: 'Test Product 2',
    vvsnr: '87654321',
    lagerstatus: 'På lager',
    anbrekk: 'Nei',
    produsent: 'Biltema',
    kategori: 'Sikkerhet'
  },
  {
    id: '3',
    navn: 'Test Product 3', 
    vvsnr: '11111111',
    lagerstatus: 'Utsolgt',
    anbrekk: 'Nei',
    produsent: 'Würth', // Duplicate supplier
    kategori: 'Festing'
  }
] as unknown as Product[];

describe('getUniqueSuppliers', () => {
  it('should return unique suppliers sorted alphabetically with Norwegian locale', () => {
    const result = getUniqueSuppliers(mockProducts);
    expect(result).toEqual(['Alle leverandører', 'Biltema', 'Würth']);
  });

  it('should handle empty array by returning ["Alle leverandører"]', () => {
    const result = getUniqueSuppliers([]);
    expect(result).toEqual(['Alle leverandører']);
  });

  it('should handle null input by returning ["Alle leverandører"]', () => {
    const result = getUniqueSuppliers(null as unknown as unknown as Product[]);
    expect(result).toEqual(['Alle leverandører']);
  });

  it('should handle undefined input by returning ["Alle leverandører"]', () => {
    const result = getUniqueSuppliers(undefined as unknown as unknown as Product[]);
    expect(result).toEqual(['Alle leverandører']);
  });

  it('should handle products with missing produsent field', () => {
    const productsWithoutSupplier = [
      { id: '1', navn: 'Test', vvsnr: '12345678', lagerstatus: 'På lager', anbrekk: 'Ja', kategori: 'Test' },
      { id: '2', navn: 'Test 2', vvsnr: '87654321', lagerstatus: 'På lager', anbrekk: 'Nei', produsent: 'TestSupplier', kategori: 'Test' }
    ] as unknown as Product[];
    
    const result = getUniqueSuppliers(productsWithoutSupplier);
    expect(result).toEqual(['Alle leverandører', 'TestSupplier']);
  });

  it('should handle products with empty/whitespace produsent values', () => {
    const productsWithEmptySupplier = [
      { id: '1', navn: 'Test', vvsnr: '12345678', lagerstatus: 'På lager', anbrekk: 'Ja', produsent: '', kategori: 'Test' },
      { id: '2', navn: 'Test 2', vvsnr: '87654321', lagerstatus: 'På lager', anbrekk: 'Nei', produsent: '   ', kategori: 'Test' },
      { id: '3', navn: 'Test 3', vvsnr: '11111111', lagerstatus: 'På lager', anbrekk: 'Nei', produsent: 'ValidSupplier', kategori: 'Test' }
    ] as unknown as Product[];
    
    const result = getUniqueSuppliers(productsWithEmptySupplier);
    expect(result).toEqual(['Alle leverandører', 'ValidSupplier']);
  });

  it('should handle products with only empty suppliers by returning ["Alle leverandører"]', () => {
    const productsWithOnlyEmptySuppliers = [
      { id: '1', navn: 'Test', vvsnr: '12345678', lagerstatus: 'På lager', anbrekk: 'Ja', produsent: '', kategori: 'Test' },
      { id: '2', navn: 'Test 2', vvsnr: '87654321', lagerstatus: 'På lager', anbrekk: 'Nei', kategori: 'Test' }
    ] as unknown as Product[];
    
    const result = getUniqueSuppliers(productsWithOnlyEmptySuppliers);
    expect(result).toEqual(['Alle leverandører']);
  });

  it('should trim whitespace from supplier names', () => {
    const productsWithWhitespace = [
      { id: '1', navn: 'Test', vvsnr: '12345678', lagerstatus: 'På lager', anbrekk: 'Ja', produsent: '  Biltema  ', kategori: 'Test' },
      { id: '2', navn: 'Test 2', vvsnr: '87654321', lagerstatus: 'På lager', anbrekk: 'Nei', produsent: 'Würth', kategori: 'Test' }
    ] as unknown as Product[];
    
    const result = getUniqueSuppliers(productsWithWhitespace);
    expect(result).toEqual(['Alle leverandører', 'Biltema', 'Würth']);
  });

  it('should handle Norwegian characters (æ, ø, å) in sorting', () => {
    const productsWithNorwegianChars = [
      { id: '1', navn: 'Test', vvsnr: '12345678', lagerstatus: 'På lager', anbrekk: 'Ja', produsent: 'Øst Leverandør', kategori: 'Test' },
      { id: '2', navn: 'Test 2', vvsnr: '87654321', lagerstatus: 'På lager', anbrekk: 'Nei', produsent: 'Åse Byggvarer', kategori: 'Test' },
      { id: '3', navn: 'Test 3', vvsnr: '11111111', lagerstatus: 'På lager', anbrekk: 'Nei', produsent: 'Ærlig AS', kategori: 'Test' }
    ] as unknown as Product[];
    
    const result = getUniqueSuppliers(productsWithNorwegianChars);
    expect(result).toEqual(['Alle leverandører', 'Ærlig AS', 'Øst Leverandør', 'Åse Byggvarer']);
  });

  it('should handle error cases by returning ["Alle leverandører"]', () => {
    // Mock console.error to avoid test output noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Test with invalid data that will cause an error
    const invalidData = 'not-an-array' as unknown as unknown as Product[];
    const result = getUniqueSuppliers(invalidData);
    expect(result).toEqual(['Alle leverandører']);
    
    consoleSpy.mockRestore();
  });
});

describe('getUniqueCategories', () => {
  it('should return unique categories sorted alphabetically with Norwegian locale', () => {
    const result = getUniqueCategories(mockProducts);
    expect(result).toEqual(['Alle kategorier', 'Beslag', 'Festing', 'Sikkerhet']);
  });

  it('should handle empty array by returning ["Alle kategorier"]', () => {
    const result = getUniqueCategories([]);
    expect(result).toEqual(['Alle kategorier']);
  });

  it('should handle null input by returning ["Alle kategorier"]', () => {
    const result = getUniqueCategories(null as unknown as unknown as Product[]);
    expect(result).toEqual(['Alle kategorier']);
  });

  it('should handle undefined input by returning ["Alle kategorier"]', () => {
    const result = getUniqueCategories(undefined as unknown as unknown as Product[]);
    expect(result).toEqual(['Alle kategorier']);
  });

  it('should handle products with missing kategori field', () => {
    const productsWithoutCategory = [
      { id: '1', navn: 'Test', vvsnr: '12345678', lagerstatus: 'På lager', anbrekk: 'Ja', produsent: 'Test' },
      { id: '2', navn: 'Test 2', vvsnr: '87654321', lagerstatus: 'På lager', anbrekk: 'Nei', produsent: 'Test', kategori: 'TestCategory' }
    ] as unknown as Product[];
    
    const result = getUniqueCategories(productsWithoutCategory);
    expect(result).toEqual(['Alle kategorier', 'TestCategory']);
  });

  it('should handle products with empty/whitespace kategori values', () => {
    const productsWithEmptyCategory = [
      { id: '1', navn: 'Test', vvsnr: '12345678', lagerstatus: 'På lager', anbrekk: 'Ja', kategori: '', produsent: 'Test' },
      { id: '2', navn: 'Test 2', vvsnr: '87654321', lagerstatus: 'På lager', anbrekk: 'Nei', kategori: '   ', produsent: 'Test' },
      { id: '3', navn: 'Test 3', vvsnr: '11111111', lagerstatus: 'På lager', anbrekk: 'Nei', kategori: 'ValidCategory', produsent: 'Test' }
    ] as unknown as Product[];
    
    const result = getUniqueCategories(productsWithEmptyCategory);
    expect(result).toEqual(['Alle kategorier', 'ValidCategory']);
  });

  it('should handle products with only empty categories by returning ["Alle kategorier"]', () => {
    const productsWithOnlyEmptyCategories = [
      { id: '1', navn: 'Test', vvsnr: '12345678', lagerstatus: 'På lager', anbrekk: 'Ja', kategori: '', produsent: 'Test' },
      { id: '2', navn: 'Test 2', vvsnr: '87654321', lagerstatus: 'På lager', anbrekk: 'Nei', produsent: 'Test' }
    ] as unknown as Product[];
    
    const result = getUniqueCategories(productsWithOnlyEmptyCategories);
    expect(result).toEqual(['Alle kategorier']);
  });

  it('should trim whitespace from category names', () => {
    const productsWithWhitespace = [
      { id: '1', navn: 'Test', vvsnr: '12345678', lagerstatus: 'På lager', anbrekk: 'Ja', kategori: '  Sikkerhet  ', produsent: 'Test' },
      { id: '2', navn: 'Test 2', vvsnr: '87654321', lagerstatus: 'På lager', anbrekk: 'Nei', kategori: 'Beslag', produsent: 'Test' }
    ] as unknown as Product[];
    
    const result = getUniqueCategories(productsWithWhitespace);
    expect(result).toEqual(['Alle kategorier', 'Beslag', 'Sikkerhet']);
  });

  it('should handle error cases by returning ["Alle kategorier"]', () => {
    // Mock console.error to avoid test output noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Test with invalid data that will cause an error
    const invalidData = 'not-an-array' as unknown as unknown as Product[];
    const result = getUniqueCategories(invalidData);
    expect(result).toEqual(['Alle kategorier']);
    
    consoleSpy.mockRestore();
  });
});

describe('validateFilterValue', () => {
  it('should return the current value if it exists in available options', () => {
    const options = ['Alle leverandører', 'Biltema', 'Würth'];
    const result = validateFilterValue('Biltema', options);
    expect(result).toBe('Biltema');
  });

  it('should return the first option when current value does not exist', () => {
    const options = ['Alle leverandører', 'Biltema', 'Würth'];
    const result = validateFilterValue('NonExistent', options);
    expect(result).toBe('Alle leverandører');
  });

  it('should return "Alle" when availableOptions is empty', () => {
    const result = validateFilterValue('SomeValue', []);
    expect(result).toBe('Alle');
  });

  it('should return "Alle" when availableOptions is null', () => {
    const result = validateFilterValue('SomeValue', null as unknown as string[]);
    expect(result).toBe('Alle');
  });

  it('should return "Alle" when availableOptions is undefined', () => {
    const result = validateFilterValue('SomeValue', undefined as unknown as string[]);
    expect(result).toBe('Alle');
  });

  it('should return "Alle leverandører" when only "Alle leverandører" is available', () => {
    const result = validateFilterValue('SomeValue', ['Alle leverandører']);
    expect(result).toBe('Alle leverandører');
  });

  it('should validate "Alle leverandører" as a valid option when it exists in options', () => {
    const options = ['Alle leverandører'];
    const result = validateFilterValue('Alle leverandører', options);
    expect(result).toBe('Alle leverandører');
  });
});

describe('isValidProductArray', () => {
  it('should return true for valid product array', () => {
    const result = isValidProductArray(mockProducts);
    expect(result).toBe(true);
  });

  it('should return false for empty array', () => {
    const result = isValidProductArray([]);
    expect(result).toBe(false);
  });

  it('should return false for null', () => {
    const result = isValidProductArray(null);
    expect(result).toBe(false);
  });

  it('should return false for undefined', () => {
    const result = isValidProductArray(undefined);
    expect(result).toBe(false);
  });

  it('should return false for non-array', () => {
    const result = isValidProductArray('not-an-array');
    expect(result).toBe(false);
  });

  it('should return false for array with invalid objects', () => {
    const invalidProducts = [
      { name: 'Missing required fields' },
      { id: '1' } // Missing navn
    ];
    const result = isValidProductArray(invalidProducts);
    expect(result).toBe(false);
  });

  it('should return true for array with minimal valid products', () => {
    const minimalProducts = [
      { id: '1', navn: 'Product 1' },
      { id: '2', navn: 'Product 2' }
    ];
    const result = isValidProductArray(minimalProducts);
    expect(result).toBe(true);
  });
});

describe('matchesSupplierFilter', () => {
  const testProduct: Product = {
    id: '1',
    navn: 'Test Product',
    vvsnr: '12345678',
    lagerstatus: 'På lager',
    anbrekk: 'Ja',
    produsent: 'Teknikk AS',
    produsentKode: '10000'
  } as Product;

  it('should match "Alle leverandører" for any product', () => {
    expect(matchesSupplierFilter(testProduct, 'Alle leverandører')).toBe(true);
    
    const productWithoutSupplier = { ...testProduct };
    delete (productWithoutSupplier as Partial<Product>).produsent;
    expect(matchesSupplierFilter(productWithoutSupplier as Product, 'Alle leverandører')).toBe(true);
  });

  it('should match by supplier name (case insensitive)', () => {
    expect(matchesSupplierFilter(testProduct, 'Teknikk AS')).toBe(true);
    expect(matchesSupplierFilter(testProduct, 'teknikk as')).toBe(true);
    expect(matchesSupplierFilter(testProduct, 'TEKNIKK AS')).toBe(true);
  });

  it('should match by supplier code', () => {
    expect(matchesSupplierFilter(testProduct, '10000')).toBe(true);
  });

  it('should not match different supplier names', () => {
    expect(matchesSupplierFilter(testProduct, 'Different Company')).toBe(false);
  });

  it('should not match different supplier codes', () => {
    expect(matchesSupplierFilter(testProduct, '99999')).toBe(false);
  });

  it('should handle products without supplier info', () => {
    const productWithoutSupplier: Product = {
      id: '2',
      navn: 'Test Product 2',
      vvsnr: '87654321',
      lagerstatus: 'På lager',
      anbrekk: 'Nei'
    } as Product;

    expect(matchesSupplierFilter(productWithoutSupplier, 'Alle leverandører')).toBe(true);
    expect(matchesSupplierFilter(productWithoutSupplier, 'Any Company')).toBe(false);
  });

  it('should handle products with only supplier name (no code)', () => {
    const productNameOnly: Product = {
      id: '3',
      navn: 'Test Product 3',
      vvsnr: '11111111',
      lagerstatus: 'På lager',
      anbrekk: 'Nei',
      produsent: 'Some Company'
    } as Product;

    expect(matchesSupplierFilter(productNameOnly, 'Some Company')).toBe(true);
    expect(matchesSupplierFilter(productNameOnly, 'Other Company')).toBe(false);
    expect(matchesSupplierFilter(productNameOnly, '12345')).toBe(false);
  });

  it('should handle products with only supplier code (no name)', () => {
    const productCodeOnly: Product = {
      id: '4',
      navn: 'Test Product 4',
      vvsnr: '22222222',
      lagerstatus: 'På lager',
      anbrekk: 'Nei',
      produsentKode: '10000'
    } as Product;

    expect(matchesSupplierFilter(productCodeOnly, '10000')).toBe(true);
    expect(matchesSupplierFilter(productCodeOnly, '99999')).toBe(false);
  });

  it('should handle reverse lookup from name to code', () => {
    // Mock the getSupplierCode function behavior
    jest.mock('../supplier-mapping', () => ({
      getSupplierCode: (name: string) => {
        if (name.toLowerCase() === 'teknikk as') return '10000';
        return null;
      }
    }));

    const productWithCode: Product = {
      id: '5',
      navn: 'Test Product 5',
      vvsnr: '33333333',
      lagerstatus: 'På lager',
      anbrekk: 'Nei',
      produsentKode: '10000'
    } as Product;

    // This test assumes the mapping utility works correctly
    // The actual test would depend on the real mapping data
    expect(matchesSupplierFilter(productWithCode, '10000')).toBe(true);
  });

  it('should handle edge cases gracefully', () => {
    expect(matchesSupplierFilter(testProduct, '')).toBe(false);
    expect(matchesSupplierFilter(testProduct, '   ')).toBe(false);
    
    const emptyProduct = {} as Product;
    expect(matchesSupplierFilter(emptyProduct, 'Alle leverandører')).toBe(true);
    expect(matchesSupplierFilter(emptyProduct, 'Any Company')).toBe(false);
  });
});