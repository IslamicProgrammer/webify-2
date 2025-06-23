'use client';

/* eslint-disable no-nested-ternary */

import { useCallback, useState } from 'react';
import { AvatarImage } from '@radix-ui/react-avatar';
import { Bot, Eye, Filter, MoreHorizontal, Plus, Search, Settings, SortAsc, SortDesc, Trash2, X } from 'lucide-react';
import Link from 'next/link';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DeleteBotDialog } from '@/components/delete-bot-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import { api } from '@/trpc/react';

type SortOption = 'name' | 'createdAt' | 'updatedAt';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | 'active' | 'inactive';

export default function AppsListPage() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [status, setStatus] = useState<StatusFilter>('all');

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, error } = api.apps.getAll.useQuery({
    search: debouncedSearch,
    sortBy,
    sortOrder,
    status,
    limit: 50,
    offset: 0
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const apps = data?.apps || [];

  const total = data?.total || 0;

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

  const hasActiveFilters = search || status !== 'all' || sortBy !== 'createdAt' || sortOrder !== 'desc';

  const clearAllFilters = useCallback(() => {
    setSearch('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setStatus('all');
  }, []);

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Failed to load bots</p>
          <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <DashboardHeader title="Telegram Bots" description={`Manage your ${total} Telegram bot${total !== 1 ? 's' : ''}`} />

      <main className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* Header with Search and Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Your Bots</h2>
              <p className="text-sm text-muted-foreground">
                {total === 0 ? 'No bots created yet. Create your first bot to get started.' : `${total} bot${total !== 1 ? 's' : ''} ready to serve your customers`}
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/apps/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Bot
              </Link>
            </Button>
          </div>

          {/* Search and Filter Controls */}
          <Card className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search by bot name or token..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-9" />
                {search && (
                  <Button variant="ghost" size="sm" onClick={handleClearSearch} className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0">
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Sort Controls */}
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="createdAt">Created</SelectItem>
                    <SelectItem value="updatedAt">Updated</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm" onClick={() => toggleSort(sortBy)} className="px-3">
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>

              {/* Status Filter */}
              <Select value={status} onValueChange={(value: StatusFilter) => setStatus(value)}>
                <SelectTrigger className="w-[120px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
              )}
            </div>
          </Card>

          {/* Results */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : apps.length === 0 ? (
            search || status !== 'all' ? (
              <NoResultsState onClear={clearAllFilters} />
            ) : (
              <EmptyState />
            )
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {apps.map(app => (
                <BotCard key={app.id} app={app} avatarImg={app.imageUrl || ''} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function BotCard({ app, avatarImg }: { app: any; avatarImg?: string }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));

  return (
    <>
      <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-background to-muted/20 transition-all hover:shadow-lg hover:shadow-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                <AvatarImage src={avatarImg || ''} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 font-semibold text-primary-foreground">{getInitials(app.name)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle className="text-base leading-none">{app.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="border-green-200 bg-green-100 text-xs text-green-700">
                    <div className="mr-1 h-2 w-2 rounded-full bg-green-500" />
                    Active
                  </Badge>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/apps/${app.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/apps/${app.id}/settings`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Bot
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Bot Token */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Bot Token</span>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3">
              <code className="font-mono text-xs text-muted-foreground">{app.botToken.slice(0, 16)}...</code>
            </div>
          </div>

          {/* Description */}
          {app.description && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Description</span>
              <p className="line-clamp-2 text-sm text-foreground/80">{app.description}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm font-medium">{formatDate(app.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Status</p>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <p className="text-sm font-medium">Online</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button asChild className="w-full" variant="outline">
            <Link href={`/dashboard/apps/${app.id}`}>
              <Settings className="mr-2 h-4 w-4" />
              Manage Bot
            </Link>
          </Button>
        </CardContent>

        {/* Hover Effect */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 transition-opacity group-hover:opacity-100" />
      </Card>
      <DeleteBotDialog
        bot={{
          id: app.id,
          name: app.name,
          botToken: app.botToken
        }}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Card key={i} className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function NoResultsState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Search className="h-10 w-10 text-muted-foreground" />
        </div>

        <h3 className="mt-4 text-lg font-semibold">No bots found</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">No bots match your current search and filter criteria. Try adjusting your filters or search terms.</p>

        <Button variant="outline" onClick={onClear}>
          Clear Filters
        </Button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Bot className="h-10 w-10 text-muted-foreground" />
        </div>

        <h3 className="mt-4 text-lg font-semibold">No bots created yet</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          You haven't created any Telegram bots yet. Create your first bot to start building your e-commerce presence on Telegram.
        </p>

        <Button asChild>
          <Link href="/dashboard/apps/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Bot
          </Link>
        </Button>
      </div>
    </div>
  );
}
