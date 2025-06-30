'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle, Eye, EyeOff, Info, Loader2, Lock, Package, Save, Unlock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { mockCategories } from '@/lib/mock-data/categories';
import { cn } from '@/lib/utils';
import { type CreateCategoryFormData, createCategorySchema } from '@/lib/validations/category';

export default function CreateCategoryPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
    mode: 'onChange',
    defaultValues: {
      is_active: true,
      is_internal: false
    }
  });

  const watchedName = watch('name');
  const watchedHandle = watch('handle');
  const watchedIsActive = watch('is_active');
  const watchedIsInternal = watch('is_internal');

  // Auto-generate handle from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const handle = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    setValue('handle', handle);
  };

  const onSubmit = async (data: CreateCategoryFormData) => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Category Created Successfully! 🎉',
        description: `${data.name} has been added to your categories.`
      });

      router.push('/dashboard/products/categories');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get parent categories for selection
  const parentCategories = mockCategories.filter(cat => !cat.parent_category_id);

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Category</h1>
            <p className="text-muted-foreground">Add a new product category to organize your inventory</p>
          </div>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Categories help organize your products and make them easier for customers to find. You can create hierarchical categories by setting a parent category.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Category Details
                </CardTitle>
                <CardDescription>Enter the basic information for your new category</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Category Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      Category Name
                      <Badge variant="secondary" className="text-xs">
                        Required
                      </Badge>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Electronics, Clothing, Books..."
                      {...register('name')}
                      onChange={e => {
                        register('name').onChange(e);
                        handleNameChange(e);
                      }}
                      className={cn(errors.name && 'border-destructive')}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    {watchedName && !errors.name && (
                      <p className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        Great category name!
                      </p>
                    )}
                  </div>

                  {/* Handle */}
                  <div className="space-y-2">
                    <Label htmlFor="handle" className="flex items-center gap-2">
                      URL Handle
                      <Badge variant="secondary" className="text-xs">
                        Required
                      </Badge>
                    </Label>
                    <Input id="handle" placeholder="electronics, clothing, books..." {...register('handle')} className={cn('font-mono', errors.handle && 'border-destructive')} />
                    {errors.handle && <p className="text-sm text-destructive">{errors.handle.message}</p>}
                    {watchedHandle && !errors.handle && (
                      <p className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        Handle looks good!
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">This will be used in URLs: /categories/{watchedHandle || 'your-handle'}</p>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="flex items-center gap-2">
                      Description
                      <Badge variant="outline" className="text-xs">
                        Optional
                      </Badge>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what products belong in this category..."
                      {...register('description')}
                      className={cn('min-h-[100px] resize-none', errors.description && 'border-destructive')}
                    />
                    {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                    <p className="text-sm text-muted-foreground">Help customers understand what they'll find in this category.</p>
                  </div>

                  {/* Parent Category */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Parent Category
                      <Badge variant="outline" className="text-xs">
                        Optional
                      </Badge>
                    </Label>
                    <Select onValueChange={value => setValue('parent_category_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent category (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {parentCategories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Create a subcategory by selecting a parent category.</p>
                  </div>

                  {/* Status Toggles */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                          {watchedIsActive ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-gray-500" />}
                          Active Category
                        </Label>
                        <p className="text-sm text-muted-foreground">Active categories are visible to customers</p>
                      </div>
                      <Switch checked={watchedIsActive} onCheckedChange={checked => setValue('is_active', checked)} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                          {watchedIsInternal ? <Lock className="h-4 w-4 text-orange-500" /> : <Unlock className="h-4 w-4 text-green-500" />}
                          Internal Category
                        </Label>
                        <p className="text-sm text-muted-foreground">Internal categories are only visible to admins</p>
                      </div>
                      <Switch checked={watchedIsInternal} onCheckedChange={checked => setValue('is_internal', checked)} />
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4">
                    <Button type="submit" disabled={!isValid || isSubmitting} className="flex-1">
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" />
                      {isSubmitting ? 'Creating Category...' : 'Create Category'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="font-medium">{watchedName || 'Category Name'}</div>
                  <div className="text-sm text-muted-foreground">/{watchedHandle || 'category-handle'}</div>
                  <div className="flex gap-2">
                    <Badge variant={watchedIsActive ? 'default' : 'secondary'}>{watchedIsActive ? 'Active' : 'Inactive'}</Badge>
                    {watchedIsInternal && <Badge variant="outline">Internal</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Best Practices:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Use clear, descriptive names</li>
                    <li>• Keep handles URL-friendly</li>
                    <li>• Add helpful descriptions</li>
                    <li>• Organize with parent categories</li>
                    <li>• Start with active categories</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="pt-6">
                <div className="space-y-2 text-center">
                  <div className="text-2xl font-bold">{mockCategories.length}</div>
                  <p className="text-sm text-muted-foreground">Existing categories</p>
                  <div className="text-lg font-semibold">{mockCategories.filter(cat => cat.is_active).length}</div>
                  <p className="text-xs text-muted-foreground">Currently active</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
