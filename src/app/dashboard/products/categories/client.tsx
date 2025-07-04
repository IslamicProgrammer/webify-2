'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Edit, Eye, EyeOff, MoreHorizontal, Package, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/trpc/react';
import type { ProductCategoryDTO } from '@/types/category';

export default function CategoriesClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const { toast } = useToast();
  const params = useParams();

  const appId = params.appId as string;

  const { data: categories = [], refetch } = api.categories.getByApp.useQuery();

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

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories(prev => (prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]));
  };

  const toggleCategoryStatus = async (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);

    if (!category) return;

    await updateCategoryMutation.mutateAsync({
      appId,
      categoryId,
      data: {
        is_active: !category.is_active
      }
    });
  };

  const deleteCategory = async (categoryId: string) => {
    await deleteCategoryMutation.mutateAsync({
      appId,
      categoryId
    });
  };

  const filteredCategories = categories.filter(
    category => category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderCategoryRow = (category: ProductCategoryDTO, level = 0): JSX.Element => {
    const isExpanded = expandedCategories.includes(category.id);
    const hasChildren = category?.category_children?.length > 0;

    return (
      <>
        <TableRow key={category.id} className="group">
          <TableCell>
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 20}px` }}>
              {hasChildren && (
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleExpanded(category.id)}>
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              )}
              {!hasChildren && <div className="w-6" />}
              <div>
                <div className="font-medium">{category.name}</div>
                <div className="text-sm text-muted-foreground">{category.handle}</div>
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div className="max-w-[300px] truncate text-sm text-muted-foreground">{category.description || 'No description'}</div>
          </TableCell>
          <TableCell>
            <div className="flex gap-2">
              <Badge variant={category.is_active ? 'default' : 'secondary'}>{category.is_active ? 'Active' : 'Inactive'}</Badge>
              {category.is_internal && <Badge variant="outline">Internal</Badge>}
            </div>
          </TableCell>
          <TableCell>
            <div className="text-sm text-muted-foreground">{category?.category_children?.length} subcategories</div>
          </TableCell>
          <TableCell>
            <div className="text-sm text-muted-foreground">{category?.products?.length} products</div>
          </TableCell>
          <TableCell>
            <div className="text-sm text-muted-foreground">{new Date(category.created_at).toLocaleDateString()}</div>
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
                <DropdownMenuItem onClick={() => toggleCategoryStatus(category.id)}>
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
        {isExpanded && category.category_children.map(child => renderCategoryRow(child, level + 1))}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <DashboardHeader title="Categories" description={`Manage your Categories`} />

      <main className="flex-1 overflow-auto p-6">
        <div className="mb-4 flex items-center justify-end gap-4">
          <Button>
            <Link className="flex items-center" href="/dashboard/products/categories/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Category
            </Link>
          </Button>
          <Button variant="outline">
            <Link href="/dashboard/products/categories/import">Import Categories</Link>
          </Button>
        </div>
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories?.length}</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories?.filter(cat => cat.is_active).length}</div>
              <p className="text-xs text-muted-foreground">{Math.round((categories?.filter(cat => cat.is_active).length / categories.length) * 100)}% of total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Parent Categories</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories?.filter(cat => !cat?.parent_category_id).length}</div>
              <p className="text-xs text-muted-foreground">Top-level categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subcategories</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.reduce((acc, cat) => acc + cat?.category_children?.length, 0)}</div>
              <p className="text-xs text-muted-foreground">Nested categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>A list of all your product categories including their status and hierarchy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search categories..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8" />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subcategories</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No categories found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories?.filter(category => !category?.parent_category_id).map(category => renderCategoryRow(category as ProductCategoryDTO, 0))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
