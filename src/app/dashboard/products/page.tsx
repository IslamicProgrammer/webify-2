import React from 'react';

import { medusaTokenManager } from '@/lib/medusa-token-manager';

const Page = async () => {
  const products = await medusaTokenManager.makeAuthenticatedRequest('GET', '/admin/products');

  console.log('products', products);

  return (
    <div>
      <h1>Products</h1>
      <p>Welcome to the products page!</p>
      <p>Here you can find a list of all available products.</p>
      <p>Feel free to explore and learn more about each product.</p>
    </div>
  );
};

export default Page;
