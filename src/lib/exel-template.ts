// src/lib/excel-template.ts
import * as XLSX from 'xlsx';

export interface ProductTemplateRow {
  title: string;
  subtitle?: string;
  description?: string;
  handle?: string;
  status: 'draft' | 'proposed' | 'published' | 'rejected';
  thumbnail?: string;
  images?: string; // Comma-separated URLs
  weight?: number;
  length?: number;
  height?: number;
  width?: number;
  origin_country?: string;
  hs_code?: string;
  mid_code?: string;
  material?: string;
  tags?: string; // Comma-separated tags
  categories?: string; // Comma-separated category names
  variant_title?: string;
  variant_sku?: string;
  variant_inventory?: number;
  variant_weight?: number;
  variant_allow_backorder?: boolean;
  variant_manage_inventory?: boolean;
  variant_options?: string; // JSON string of options
}

export const PRODUCT_TEMPLATE_HEADERS: (keyof ProductTemplateRow)[] = [
  'title',
  'subtitle',
  'description',
  'handle',
  'status',
  'thumbnail',
  'images',
  'weight',
  'length',
  'height',
  'width',
  'origin_country',
  'hs_code',
  'mid_code',
  'material',
  'tags',
  'categories',
  'variant_title',
  'variant_sku',
  'variant_inventory',
  'variant_weight',
  'variant_allow_backorder',
  'variant_manage_inventory',
  'variant_options'
];

export const SAMPLE_PRODUCT_DATA: ProductTemplateRow[] = [
  {
    title: 'Premium Cotton T-Shirt',
    subtitle: 'Comfortable everyday wear',
    description: 'High-quality 100% cotton t-shirt perfect for casual wear. Available in multiple colors and sizes.',
    handle: 'premium-cotton-tshirt',
    status: 'published',
    thumbnail: 'https://example.com/images/tshirt-main.jpg',
    images: 'https://example.com/images/tshirt-1.jpg,https://example.com/images/tshirt-2.jpg',
    weight: 150,
    length: 25,
    height: 2,
    width: 20,
    origin_country: 'US',
    material: 'Cotton',
    tags: 'clothing,casual,cotton',
    categories: 'Apparel,T-Shirts',
    variant_title: 'Small / Blue',
    variant_sku: 'PCT-SM-BLU-001',
    variant_inventory: 100,
    variant_weight: 150,
    variant_allow_backorder: false,
    variant_manage_inventory: true,
    variant_options: '{"Size": "Small", "Color": "Blue"}'
  },
  {
    title: 'Premium Cotton T-Shirt',
    subtitle: 'Comfortable everyday wear',
    description: 'High-quality 100% cotton t-shirt perfect for casual wear. Available in multiple colors and sizes.',
    handle: 'premium-cotton-tshirt',
    status: 'published',
    thumbnail: 'https://example.com/images/tshirt-main.jpg',
    images: 'https://example.com/images/tshirt-1.jpg,https://example.com/images/tshirt-2.jpg',
    weight: 150,
    length: 25,
    height: 2,
    width: 20,
    origin_country: 'US',
    material: 'Cotton',
    tags: 'clothing,casual,cotton',
    categories: 'Apparel,T-Shirts',
    variant_title: 'Medium / Red',
    variant_sku: 'PCT-MD-RED-002',
    variant_inventory: 150,
    variant_weight: 155,
    variant_allow_backorder: false,
    variant_manage_inventory: true,
    variant_options: '{"Size": "Medium", "Color": "Red"}'
  },
  {
    title: 'Wireless Bluetooth Headphones',
    subtitle: 'Premium audio experience',
    description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
    handle: 'wireless-bluetooth-headphones',
    status: 'draft',
    thumbnail: 'https://example.com/images/headphones-main.jpg',
    images: 'https://example.com/images/headphones-1.jpg,https://example.com/images/headphones-2.jpg',
    weight: 300,
    length: 20,
    height: 8,
    width: 15,
    origin_country: 'CN',
    hs_code: '8518300000',
    material: 'Plastic, Metal',
    tags: 'electronics,audio,wireless',
    categories: 'Electronics,Audio',
    variant_title: 'Black',
    variant_sku: 'WBH-BLK-001',
    variant_inventory: 50,
    variant_weight: 300,
    variant_allow_backorder: true,
    variant_manage_inventory: true,
    variant_options: '{"Color": "Black"}'
  }
];

const INSTRUCTIONS_DATA = [
  ['Column', 'Description', 'Required', 'Example'],
  ['title', 'Product name', 'Yes', 'Premium Cotton T-Shirt'],
  ['subtitle', 'Short description', 'No', 'Comfortable everyday wear'],
  ['description', 'Full product description', 'No', 'High-quality 100% cotton...'],
  ['handle', 'URL-friendly identifier', 'No', 'premium-cotton-tshirt'],
  ['status', 'Product status', 'No', 'draft, published, proposed, rejected'],
  ['thumbnail', 'Main product image URL', 'No', 'https://example.com/image.jpg'],
  ['images', 'Additional images (comma-separated)', 'No', 'url1.jpg,url2.jpg'],
  ['weight', 'Weight in grams', 'No', '150'],
  ['length', 'Length in cm', 'No', '25'],
  ['height', 'Height in cm', 'No', '2'],
  ['width', 'Width in cm', 'No', '20'],
  ['origin_country', 'Country of origin (ISO code)', 'No', 'US'],
  ['hs_code', 'Harmonized System code', 'No', '6109100000'],
  ['mid_code', 'MID code', 'No', 'MID123'],
  ['material', 'Product material', 'No', 'Cotton'],
  ['tags', 'Product tags (comma-separated)', 'No', 'clothing,casual,cotton'],
  ['categories', 'Categories (comma-separated)', 'No', 'Apparel,T-Shirts'],
  ['variant_title', 'Variant name', 'No', 'Small / Blue'],
  ['variant_sku', 'Variant SKU (auto-generated if empty)', 'No', 'PCT-SM-BLU-001'],
  ['variant_inventory', 'Inventory quantity', 'No', '100'],
  ['variant_weight', 'Variant weight in grams', 'No', '150'],
  ['variant_allow_backorder', 'Allow backorders (true/false)', 'No', 'false'],
  ['variant_manage_inventory', 'Manage inventory (true/false)', 'No', 'true'],
  ['variant_options', 'Variant options as JSON', 'No', '{"Size": "Small", "Color": "Blue"}']
];

export function generateProductTemplate(): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();

  // Create the main data sheet with sample data
  const worksheet = XLSX.utils.json_to_sheet(SAMPLE_PRODUCT_DATA, {
    header: PRODUCT_TEMPLATE_HEADERS
  });

  // Set column widths for better readability
  const colWidths = [
    { wch: 25 }, // title
    { wch: 20 }, // subtitle
    { wch: 30 }, // description
    { wch: 20 }, // handle
    { wch: 10 }, // status
    { wch: 30 }, // thumbnail
    { wch: 40 }, // images
    { wch: 8 }, // weight
    { wch: 8 }, // length
    { wch: 8 }, // height
    { wch: 8 }, // width
    { wch: 12 }, // origin_country
    { wch: 12 }, // hs_code
    { wch: 12 }, // mid_code
    { wch: 15 }, // material
    { wch: 20 }, // tags
    { wch: 20 }, // categories
    { wch: 15 }, // variant_title
    { wch: 15 }, // variant_sku
    { wch: 12 }, // variant_inventory
    { wch: 12 }, // variant_weight
    { wch: 15 }, // variant_allow_backorder
    { wch: 18 }, // variant_manage_inventory
    { wch: 25 } // variant_options
  ];

  worksheet['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

  // Create instructions sheet
  const instructionsWorksheet = XLSX.utils.aoa_to_sheet(INSTRUCTIONS_DATA);

  instructionsWorksheet['!cols'] = [
    { wch: 20 }, // Column
    { wch: 40 }, // Description
    { wch: 10 }, // Required
    { wch: 30 } // Example
  ];

  XLSX.utils.book_append_sheet(workbook, instructionsWorksheet, 'Instructions');

  // Create empty template sheet
  const emptyData = [PRODUCT_TEMPLATE_HEADERS];
  const emptyWorksheet = XLSX.utils.aoa_to_sheet(emptyData);

  emptyWorksheet['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(workbook, emptyWorksheet, 'Empty Template');

  return workbook;
}

export function downloadProductTemplate(filename: string = 'product-template.xlsx'): void {
  const workbook = generateProductTemplate();

  XLSX.writeFile(workbook, filename);
}

// Utility function to parse uploaded Excel file
export function parseProductsFromExcel(file: File): Promise<ProductTemplateRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: PRODUCT_TEMPLATE_HEADERS,
          defval: undefined
        });

        // Remove the header row if it exists
        const products = jsonData.slice(1).filter((row: any) => row.title) as ProductTemplateRow[];

        resolve(products);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

// Utility function to validate product data
export function validateProductRow(row: ProductTemplateRow): string[] {
  const errors: string[] = [];

  if (!row.title || row.title.trim() === '') {
    errors.push('Title is required');
  }

  if (row.status && !['draft', 'proposed', 'published', 'rejected'].includes(row.status)) {
    errors.push('Status must be one of: draft, proposed, published, rejected');
  }

  if (row.variant_options) {
    try {
      JSON.parse(row.variant_options);
    } catch {
      errors.push('Variant options must be valid JSON');
    }
  }

  return errors;
}

// Utility function to convert template row to Medusa product format
export function convertTemplateRowToProduct(row: ProductTemplateRow, appId: string): any {
  const product: any = {
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    handle: row.handle,
    status: row.status || 'draft',
    weight: row.weight,
    length: row.length,
    height: row.height,
    width: row.width,
    origin_country: row.origin_country,
    hs_code: row.hs_code,
    mid_code: row.mid_code,
    material: row.material
  };

  // Handle thumbnail
  if (row.thumbnail) {
    product.thumbnail = row.thumbnail;
  }

  // Handle images
  if (row.images) {
    product.images = row.images.split(',').map(url => ({ url: url.trim() }));
  }

  // Handle tags
  if (row.tags) {
    product.tags = row.tags.split(',').map(tag => ({ value: tag.trim() }));
  }

  // Handle categories - this would need to be resolved to actual category IDs
  if (row.categories) {
    // Note: In a real implementation, you'd need to resolve category names to IDs
    product.category_names = row.categories.split(',').map(cat => cat.trim());
  }

  // Handle variants
  if (row.variant_title) {
    const variant: any = {
      title: row.variant_title,
      sku: row.variant_sku,
      manage_inventory: row.variant_manage_inventory ?? true,
      allow_backorder: row.variant_allow_backorder ?? false,
      inventory_quantity: row.variant_inventory || 0,
      weight: row.variant_weight
    };

    if (row.variant_options) {
      try {
        const options = JSON.parse(row.variant_options);

        variant.options = Object.entries(options).map(([key, value]) => ({
          option_title: key,
          value: value as string
        }));
      } catch {
        // Invalid JSON, skip options
      }
    }

    product.variants = [variant];
  }

  // Add tenant metadata
  product.metadata = {
    app_id: appId
  };

  return product;
}
