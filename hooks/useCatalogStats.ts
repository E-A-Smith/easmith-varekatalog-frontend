import useSWR from 'swr';
import type { CatalogStats } from '@/types/catalog-stats';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useCatalogStats() {
  const { data, error, isLoading } = useSWR<CatalogStats>(
    '/api/catalog-stats',
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      revalidateOnFocus: false
    }
  );

  return {
    stats: data,
    isLoading,
    isError: error
  };
}