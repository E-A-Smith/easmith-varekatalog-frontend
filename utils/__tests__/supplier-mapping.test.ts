/**
 * @jest-environment jsdom
 */

import {
  getSupplierName,
  getSupplierCode,
  hasSupplierMapping,
  getAllSupplierNames,
  getAllSupplierCodes,
  getDisplayName,
  getMappingInfo,
  validateMappingData
} from '../supplier-mapping';

describe('Supplier Mapping Utilities', () => {
  describe('getSupplierName', () => {
    it('should return correct supplier name for valid codes', () => {
      expect(getSupplierName('100006')).toBe('Teknikk AS');
      expect(getSupplierName('100056')).toBe('Luna Norge AS (Tidl.B&B Solut');
      expect(getSupplierName('100077')).toBe('THERMEX SCANDINAVIA AS');
    });

    it('should handle invalid codes gracefully', () => {
      expect(getSupplierName('99999')).toBe('Unknown Supplier (99999)');
      expect(getSupplierName('invalid')).toBe('Unknown Supplier (invalid)');
    });

    it('should handle edge cases', () => {
      expect(getSupplierName('')).toBe('Unknown Supplier');
      expect(getSupplierName('   ')).toBe('Unknown Supplier ()');
    });

    it('should handle null/undefined inputs', () => {
      expect(getSupplierName(null as unknown as string)).toBe('Unknown Supplier');
      expect(getSupplierName(undefined as unknown as string)).toBe('Unknown Supplier');
    });
  });

  describe('getSupplierCode', () => {
    it('should return correct codes for valid supplier names', () => {
      expect(getSupplierCode('Teknikk AS')).toBe('100006');
      expect(getSupplierCode('Luna Norge AS (Tidl.B&B Solut')).toBe('100056');
      expect(getSupplierCode('THERMEX SCANDINAVIA AS')).toBe('100077');
    });

    it('should be case insensitive', () => {
      expect(getSupplierCode('teknikk as')).toBe('100006');
      expect(getSupplierCode('TEKNIKK AS')).toBe('100006');
      expect(getSupplierCode('Teknikk AS')).toBe('100006');
    });

    it('should return null for unknown suppliers', () => {
      expect(getSupplierCode('Unknown Company')).toBeNull();
      expect(getSupplierCode('NonExistent Supplier')).toBeNull();
    });

    it('should handle edge cases', () => {
      expect(getSupplierCode('')).toBeNull();
      expect(getSupplierCode('   ')).toBeNull();
      expect(getSupplierCode(null as unknown as string)).toBeNull();
      expect(getSupplierCode(undefined as unknown as string)).toBeNull();
    });
  });

  describe('hasSupplierMapping', () => {
    it('should return true for valid supplier codes', () => {
      expect(hasSupplierMapping('100006')).toBe(true);
      expect(hasSupplierMapping('100056')).toBe(true);
      expect(hasSupplierMapping('100077')).toBe(true);
    });

    it('should return false for invalid codes', () => {
      expect(hasSupplierMapping('99999')).toBe(false);
      expect(hasSupplierMapping('invalid')).toBe(false);
      expect(hasSupplierMapping('')).toBe(false);
    });

    it('should handle whitespace', () => {
      expect(hasSupplierMapping(' 100006 ')).toBe(true);
      expect(hasSupplierMapping('   ')).toBe(false);
    });
  });

  describe('getAllSupplierNames', () => {
    it('should return an array of supplier names', () => {
      const names = getAllSupplierNames();
      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBeGreaterThan(0);
      expect(names).toContain('Teknikk AS');
    });

    it('should return names sorted alphabetically', () => {
      const names = getAllSupplierNames();
      const sortedNames = [...names].sort((a, b) => a.localeCompare(b, 'no'));
      expect(names).toEqual(sortedNames);
    });
  });

  describe('getAllSupplierCodes', () => {
    it('should return an array of supplier codes', () => {
      const codes = getAllSupplierCodes();
      expect(Array.isArray(codes)).toBe(true);
      expect(codes.length).toBeGreaterThan(0);
      expect(codes).toContain('100006');
    });

    it('should return codes sorted numerically', () => {
      const codes = getAllSupplierCodes();
      const sortedCodes = [...codes].sort((a, b) => parseInt(a) - parseInt(b));
      expect(codes).toEqual(sortedCodes);
    });

    it('should contain only numeric codes', () => {
      const codes = getAllSupplierCodes();
      codes.forEach(code => {
        expect(code).toMatch(/^\d+$/);
        expect(code.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getDisplayName', () => {
    it('should convert codes to names', () => {
      expect(getDisplayName('100006')).toBe('Teknikk AS');
      expect(getDisplayName('100056')).toBe('Luna Norge AS (Tidl.B&B Solut');
    });

    it('should return names as-is when already names', () => {
      expect(getDisplayName('Teknikk AS')).toBe('Teknikk AS');
      expect(getDisplayName('Some Company')).toBe('Some Company');
    });

    it('should handle invalid codes', () => {
      expect(getDisplayName('99999')).toBe('Unknown Supplier (99999)');
    });

    it('should handle edge cases', () => {
      expect(getDisplayName('')).toBe('Unknown Supplier');
      expect(getDisplayName(null as unknown as string)).toBe('Unknown Supplier');
      expect(getDisplayName(undefined as unknown as string)).toBe('Unknown Supplier');
    });

    it('should handle non-numeric strings', () => {
      expect(getDisplayName('ABC123')).toBe('ABC123'); // Non-numeric
      expect(getDisplayName('Some Company Name')).toBe('Some Company Name');
    });
  });

  describe('getMappingInfo', () => {
    it('should return mapping metadata', () => {
      const info = getMappingInfo();
      expect(info).toHaveProperty('total_suppliers');
      expect(info).toHaveProperty('match_rate');
      expect(info).toHaveProperty('extraction_date');
      expect(info.total_suppliers).toBeGreaterThan(0);
    });
  });

  describe('validateMappingData', () => {
    it('should validate the mapping data structure', () => {
      const validation = validateMappingData();
      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('errors');
      expect(validation).toHaveProperty('stats');
      expect(Array.isArray(validation.errors)).toBe(true);
      expect(typeof validation.stats.totalSuppliers).toBe('number');
    });

    it('should report validation stats', () => {
      const validation = validateMappingData();
      expect(validation.stats.totalSuppliers).toBeGreaterThan(0);
      expect(validation.stats.codesWithNames).toBeGreaterThan(0);
      expect(validation.stats.codesWithWebIds).toBeGreaterThan(0);
    });
  });

  describe('Integration tests', () => {
    it('should have bidirectional mapping consistency', () => {
      const testCodes = ['100006', '100056', '100077', '114037'];
      
      testCodes.forEach(code => {
        const name = getSupplierName(code);
        const reversedCode = getSupplierCode(name);
        expect(reversedCode).toBe(code);
      });
    });

    it('should handle the "Alle leverandører" special case', () => {
      expect(getSupplierCode('Alle leverandører')).toBeNull();
      expect(getDisplayName('Alle leverandører')).toBe('Alle leverandører');
    });

    it('should maintain data integrity', () => {
      const allNames = getAllSupplierNames();
      const allCodes = getAllSupplierCodes();
      
      expect(allNames.length).toBe(allCodes.length);
      
      // Check that every name has a corresponding code
      allNames.forEach(name => {
        const code = getSupplierCode(name);
        expect(code).not.toBeNull();
        expect(allCodes).toContain(code);
      });
      
      // Check that every code has a corresponding name
      allCodes.forEach(code => {
        const name = getSupplierName(code);
        expect(name).not.toBe(`Unknown Supplier (${code})`);
        expect(allNames).toContain(name);
      });
    });

    it('should handle real supplier data from the mapping file', () => {
      // Test some known suppliers from the actual mapping
      const knownMappings = [
        { code: '100006', name: 'Teknikk AS' },
        { code: '114037', name: 'Løvenskiold-Handel AS' },
        { code: '159344', name: 'Robert Bosch AS' },
        { code: '451139', name: 'Mill International AS' }
      ];

      knownMappings.forEach(({ code, name }) => {
        expect(hasSupplierMapping(code)).toBe(true);
        expect(getSupplierName(code)).toBe(name);
        expect(getSupplierCode(name)).toBe(code);
        expect(getDisplayName(code)).toBe(name);
        expect(getDisplayName(name)).toBe(name);
      });
    });
  });
});