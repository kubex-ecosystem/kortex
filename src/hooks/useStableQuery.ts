'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface UseStableQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: readonly unknown[];
  queryFn: () => Promise<T>;
  showInitialLoading?: boolean;
}

/**
 * Hook customizado que só mostra loading na primeira carga,
 * mantendo dados antigos durante refetches automáticos
 */
export function useStableQuery<T>({
  queryKey,
  queryFn,
  showInitialLoading = true,
  ...options
}: UseStableQueryOptions<T>) {
  const [hasInitialData, setHasInitialData] = useState(false);

  const query = useQuery({
    queryKey,
    queryFn,
    ...options,
  });

  useEffect(() => {
    if (query.data && !hasInitialData) {
      setHasInitialData(true);
    }
  }, [query.data, hasInitialData]);

  // Só mostra loading se:
  // 1. É a primeira carga (não tem dados em cache)
  // 2. showInitialLoading está habilitado
  // 3. Realmente está carregando
  const shouldShowLoading = query.isLoading && !hasInitialData && showInitialLoading;

  return {
    ...query,
    isLoading: shouldShowLoading,
    isInitialLoading: query.isLoading && !hasInitialData,
    isRefetching: query.isFetching && hasInitialData,
  };
}
