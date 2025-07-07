// src/app/dashboard/products/categories/client.tsx
'use client';

import { useCallback, useState } from 'react';
import { ChevronDown, ChevronRight, Download, Edit, Eye, EyeOff, MoreHorizontal, Package, Plus, Search, SortAsc, SortDesc, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { api } from '@/trpc/react';
import type { ProductCategoryDTO } from '@/types/category';

type SortOption = 'name' | 'created_at' | 'updated_at' | 'rank' | 'handle';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | 'active' | 'inactive';
type TypeFilter = 'all' | 'internal' | 'public';
type HierarchyFilter = 'all' | 'root' | 'subcategories';

export default function CategoriesClient() {
  // State for filtering and sorting
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [hierarchyFilter, setHierarchyFilter] = useState<HierarchyFilter>('all');
  const [selectedApp, setSelectedApp] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const debouncedSearch = useDebounce(search, 300);
  const { toast } = useToast();
  const params = useParams();

  // Get user's apps for filtering
  const { data: appsData } = api.apps.getAll.useQuery({
    limit: 100,
    offset: 0
  });

  // Get categories with enhanced filtering
  const {
    data: categoriesData,
    isLoading,
    error,
    refetch
  } = api.categories.getByApp.useQuery({
    appId: selectedApp === 'all' ? undefined : selectedApp,
    search: debouncedSearch,
    sortBy,
    sortOrder,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
    isInternal: typeFilter === 'all' ? undefined : typeFilter === 'internal',
    parentCategoryId: hierarchyFilter === 'all' ? undefined : hierarchyFilter === 'root' ? null : undefined, // For subcategories, we'll filter on frontend
    limit: 100,
    offset: 0
  });

  // Get category statistics
  const { data: stats } = api.categories.getStats.useQuery({
    appId: selectedApp === 'all' ? undefined : selectedApp
  });

  const categories = categoriesData?.categories || [];
  const total = categoriesData?.total || 0;

  // Filter categories based on hierarchy filter
  const filteredCategories = categories.filter(category => {
    if (hierarchyFilter === 'root') return !category.parent_category_id;
    if (hierarchyFilter === 'subcategories') return !!category.parent_category_id;
    return true;
  });

  // Mutations
  const updateCategoryMutation = api.categories.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Category Updated',
        description: 'Category status has been updated successfully.'
      });
      refetch();
    }
  });

  const deleteCategoryMutation = api.categories.delete.useMutation({
    onSuccess: () => {
      toast({
        title: 'Category Deleted',
        description: 'Category has been deleted successfully.',
        variant: 'destructive'
      });
      refetch();
    }
  });

  // Handlers
  const handleClearSearch = useCallback(() => {
    setSearch('');
  }, []);

  const toggleSort = useCallback(
    (field: SortOption) => {
      if (sortBy === field) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortBy(field);
        setSortOrder('desc');
      }
    },
    [sortBy, sortOrder]
  );

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories(prev => (prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]));
  };

  const toggleCategoryStatus = async (categoryId: string, currentStatus: boolean) => {
    const appId = selectedApp === 'all' ? appsData?.apps[0]?.id : selectedApp;

    if (!appId) return;

    updateCategoryMutation.mutate({
      appId,
      categoryId,
      data: { is_active: !currentStatus }
    });
  };

  const deleteCategory = async (categoryId: string) => {
    const appId = selectedApp === 'all' ? appsData?.apps[0]?.id : selectedApp;

    if (!appId) return;

    if (confirm('Are you sure you want to delete this category?')) {
      deleteCategoryMutation.mutate({
        appId,
        categoryId
      });
    }
  };

  const renderCategoryRow = (category: ProductCategoryDTO, level: number = 0): JSX.Element => {
    const hasChildren = category.category_children && category.category_children.length > 0;
    const isExpanded = expandedCategories.includes(category.id);
    const indent = level * 20;

    return (
      <>
        <TableRow key={category.id} className="group">
          <TableCell style={{ paddingLeft: `${16 + indent}px` }}>
            <div className="flex items-center gap-2">
              {hasChildren && (
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => toggleExpanded(category.id)}>
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
              )}
              <span className="font-medium">{category.name}</span>
            </div>
          </TableCell>
          <TableCell>
            <span className="line-clamp-2 text-sm text-muted-foreground">{category.description || 'No description'}</span>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Badge variant={category.is_active ? 'default' : 'secondary'}>{category.is_active ? 'Active' : 'Inactive'}</Badge>
              {category.is_internal && <Badge variant="outline">Internal</Badge>}
            </div>
          </TableCell>
          <TableCell>
            <span className="text-sm">{category.category_children?.length || 0}</span>
          </TableCell>
          <TableCell>
            <span className="text-sm">0</span> {/* Products count - implement if needed */}
          </TableCell>
          <TableCell>
            <span className="text-sm text-muted-foreground">{new Date(category.created_at).toLocaleDateString()}</span>
          </TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleCategoryStatus(category.id, category.is_active)}>
                  {category.is_active ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => deleteCategory(category.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        {isExpanded && hasChildren && category?.category_children?.map(child => renderCategoryRow(child, level + 1))}
      </>
    );
  };

  if (error) {
    return (
      <div className="space-y-6">
        <DashboardHeader title="Categories" description="Manage your product categories" />
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">Failed to load categories: {error.message}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <DashboardHeader
        title="Categories"
        description={`Manage your product categories${selectedApp !== 'all' ? ` for ${appsData?.apps.find(app => app.id === selectedApp)?.name}` : ''}`}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.rootCategories || 0} root, {stats?.subCategories || 0} subcategories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active || 0}</div>
            <p className="text-xs text-muted-foreground">Visible to customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Categories</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.inactive || 0}</div>
            <p className="text-xs text-muted-foreground">Hidden from customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Internal Categories</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.internal || 0}</div>
            <p className="text-xs text-muted-foreground">Admin-only categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Manage your product categories with advanced filtering and sorting</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button asChild>
                <Link href="/dashboard/products/categories/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Category
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="mb-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name, handle, or ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 pr-8" />
              {search && (
                <Button variant="ghost" size="sm" className="absolute right-2 top-1.5 h-6 w-6 p-0" onClick={handleClearSearch}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-4">
              {/* App Filter */}
              <Select value={selectedApp} onValueChange={setSelectedApp}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select App" />
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
              <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={(value: TypeFilter) => setTypeFilter(value)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                </SelectContent>
              </Select>

              {/* Hierarchy Filter */}
              <Select value={hierarchyFilter} onValueChange={(value: HierarchyFilter) => setHierarchyFilter(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Hierarchy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="root">Root Only</SelectItem>
                  <SelectItem value="subcategories">Subcategories</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Options */}
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Created Date</SelectItem>
                  <SelectItem value="updated_at">Updated Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="handle">Handle</SelectItem>
                  <SelectItem value="rank">Rank</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>

              {/* Clear Filters */}
              {(search || selectedApp !== 'all' || statusFilter !== 'all' || typeFilter !== 'all' || hierarchyFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setSelectedApp('all');
                    setStatusFilter('all');
                    setTypeFilter('all');
                    setHierarchyFilter('all');
                    setSortBy('created_at');
                    setSortOrder('desc');
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {filteredCategories.length} of {total} categories
                {search && ` matching "${search}"`}
              </span>
              <span>
                Sorted by {sortBy.replace('_', ' ')} ({sortOrder})
              </span>
            </div>
          </div>

          {/* Categories Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort('name')}>
                    <div className="flex items-center gap-2">
                      Name
                      {sortBy === 'name' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                    </div>
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subcategories</TableHead>
                  <TableHead>Products</TableHead>
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
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">No categories found</p>
                          <p className="text-sm text-muted-foreground">
                            {search || selectedApp !== 'all' || statusFilter !== 'all' || typeFilter !== 'all' || hierarchyFilter !== 'all'
                              ? 'Try adjusting your filters'
                              : 'Create your first category to get started'}
                          </p>
                        </div>
                        {!(search || selectedApp !== 'all' || statusFilter !== 'all' || typeFilter !== 'all' || hierarchyFilter !== 'all') && (
                          <Button asChild>
                            <Link href="/dashboard/products/categories/create">
                              <Plus className="mr-2 h-4 w-4" />
                              Create Category
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Render categories
                  filteredCategories
                    .filter(category => !category.parent_category_id) // Show root categories first
                    .map(category => renderCategoryRow(category as any, 0))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Info */}
          {categoriesData?.hasMore && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Showing {filteredCategories.length} of {total} categories
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
