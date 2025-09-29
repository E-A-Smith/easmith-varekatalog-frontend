'use client';

import { FC, useEffect } from 'react';
import { StatCard } from '../StatCard/StatCard';
import { useCatalogStats } from '@/hooks/useCatalogStats';
import { formatDistanceToNow } from '@/utils/date-helpers';
import { useAuth } from '@/hooks/useAuth';
import {
  ProductsIcon,
  CategoriesIcon,
  SuppliersIcon,
  CalendarIcon
} from '@/components/ui/icons';

interface CatalogStatsProps {
  onStatsView?: (totalProducts: number, totalSuppliers: number, lastUpdated?: string) => void;
}

export const CatalogStats: FC<CatalogStatsProps> = ({ onStatsView }) => {
  const { stats, isLoading, isError } = useCatalogStats();
  const { authState } = useAuth();
  const { isAuthenticated, user } = authState;

  // Track catalog stats view when stats are loaded
  useEffect(() => {
    if (!isLoading && !isError && stats && onStatsView) {
      const lastUpdated = stats.lastPriceUpdate > stats.lastStockUpdate
        ? stats.lastPriceUpdate
        : stats.lastStockUpdate;

      onStatsView(
        stats.totalProducts,
        stats.totalSuppliers,
        lastUpdated
      );
    }
  }, [isLoading, isError, stats, onStatsView]);

  // Generate personalized greeting
  const getGreeting = (): string => {
    if (isAuthenticated && user) {
      const hour = new Date().getHours();
      const timeGreeting =
        hour < 10 ? 'God morgen' :
        hour < 17 ? 'God dag' :
        'God kveld';

      const name = user.given_name || user.username || '';
      return `${timeGreeting}, ${name}!`;
    }
    return 'Velkommen til Varekatalogen';
  };

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-semantic-error">Kunne ikke laste katalogstatistikk</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">
          {getGreeting()}
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="flex flex-wrap justify-center gap-0 mb-8">
        <StatCard
          icon={<ProductsIcon size={32} className="text-byggern-orange" />}
          label="Produkter"
          value={stats?.totalProducts || 0}
          loading={isLoading}
        />
        <StatCard
          icon={<CategoriesIcon size={32} className="text-byggern-orange" />}
          label="Kategorier"
          value={stats?.totalCategories || 0}
          loading={isLoading}
        />
        <StatCard
          icon={<SuppliersIcon size={32} className="text-byggern-orange" />}
          label="Leverandører"
          value={stats?.totalSuppliers || 0}
          loading={isLoading}
        />
      </div>

      {/* Last Updates Section */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-lg shadow-soft p-6 w-96">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
          <CalendarIcon size={20} className="text-byggern-orange mr-2" />
          Siste oppdateringer
        </h3>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 bg-neutral-200 rounded animate-pulse"></div>
            <div className="h-4 bg-neutral-200 rounded animate-pulse w-3/4"></div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-semantic-success rounded-full mr-3"></span>
              <span className="text-sm text-neutral-700">
                <strong>Lagernivå:</strong> {stats ? formatDistanceToNow(stats.lastStockUpdate) : '...'}
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-semantic-info rounded-full mr-3"></span>
              <span className="text-sm text-neutral-700">
                <strong>Priser:</strong> {stats ? formatDistanceToNow(stats.lastPriceUpdate) : '...'}
              </span>
            </div>
          </div>
        )}
        </div>
      </div>

    </div>
  );
};