/**
 * Product TypeScript types system for Varekatalog
 * Step 2.2: Comprehensive type definitions for product data
 */

// Base product interface matching the Norwegian building supplies catalog
export interface Product {
  /** Unique product identifier */
  id: string;
  
  /** Product name in Norwegian */
  navn: string;
  
  /** VVS-nummer (8-digit product code) */
  vvsnr: string;
  
  /** Current stock status */
  lagerstatus: LagerStatus;
  
  /** Partial quantity availability (Anbrekk) */
  anbrekk: AnbrekkStatus;
  
  /** Product manufacturer/supplier */
  produsent?: string;
  
  /** Product category */
  kategori?: ProductCategory;
  
  /** Product description */
  beskrivelse?: string;
  
  /** EAN code for barcode scanning */
  ean?: string;
  
  /** NOBB product number for external integration */
  nobbNummer?: string;
  
  /** Unit of measurement */
  enhet?: string;
  
  /** Price information (optional for security) */
  pris?: PriceInfo;
  
  /** Product dimensions */
  dimensjoner?: ProductDimensions;
  
  /** Product weight in kg */
  vekt?: number;
  
  /** Product images */
  bilder?: ProductImage[];
  
  /** Last updated timestamp */
  sistOppdatert?: Date;

  // NEW FIELDS FOR 10-COLUMN TABLE LAYOUT (Phase 1)
  
  /** LH code (internal reference) */
  lh: string;
  
  /** NOBB reference number for external links */
  nobbNumber: string;
  
  /** Package quantity (# i pakning) */
  pakningAntall: number;
  
  /** Price unit (STK, POS, etc.) */
  prisenhet: string;
  
  /** Stock quantity (Lagerantall) - null when unauthorized, number when authorized */
  lagerantall: number | null;
  
  /** Base price (Grunnpris) - null when unauthorized, number when authorized */
  grunnpris: number | null;
  
  /** Net price (Nettopris) - null when unauthorized, number when authorized */
  nettopris: number | null;
}

// Stock status enum - includes unknown state for unauthorized users
export type LagerStatus = 
  | 'På lager'      // In stock (● Green circle)
  | 'Utsolgt'       // Out of stock (× Red cross)
  | 'NA';           // Not available / Unknown (when lagerantall is null)

// Partial quantity status (Anbrekk)
export type AnbrekkStatus = 'Ja' | 'Nei';

// Product categories for Norwegian building supplies
export type ProductCategory =
  | 'Sikkerhet'
  | 'Beslag'
  | 'Festing'
  | 'Skruer og bolter'
  | 'Byggematerialer'
  | 'Isolasjon'
  | 'Rør og koblingsutstyr'
  | 'Elektro'
  | 'Gulv'
  | 'Vindus- og dørbeslag'
  | 'Lim og fugemasse'
  | 'Takmateriell'
  | 'Ventilasjon'
  | 'Baderomsinnredning'
  | 'Verktøy'
  | 'Belysning'
  | 'Ovner og varme'
  | 'Hage og utendørs'
  | 'Maling og lakk'
  | 'Rensemidler';

// Price information interface
export interface PriceInfo {
  /** Customer visible price (ex. VAT) */
  salgspris: number;
  
  /** Internal cost price (hidden from customers) */
  innkjøpspris?: number;
  
  /** Currency (typically NOK) */
  valuta: 'NOK' | 'EUR' | 'USD';
  
  /** Price includes VAT */
  inkludertMva: boolean;
  
  /** Price per unit */
  perEnhet?: string;
  
  /** Special offers or discounts */
  tilbud?: DiscountInfo;
}

// Discount information
export interface DiscountInfo {
  /** Discount type */
  type: 'prosent' | 'beløp';
  
  /** Discount value */
  verdi: number;
  
  /** Valid from date */
  gyldigFra: Date;
  
  /** Valid to date */
  gyldigTil: Date;
  
  /** Discount description */
  beskrivelse?: string;
}

// Product dimensions
export interface ProductDimensions {
  /** Length in mm */
  lengde?: number;
  
  /** Width in mm */
  bredde?: number;
  
  /** Height in mm */
  høyde?: number;
  
  /** Diameter in mm */
  diameter?: number;
  
  /** Thickness in mm */
  tykkelse?: number;
}

// Product image information
export interface ProductImage {
  /** Image URL */
  url: string;
  
  /** Alt text for accessibility */
  altTekst: string;
  
  /** Image type */
  type: 'produkt' | 'teknisk' | 'installasjon' | 'miljø';
  
  /** Image resolution */
  oppløsning?: string;
  
  /** Is this the primary image? */
  hovedbilde: boolean;
}

// Search and filtering types
export interface ProductSearchQuery {
  /** Search term */
  søketekst?: string;
  
  /** Filter by category */
  kategori?: ProductCategory[];
  
  /** Filter by stock status */
  lagerstatus?: LagerStatus[];
  
  /** Filter by supplier */
  produsent?: string[];
  
  /** Price range filter */
  prisområde?: {
    min?: number;
    max?: number;
  };
  
  /** Filter by partial quantity availability */
  anbrekk?: AnbrekkStatus;
  
  /** Sort order */
  sortering?: ProductSortOrder;
  
  /** Pagination */
  side?: number;
  sideStørrelse?: number;
}

// Sort order options
export type ProductSortOrder =
  | 'navn_asc'        // Name A-Z
  | 'navn_desc'       // Name Z-A
  | 'pris_asc'        // Price low to high
  | 'pris_desc'       // Price high to low
  | 'lagerstatus_asc' // Stock status
  | 'produsent_asc'   // Supplier A-Z
  | 'kategori_asc'    // Category A-Z
  | 'sist_oppdatert'  // Recently updated
  | 'relevans';       // Search relevance

// Search result response
export interface ProductSearchResult {
  /** Found products */
  produkter: Product[];
  
  /** Total number of results */
  totaltAntall: number;
  
  /** Current page */
  gjeldendeSide: number;
  
  /** Total pages */
  totaltSider: number;
  
  /** Search query used */
  søk: ProductSearchQuery;
  
  /** Search execution time in ms */
  søketid: number;
  
  /** Facets for filtering */
  fasetter?: SearchFacets;
}

// Search facets for filtering UI
export interface SearchFacets {
  /** Available categories with counts */
  kategorier: FacetItem[];
  
  /** Available suppliers with counts */
  produsenter: FacetItem[];
  
  /** Stock status distribution */
  lagerstatus: FacetItem[];
  
  /** Price ranges */
  prisområder: PriceRangeFacet[];
}

// Individual facet item
export interface FacetItem {
  /** Facet value */
  verdi: string;
  
  /** Number of products in this facet */
  antall: number;
  
  /** Display label */
  label?: string;
}

// Price range facet
export interface PriceRangeFacet {
  /** Range label */
  label: string;
  
  /** Minimum price */
  min: number;
  
  /** Maximum price */
  max: number;
  
  /** Number of products in range */
  antall: number;
}

// API response wrapper
export interface ApiResponse<T> {
  /** Response data */
  data: T;
  
  /** Success status */
  success: boolean;
  
  /** Error message if applicable */
  error?: string;
  
  /** Response metadata */
  metadata?: {
    timestamp: Date;
    requestId: string;
    version: string;
  };
}

// Specific API response types
export type ProductApiResponse = ApiResponse<Product>;
export type ProductListApiResponse = ApiResponse<Product[]>;
export type ProductSearchApiResponse = ApiResponse<ProductSearchResult>;

// Helper type for creating new products (without generated fields)
export type CreateProductData = Omit<Product, 'id' | 'sistOppdatert'>;

// Helper type for updating products (partial with required id)
export type UpdateProductData = Partial<Omit<Product, 'id'>> & { id: string };

// OAuth scope types (Phase 2) - Search is public, only premium features need scopes
export type OAuthScope = 'varekatalog/prices' | 'varekatalog/inventory';

// User permissions interface (Phase 2) - Search is always public
export interface UserPermissions {
  canViewPrices: boolean;
  canViewInventory: boolean;
  canSearch: true; // Always true - search is public
}

// Helper type for product table display
export interface ProductTableColumn {
  /** Column key matching Product property */
  key: keyof Product;
  
  /** Display label */
  label: string;
  
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  
  /** Column width */
  width?: string;
  
  /** Is column sortable */
  sortable?: boolean;
  
  /** Custom render function */
  render?: (value: unknown, product: Product) => React.ReactNode;
}

// Type guards for runtime type checking
export const isProduct = (obj: unknown): obj is Product => {
  return typeof obj === 'object' && 
         obj !== null && 
         typeof (obj as Product).id === 'string' &&
         typeof (obj as Product).navn === 'string' &&
         typeof (obj as Product).vvsnr === 'string';
};

export const isLagerStatus = (status: string): status is LagerStatus => {
  return ['På lager', 'Utsolgt'].includes(status);
};

export const isAnbrekkStatus = (status: string): status is AnbrekkStatus => {
  return status === 'Ja' || status === 'Nei';
};

export const isProductCategory = (category: string): category is ProductCategory => {
  const validCategories: ProductCategory[] = [
    'Sikkerhet', 'Beslag', 'Festing', 'Skruer og bolter', 'Byggematerialer',
    'Isolasjon', 'Rør og koblingsutstyr', 'Elektro', 'Gulv', 'Vindus- og dørbeslag',
    'Lim og fugemasse', 'Takmateriell', 'Ventilasjon', 'Baderomsinnredning', 'Verktøy',
    'Belysning', 'Ovner og varme', 'Hage og utendørs', 'Maling og lakk', 'Rensemidler'
  ];
  return validCategories.includes(category as ProductCategory);
};