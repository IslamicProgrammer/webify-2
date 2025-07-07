// src/app/dashboard/products/client.tsx
'use client';

import { useState } from 'react';
import {
  ChevronDown,
  Download,
  Edit,
  Eye,
  FileSpreadsheet,
  Filter,
  Image as ImageIcon,
  Layers,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  SortAsc,
  SortDesc,
  Tag,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { api } from '@/trpc/react';
import type { ProductDTO } from '@/types/product';

type SortOption = 'title' | 'created_at' | 'updated_at' | 'status' | 'handle';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | 'draft' | 'proposed' | 'published' | 'rejected';

export default function ProductsClient() {
  // State for filtering and sorting
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedApp, setSelectedApp] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hasVariantsFilter, setHasVariantsFilter] = useState<boolean | undefined>(undefined);
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const { toast } = useToast();
  const params = useParams();

  // Get user's apps for filtering
  const { data: appsData } = api.apps.getAll.useQuery({
    limit: 100,
    offset: 0
  });

  // Get categories for filtering
  const { data: categoriesData } = api.categories.getByApp.useQuery({
    appId: selectedApp === 'all' ? undefined : selectedApp,
    limit: 100,
    offset: 0
  });

  // Get products with enhanced filtering
  const {
    data: productsData,
    isLoading,
    error,
    refetch
  } = api.products.getByApp.useQuery({
    appId: selectedApp === 'all' ? undefined : selectedApp,
    search: debouncedSearch,
    sortBy,
    sortOrder,
    status: statusFilter,
    categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
    hasVariants: hasVariantsFilter,
    priceRange: priceRange.min !== undefined || priceRange.max !== undefined ? priceRange : undefined,
    limit: 50,
    offset: 0
  });

  // Get product statistics
  const { data: statsData } = api.products.getStats.useQuery({
    appId: selectedApp === 'all' ? undefined : selectedApp
  });

  // Mutations
  const utils = api.useUtils();

  const deleteProductMutation = api.products.delete.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Product deleted successfully'
      });
      void utils.products.getByApp.invalidate();
      void utils.products.getStats.invalidate();
    },
    onError: error => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const products = productsData?.products || [];
  const total = productsData?.total || 0;
  const hasMore = productsData?.hasMore || false;

  // Helper functions
  const toggleSort = (column: SortOption) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedApp('all');
    setSelectedCategory('all');
    setStatusFilter('all');
    setHasVariantsFilter(undefined);
    setPriceRange({});
    setSortBy('created_at');
    setSortOrder('desc');
  };

  const deleteProduct = async (productId: string) => {
    const appId = selectedApp === 'all' ? appsData?.apps[0]?.id : selectedApp;

    if (!appId) return;

    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      deleteProductMutation.mutate({
        appId,
        productId
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'proposed':
        return 'outline';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatPrice = (product: ProductDTO) => {
    const variants = product.variants || [];

    if (variants.length === 0) return 'No price';

    // For Medusa v2, prices are handled separately through the pricing module
    // This is a placeholder - you'd need to implement proper price fetching
    return 'Price on request';
  };

  const hasActiveFilters =
    search ||
    selectedApp !== 'all' ||
    selectedCategory !== 'all' ||
    statusFilter !== 'all' ||
    hasVariantsFilter !== undefined ||
    priceRange.min !== undefined ||
    priceRange.max !== undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <DashboardHeader title="Products" description="Manage your product catalog" />

      <main className="flex-1 p-6">
        {/* Statistics Cards */}
        {statsData && (
          <div className="mb-4 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsData.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsData.published}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Draft</CardTitle>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsData.draft}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">With Variants</CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsData.withVariants}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">With Images</CardTitle>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsData.withImages}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categorized</CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsData.categorized}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <div />
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Upload Excel File
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Package className="mr-2 h-4 w-4" />
                  Download Template
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/dashboard/products/new">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Product List</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Basic Search and Controls */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>

                {/* App Filter */}
                <Select value={selectedApp} onValueChange={setSelectedApp}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Select app" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Apps</SelectItem>
                    {appsData?.apps.map(app => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={value => setStatusFilter(value as StatusFilter)}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="proposed">Proposed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort Controls */}
                <Select value={sortBy} onValueChange={value => setSortBy(value as SortOption)}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Name</SelectItem>
                    <SelectItem value="created_at">Created Date</SelectItem>
                    <SelectItem value="updated_at">Updated Date</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="handle">Handle</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid gap-4 border-t pt-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Category Filter */}
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categoriesData?.categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Variants Filter */}
                  <Select
                    value={hasVariantsFilter === undefined ? 'all' : hasVariantsFilter ? 'yes' : 'no'}
                    onValueChange={value => setHasVariantsFilter(value === 'all' ? undefined : value === 'yes')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Has variants" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="yes">With Variants</SelectItem>
                      <SelectItem value="no">Single Variant</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Price Range */}
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min price"
                      value={priceRange.min || ''}
                      onChange={e =>
                        setPriceRange(prev => ({
                          ...prev,
                          min: e.target.value ? Number(e.target.value) : undefined
                        }))
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Max price"
                      value={priceRange.max || ''}
                      onChange={e =>
                        setPriceRange(prev => ({
                          ...prev,
                          max: e.target.value ? Number(e.target.value) : undefined
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              {/* Results Summary */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {products.length} of {total} products
                  {search && ` matching "${search}"`}
                </span>
                <span>
                  Sorted by {sortBy.replace('_', ' ')} ({sortOrder})
                </span>
              </div>
            </div>

            {/* Products Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('title')}>
                      <div className="flex items-center gap-2">
                        Product
                        {sortBy === 'title' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                      </div>
                    </TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('status')}>
                      <div className="flex items-center gap-2">
                        Status
                        {sortBy === 'status' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                      </div>
                    </TableHead>
                    <TableHead>Variants</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('created_at')}>
                      <div className="flex items-center gap-2">
                        Created
                        {sortBy === 'created_at' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                      </div>
                    </TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    // Loading skeleton
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-8" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-8" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Package className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">No products found</p>
                            <p className="text-sm text-muted-foreground">{hasActiveFilters ? 'Try adjusting your filters' : 'Create your first product to get started'}</p>
                          </div>
                          {!hasActiveFilters && (
                            <Link href="/dashboard/products/new">
                              <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Product
                              </Button>
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map(product => (
                      <TableRow key={product.id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded border bg-muted">
                              {product.thumbnail ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={product.thumbnail} alt={product.title} className="h-10 min-h-10 w-10 min-w-10 rounded object-cover" />
                              ) : (
                                <Package className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{product.title}</p>
                              <p className="line-clamp-1 text-sm text-muted-foreground">{product.subtitle || product.description || 'No description'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{product.variants?.[0]?.sku || 'No SKU'}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(product.status)}>{product.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-sm">{product.variants?.length || 0}</span>
                            {(product.variants?.length || 0) > 1 && (
                              <Badge variant="outline" className="h-5 px-1 text-xs">
                                Multi
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.categories?.length ? (
                            <div className="flex flex-wrap gap-1">
                              {product.categories.slice(0, 2).map((category: any) => (
                                <Badge key={category.id} variant="outline" className="text-xs">
                                  {category.name}
                                </Badge>
                              ))}
                              {(product.categories.length || 0) > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{(product.categories.length || 0) - 2}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Uncategorized</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{formatPrice(product)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{new Date(product.created_at).toLocaleDateString()}</span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/products/${product.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/products/${product.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => deleteProduct(product.id)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Implement pagination logic here
                    console.log('Load more products');
                  }}
                >
                  Load More Products
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
