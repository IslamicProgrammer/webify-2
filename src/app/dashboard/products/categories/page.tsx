import React from 'react';

import CategoriesClient from './client';

import { api, HydrateClient } from '@/trpc/server';

const Page = async () => {
  await api.categories.getByApp.prefetch();

  return (
    <HydrateClient>
      <CategoriesClient />
    </HydrateClient>
  );
};

export default Page;
