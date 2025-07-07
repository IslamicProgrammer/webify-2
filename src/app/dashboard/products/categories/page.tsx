// src/app/dashboard/products/categories/page.tsx
import React from 'react';

import CategoriesClient from './client';

import { api, HydrateClient } from '@/trpc/server';

const CategoriesPage = async () => {
  // Prefetch categories data for better performance
  await api.categories.getByApp.prefetch({
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit: 50,
    offset: 0
  });

  // Prefetch apps data for filtering
  await api.apps.getAll.prefetch({
    limit: 100,
    offset: 0
  });

  // Prefetch category stats
  await api.categories.getStats.prefetch({});

  return (
    <HydrateClient>
      <CategoriesClient />
    </HydrateClient>
  );
};

export default CategoriesPage;
