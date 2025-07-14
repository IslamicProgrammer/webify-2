/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/no-use-before-define */
'use client';

import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Archive,
  CheckCircle,
  DollarSign,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  HelpCircle,
  ImageIcon,
  Info,
  Loader2,
  Package,
  Plus,
  Settings,
  Tag,
  Trash2
} from 'lucide-react';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { api } from '@/trpc/react';

// Enhanced validation schemas with better error messages
const productOptionSchema = z.object({
  title: z.string().min(1, 'Option title is required (e.g., "Size", "Color")').max(50, 'Option title must be less than 50 characters'),
  values: z.array(z.string().min(1, 'Option value cannot be empty')).min(1, 'At least one option value is required (e.g., "Small", "Medium", "Large")')
});

const productVariantSchema = z.object({
  title: z.string().min(1, 'Variant title is required'),
  sku: z.string().optional(),
  weight: z.number().min(0, 'Weight must be positive').optional(),
  length: z.number().min(0, 'Length must be positive').optional(),
  height: z.number().min(0, 'Height must be positive').optional(),
  width: z.number().min(0, 'Width must be positive').optional(),
  options: z.record(z.string()).optional(),
  prices: z
    .array(
      z.object({
        amount: z.number().min(0, 'Price must be positive'),
        currency_code: z.string()
      })
    )
    .default([])
});

const productSchema = z.object({
  appId: z.string().min(1, 'App ID is required'),
  title: z
    .string()
    .min(1, 'Product title is required')
    .max(100, 'Title must be less than 100 characters')
    .refine(val => val.trim().length > 0, 'Title cannot be just whitespace'),
  subtitle: z.string().max(200, 'Subtitle must be less than 200 characters').optional(),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  handle: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Handle must contain only lowercase letters, numbers, and hyphens')
    .min(1, 'Handle is required')
    .max(100, 'Handle must be less than 100 characters'),
  status: z.enum(['draft', 'proposed', 'published', 'rejected']).default('draft'),
  thumbnail: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  images: z
    .array(
      z.object({
        url: z.string().url('Must be a valid URL')
      })
    )
    .default([]),
  weight: z.number().min(0, 'Weight must be positive').optional(),
  length: z.number().min(0, 'Length must be positive').optional(),
  height: z.number().min(0, 'Height must be positive').optional(),
  width: z.number().min(0, 'Width must be positive').optional(),
  origin_country: z.string().length(2, 'Must be a 2-letter country code (e.g., US, GB)').optional().or(z.literal('')),
  hs_code: z.string().optional(),
  mid_code: z.string().optional(),
  material: z.string().max(200, 'Material description must be less than 200 characters').optional(),
  categories: z
    .array(
      z.object({
        id: z.string()
      })
    )
    .default([]),
  tags: z
    .array(
      z.object({
        value: z.string().min(1)
      })
    )
    .default([]),
  has_variants: z.boolean().default(false),
  options: z.array(productOptionSchema).default([]),
  variants: z.array(productVariantSchema).default([]),
  shipping_profile_id: z.string().optional()
});

type ProductFormData = z.infer<typeof productSchema>;

// Helper component for informative tooltips
const InfoTooltip = ({ content }: { content: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 cursor-help text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// Progress calculation helper
const calculateProgress = (formData: ProductFormData): number => {
  let completed = 0;
  const total = 8;

  if (formData.title) completed++;
  if (formData.description) completed++;
  if (formData.thumbnail || formData.images.length > 0) completed++;
  if (formData.categories.length > 0) completed++;
  if (formData.tags.length > 0) completed++;
  if (formData.weight || formData.length || formData.height || formData.width) completed++;
  if (formData.origin_country) completed++;
  if (!formData.has_variants || (formData.has_variants && formData.options.length > 0)) completed++;

  return Math.round((completed / total) * 100);
};

export default function ProductCreateForm() {
  const [appId] = useState('cmck1x41p0001l204kkorz5k0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [formProgress, setFormProgress] = useState(0);

  const categoriesQuery = api.categories.getByApp.useQuery({
    appId: appId
  });
  const createProduct = api.products.create.useMutation();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      appId: appId,
      status: 'draft',
      has_variants: false,
      categories: [],
      tags: [],
      images: [],
      options: [],
      variants: [],
      handle: ''
    }
  });

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption
  } = useFieldArray({
    control: form.control,
    name: 'options'
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant
  } = useFieldArray({
    control: form.control,
    name: 'variants'
  });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage
  } = useFieldArray({
    control: form.control,
    name: 'images'
  });

  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag
  } = useFieldArray({
    control: form.control,
    name: 'tags'
  });

  const watchTitle = form.watch('title');
  const watchHasVariants = form.watch('has_variants');
  const watchOptions = form.watch('options');
  const watchFormData = form.watch();

  // Update progress when form data changes
  useEffect(() => {
    setFormProgress(calculateProgress(watchFormData));
  }, [watchFormData]);

  // Auto-generate handle from title
  useEffect(() => {
    if (watchTitle && !form.formState.dirtyFields.handle) {
      const handle = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, '');

      form.setValue('handle', handle);
    }
  }, [watchTitle, form]);

  // Generate variants when options change
  useEffect(() => {
    if (watchHasVariants && watchOptions.length > 0) {
      generateVariants();
    } else if (!watchHasVariants) {
      form.setValue('variants', []);
    }
  }, [watchHasVariants, watchOptions]);

  const generateVariants = () => {
    const options = form.getValues('options');

    if (options.length === 0) return;

    const combinations = generateOptionCombinations(options);
    const variants = combinations.map((combination: any) => {
      const variantTitle = Object.values(combination).join(' / ');
      const sku = generateSKU(form.getValues('title'), combination);

      return {
        title: variantTitle,
        sku,
        options: combination,
        prices: [
          { amount: 1000, currency_code: 'eur' },
          { amount: 1200, currency_code: 'usd' }
        ]
      };
    });

    form.setValue('variants', variants);
  };

  const generateOptionCombinations = (options: any[]) => {
    if (options.length === 0) return [];
    if (options.length === 1) {
      return options[0].values.map((value: string) => ({ [options[0].title]: value }));
    }

    const [first, ...rest] = options;
    const restCombinations = generateOptionCombinations(rest);
    const combinations: any[] = [];

    for (const value of first.values) {
      for (const restCombination of restCombinations) {
        combinations.push({
          [first.title]: value,
          ...restCombination
        });
      }
    }

    return combinations;
  };

  const generateSKU = (title: string, options: Record<string, string>) => {
    const titlePart = title.substring(0, 3).toUpperCase();
    const optionPart = Object.values(options)
      .map(v => v.substring(0, 2).toUpperCase())
      .join('-');

    return `${titlePart}-${optionPart}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  };

  const addOption = () => {
    appendOption({
      title: '',
      values: ['']
    });
  };

  const addOptionValue = (optionIndex: number) => {
    const currentOption = form.getValues(`options.${optionIndex}`);

    form.setValue(`options.${optionIndex}.values`, [...currentOption.values, '']);
  };

  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    const currentValues = form.getValues(`options.${optionIndex}.values`);

    form.setValue(
      `options.${optionIndex}.values`,
      currentValues.filter((_, i) => i !== valueIndex)
    );
  };

  const addTag = () => {
    if (newTag.trim()) {
      appendTag({ value: newTag.trim() });
      setNewTag('');
    }
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      appendImage({ url: newImageUrl.trim() });
      setNewImageUrl('');
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Creating product with data:', data);

      const createProductData = {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        handle: data.handle,
        status: data.status,
        thumbnail: data.thumbnail,
        weight: data.weight,
        length: data.length,
        height: data.height,
        width: data.width,
        origin_country: data.origin_country,
        hs_code: data.hs_code,
        mid_code: data.mid_code,
        material: data.material,
        ...(data.images.length > 0 && { images: data.images }),
        ...(data.categories.length > 0 && { categories: data.categories }),
        ...(data.tags.length > 0 && { tags: data.tags }),
        ...(data.has_variants &&
          data.options.length > 0 && {
            options: data.options,
            variants: data.variants
          }),
        ...(!data.has_variants && {
          variants: [
            {
              title: 'Default Variant',
              sku: data.title ? generateSKU(data.title, {}) : undefined,
              prices: [
                { amount: 1000, currency_code: 'eur' },
                { amount: 1200, currency_code: 'usd' }
              ]
            }
          ]
        }),
        additional_data: {
          app_id: data.appId,
          user_id: '-'
        },
        metadata: {
          has_variants: data.has_variants
        }
      };

      await createProduct.mutateAsync({
        appId: data.appId,
        ...createProductData
      });

      alert('Product created successfully!');
      form.reset();
    } catch (error) {
      console.error('Error creating product:', error);
      alert(`Error creating product: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Enhanced Header with Progress */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Create New Product</h1>
          <p className="text-muted-foreground">
            Build your product listing step by step. All required fields are marked with an asterisk (*). Your progress is automatically saved as you work.
          </p>
        </div>

        {/* Progress Indicator */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Form Completion</span>
                <span className="text-sm text-muted-foreground">{formProgress}%</span>
              </div>
              <Progress value={formProgress} className="w-full" />
              <p className="text-xs text-muted-foreground">Complete all sections for the best product listing experience</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Enhanced Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
                <Badge variant="secondary">Required</Badge>
              </CardTitle>
              <CardDescription>
                This information will be displayed to customers and used for search optimization. Make sure your title is descriptive and includes relevant keywords.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        Product Title *
                        <InfoTooltip content="Choose a clear, descriptive title that customers will search for. Include key features like brand, model, or main characteristics." />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Premium Wireless Bluetooth Headphones - Noise Cancelling" {...field} />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/100 characters.
                        {field.value?.length > 50 && ' Consider keeping it under 50 characters for better display.'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        Subtitle
                        <InfoTooltip content="A brief tagline or additional description that appears below the main title. Use this to highlight key benefits or features." />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Experience crystal-clear audio with 30-hour battery life" {...field} />
                      </FormControl>
                      <FormDescription>{field.value?.length || 0}/200 characters. Optional but recommended for better product presentation.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="handle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        URL Handle *
                        <InfoTooltip content="This creates your product's web address (URL). It's automatically generated from your title but you can customize it. Use lowercase letters, numbers, and hyphens only." />
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <span className="mr-2 text-sm text-muted-foreground">yourstore.com/products/</span>
                          <Input placeholder="premium-wireless-headphones" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>Auto-generated from title. Must be unique and SEO-friendly.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Publication Status
                        <InfoTooltip content="Draft: Not visible to customers. Proposed: Ready for review. Published: Live on your store. Rejected: Needs revision." />
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                              Draft - Work in progress
                            </div>
                          </SelectItem>
                          <SelectItem value="proposed">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                              Proposed - Ready for review
                            </div>
                          </SelectItem>
                          <SelectItem value="published">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-400"></div>
                              Published - Live on store
                            </div>
                          </SelectItem>
                          <SelectItem value="rejected">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-red-400"></div>
                              Rejected - Needs revision
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Product Description
                      <InfoTooltip content="Detailed description of your product. Include features, benefits, specifications, and any important details customers should know. This helps with SEO and customer decision-making." />
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your product in detail. Include features, benefits, materials, dimensions, care instructions, and any other relevant information that will help customers make a purchase decision..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/2000 characters. A good description is typically 150-500 characters and includes key features and benefits.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Enhanced Variants Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Product Variants
                <InfoTooltip content="Use variants when your product comes in different options like sizes, colors, or styles. Each variant can have its own price, SKU, and inventory." />
              </CardTitle>
              <CardDescription>
                Configure product options and variants for different sizes, colors, materials, or any other variations. This is essential for products that come in multiple
                options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="has_variants"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">This product has variants</FormLabel>
                      <FormDescription>
                        Enable this if your product has different options like size (S, M, L), color (Red, Blue, Green), or material (Cotton, Polyester).
                        <br />
                        <strong>Examples:</strong> T-shirts with sizes, phones with storage options, shoes with colors.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {watchHasVariants && (
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>How variants work:</strong> First, create options (like "Size" and "Color"). Then add values for each option (like "Small, Medium, Large" for Size).
                      We'll automatically generate all possible combinations as variants.
                    </AlertDescription>
                  </Alert>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium">Product Options</h4>
                      <p className="text-sm text-muted-foreground">Define the types of variations your product has (e.g., Size, Color, Material)</p>
                    </div>
                    <Button type="button" onClick={addOption} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Option
                    </Button>
                  </div>

                  {optionFields.map((field, optionIndex) => (
                    <Card key={field.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <FormField
                              control={form.control}
                              name={`options.${optionIndex}.title`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel>Option Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Size, Color, Material, Style" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button type="button" variant="outline" size="icon" onClick={() => removeOption(optionIndex)} className="mt-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <FormLabel>Option Values</FormLabel>
                            <p className="text-sm text-muted-foreground">Add all possible values for this option (e.g., for Size: Small, Medium, Large, XL)</p>
                            {form.watch(`options.${optionIndex}.values`).map((_, valueIndex) => (
                              <div key={valueIndex} className="flex items-center gap-2">
                                <FormField
                                  control={form.control}
                                  name={`options.${optionIndex}.values.${valueIndex}`}
                                  render={({ field }) => (
                                    <FormItem className="flex-1">
                                      <FormControl>
                                        <Input placeholder="e.g., Small, Red, Cotton, Classic" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <Button type="button" variant="outline" size="icon" onClick={() => removeOptionValue(optionIndex, valueIndex)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => addOptionValue(optionIndex)}>
                              <Plus className="mr-2 h-4 w-4" />
                              Add Value
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {variantFields.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-medium">Generated Variants</h4>
                        <Badge variant="secondary">{variantFields.length} variants</Badge>
                      </div>

                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Great!</strong> We've automatically generated {variantFields.length} variant(s) from your options. Each variant represents a unique combination of
                          your option values. You can customize the SKU and other details for each variant below.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-3">
                        {variantFields.map((field, index) => (
                          <Card key={field.id}>
                            <CardContent className="pt-6">
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                  <FormLabel>Variant Title</FormLabel>
                                  <div className="mt-1 text-sm font-medium">{form.watch(`variants.${index}.title`)}</div>
                                  <p className="mt-1 text-xs text-muted-foreground">This combination of your options</p>
                                </div>

                                <FormField
                                  control={form.control}
                                  name={`variants.${index}.sku`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="flex items-center gap-2">
                                        SKU (Stock Keeping Unit)
                                        <InfoTooltip content="A unique identifier for this variant. Used for inventory tracking and order management. Auto-generated but you can customize it." />
                                      </FormLabel>
                                      <FormControl>
                                        <Input placeholder="Auto-generated" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <div>
                                  <FormLabel className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Default Prices
                                  </FormLabel>
                                  <div className="mt-1 space-y-1">
                                    <div className="text-sm">€{((form.watch(`variants.${index}.prices`)?.[0]?.amount || 1000) / 100).toFixed(2)} EUR</div>
                                    <div className="text-sm">${((form.watch(`variants.${index}.prices`)?.[1]?.amount || 1200) / 100).toFixed(2)} USD</div>
                                  </div>
                                  <FormDescription className="text-xs">Pricing can be managed separately after creation</FormDescription>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Categories
                <InfoTooltip content="Categories help customers find your product and improve your store's organization. Choose all relevant categories." />
              </CardTitle>
              <CardDescription>
                Select one or more categories that best describe your product. This helps customers discover your product through browsing and filtering.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="categories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Categories</FormLabel>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                      {categoriesQuery.isLoading ? (
                        <div className="col-span-full flex items-center justify-center py-4">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading categories...
                        </div>
                      ) : (
                        categoriesQuery.data?.categories?.map(category => (
                          <label key={category.id} className="flex cursor-pointer items-center space-x-2 rounded border p-3 transition-colors hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={field.value.some(cat => cat.id === category.id)}
                              onChange={e => {
                                if (e.target.checked) {
                                  field.onChange([...field.value, { id: category.id }]);
                                } else {
                                  field.onChange(field.value.filter(cat => cat.id !== category.id));
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{category.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                    <FormDescription>
                      {field.value.length > 0 ? `Selected ${field.value.length} category(ies). Good choice!` : 'Select at least one category to help customers find your product.'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Enhanced Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Product Images
                <Badge variant="secondary">Recommended</Badge>
              </CardTitle>
              <CardDescription>
                High-quality images significantly increase sales. Add a main thumbnail and additional images showing different angles, details, or the product in use.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Image Tips:</strong> Use high-resolution images (at least 1000x1000px), show multiple angles, include lifestyle shots, and ensure good lighting. JPG or
                  PNG formats work best.
                </AlertDescription>
              </Alert>

              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Main Thumbnail Image URL
                      <InfoTooltip content="This is the primary image customers will see in search results and product listings. Make it count!" />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/product-main-image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>The main product image displayed in listings and search results. This should be your best, most representative image.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel className="flex items-center gap-2">
                  Additional Images
                  <InfoTooltip content="Add multiple images showing different angles, details, packaging, or the product being used. More images typically lead to higher conversion rates." />
                </FormLabel>
                <div className="flex gap-2">
                  <Input placeholder="https://example.com/additional-image.jpg" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} />
                  <Button type="button" onClick={addImage}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <FormDescription>
                  Add images showing different angles, details, packaging, or lifestyle shots.
                  {imageFields.length > 0 && ` You have ${imageFields.length} additional image(s).`}
                </FormDescription>

                <div className="space-y-2">
                  {imageFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2 rounded border p-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <Input value={field.url} readOnly className="flex-1" />
                      <Button type="button" variant="outline" size="icon" onClick={() => removeImage(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Product Tags
                <InfoTooltip content="Tags help with internal organization and can improve searchability. Use relevant keywords that customers might search for." />
              </CardTitle>
              <CardDescription>Add relevant tags to help with organization and searchability. Think about keywords customers might use to find this product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Tag suggestions:</strong> Include brand names, materials, occasions, target audience, or key features. Examples: "wireless", "premium", "gift", "summer",
                  "eco-friendly".
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Input
                  placeholder="e.g., wireless, premium, gift-ready, eco-friendly"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {tagFields.map((field, index) => (
                  <Badge key={field.id} variant="secondary" className="flex items-center gap-1">
                    {field.value}
                    <button type="button" onClick={() => removeTag(index)} className="ml-1 hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <FormDescription>
                {tagFields.length === 0
                  ? 'Add tags to improve product discoverability and organization.'
                  : `${tagFields.length} tag(s) added. Tags help customers find your product.`}
              </FormDescription>
            </CardContent>
          </Card>

          {/* Enhanced Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Advanced Settings
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
                  {showAdvanced ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showAdvanced ? 'Hide' : 'Show'} Advanced
                </Button>
              </CardTitle>
              <CardDescription>
                Optional settings for shipping, customs, and detailed product specifications. These help with accurate shipping calculations and international commerce.
              </CardDescription>
            </CardHeader>
            {showAdvanced && (
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Why these matter:</strong> Accurate weight and dimensions ensure correct shipping costs. Origin country and HS codes are required for international
                    shipping and customs.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Weight (grams)
                          <InfoTooltip content="Product weight in grams. Used for shipping calculations. Include packaging weight if applicable." />
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="e.g., 250"
                            {...field}
                            onChange={e => field.onChange(Number.parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormDescription>Include packaging weight for accurate shipping calculations</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="origin_country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Origin Country
                          <InfoTooltip content="2-letter country code where the product is manufactured or shipped from. Required for customs and duty calculations." />
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., US, GB, DE, CN" maxLength={2} {...field} />
                        </FormControl>
                        <FormDescription>2-letter country code (ISO 3166-1 alpha-2)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hs_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          HS Code
                          <InfoTooltip content="Harmonized System code used for customs classification. Required for international shipping. Look up your product's HS code online." />
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 6109100000" {...field} />
                        </FormControl>
                        <FormDescription>
                          Harmonized System code for customs classification
                          <Button variant="link" size="sm" className="ml-2 h-auto p-0">
                            <ExternalLink className="mr-1 h-3 w-3" />
                            Look up HS codes
                          </Button>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="material"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Material
                          <InfoTooltip content="Primary materials used in the product. Helpful for customers with allergies or preferences, and for customs documentation." />
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 100% Cotton, Stainless Steel, Plastic" {...field} />
                        </FormControl>
                        <FormDescription>Primary materials (helpful for allergies and preferences)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-sm font-medium">
                    Package Dimensions
                    <InfoTooltip content="Outer dimensions of the packaged product. Used for shipping calculations and carrier selection." />
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Length (cm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.1"
                              placeholder="e.g., 15.5"
                              {...field}
                              onChange={e => field.onChange(Number.parseFloat(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (cm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.1"
                              placeholder="e.g., 8.2"
                              {...field}
                              onChange={e => field.onChange(Number.parseFloat(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Width (cm)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.1"
                              placeholder="e.g., 12.0"
                              {...field}
                              onChange={e => field.onChange(Number.parseFloat(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormDescription>Outer package dimensions including any protective packaging</FormDescription>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Enhanced Submit Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Ready to create your product?</p>
                  <p className="text-sm text-muted-foreground">
                    Form is {formProgress}% complete.
                    {formProgress < 70 && ' Consider adding more details for better results.'}
                  </p>
                </div>

                <div className="flex space-x-4">
                  <Button type="button" variant="outline">
                    Save as Draft
                  </Button>
                  <Button type="submit" disabled={isSubmitting || createProduct.isPending} className="min-w-[120px]">
                    {isSubmitting || createProduct.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Product'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>

      {/* Enhanced Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>Development mode only - Form data preview</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-96 overflow-auto rounded bg-gray-100 p-4 text-xs">{JSON.stringify(form.watch(), null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
