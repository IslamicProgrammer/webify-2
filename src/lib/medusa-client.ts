import Medusa from '@medusajs/js-sdk';

const medusa = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000',
  debug: process.env.NODE_ENV === 'development'
});

export default medusa;
