export interface CatalogStatsResponse {
  success: boolean;
  data: CatalogStats;
  meta: {
    responseTime: string;
    cached: boolean;
    timestamp: string;
  };
}

export interface CatalogStats {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  lastStockUpdate: string;   // ISO 8601 timestamp
  lastPriceUpdate: string;   // ISO 8601 timestamp
}

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}