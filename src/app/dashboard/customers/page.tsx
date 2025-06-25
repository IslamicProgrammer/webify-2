'use client';

import { useCallback, useState } from 'react';
import { Download, Filter, MessageSquare, MoreHorizontal, Plus, Search, SortAsc, SortDesc, Users, X } from 'lucide-react';
import Link from 'next/link';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { SendMessageDialog } from '@/components/send-message-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import { api } from '@/trpc/react';

type SortOption = 'firstName' | 'lastName' | 'createdAt' | 'phoneNumber' | 'username';
type SortOrder = 'asc' | 'desc';
type PremiumFilter = 'all' | 'premium' | 'regular';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [premiumFilter, setPremiumFilter] = useState<PremiumFilter>('all');
  const [selectedApp, setSelectedApp] = useState<string>('all');
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const debouncedSearch = useDebounce(search, 300);

  // Get user's apps for filtering
  const { data: appsData } = api.apps.getAll.useQuery({
    limit: 100,
    offset: 0
  });

  const { data: customersData, isLoading, error } = api.customers.getAll.useQuery({
    search: debouncedSearch,
    sortBy,
    sortOrder,
    isPremium: premiumFilter === 'all' ? undefined : premiumFilter === 'premium',
    appId: selectedApp === 'all' ? undefined : selectedApp,
    limit: 50,
    offset: 0
  });

  const { data: stats } = api.customers.getStats.useQuery();

  const customers = customersData?.customers || [];
  const total = customersData?.total || 0;

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

  const hasActiveFilters = search || premiumFilter !== 'all' || selectedApp !== 'all' || sortBy !== 'createdAt' || sortOrder !== 'desc';

  const clearAllFilters = useCallback(() => {
    setSearch('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPremiumFilter('all');
    setSelectedApp('all');
  }, []);

  const handleSendMessage = (customer: any) => {
    setSelectedCustomer(customer);
    setMessageDialogOpen(true);
  };

  const handleExportData = async () => {
    try {
      const exportData = await api.customers.exportData.query({
        format: 'csv',
        appId: selectedApp === 'all' ? undefined : selectedApp
      });

      // Convert to CSV
      const csvContent = convertToCSV(exportData.customers);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `customers-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const convertToCSV = (data: any[]) => {
    const headers = ['First Name', 'Last Name', 'Username', 'Phone Number', 'Premium', 'Bot Name', 'Language', 'Created At'];
    const csvRows = [headers.join(',')];

    data.forEach(customer => {
      const row = [
        customer.firstName || '',
        customer.lastName || '',
        customer.username || '',
        customer.phoneNumber || '',
        customer.isPremium ? 'Yes' : 'No',
        customer.app.name,
        customer.languageCode || '',
        new Date(customer.createdAt).toLocaleDateString()
      ];
      csvRows.push(row.map(field => `"${field}"`).join(','));
    });

    return csvRows.join('\n');
  };

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Failed to load customers</p>
          <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <DashboardHeader title="Customers" description={`Manage your ${total} customer${total !== 1 ? 's' : ''} across all bots`} />

      <main className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                  <p className="text-xs text-muted-foreground">+{stats.recentSignups} in last 30 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Premium Customers</CardTitle>
                  <Badge className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.premiumCustomers}</div>
                  <p className="text-xs text-muted-foreground">{stats.totalCustomers > 0 ? Math.round((stats.premiumCustomers / stats.totalCustomers) * 100) : 0}% of total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Regular Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.regularCustomers}</div>
                  <p className="text-xs text-muted-foreground">{stats.totalCustomers > 0 ? Math.round((stats.regularCustomers / stats.totalCustomers) * 100) : 0}% of total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recent Signups</CardTitle>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.recentSignups}</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Header with Search and Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Customer List</h2>
              <p className="text-sm text-muted-foreground">
                {total === 0 ? 'No customers found.' : `${total} customer${total !== 1 ? 's' : ''} found`}
              </p>
            </div>
            <Button onClick={handleExportData} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>

          {/* Search and Filter Controls */}
          <Card className="p-4">
            <div className="flex flex-col gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search by name, username, or phone..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-9" />
                {search && (
                  <Button variant="ghost" size="sm" onClick={handleClearSearch} className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0">
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Sort Controls */}
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="firstName">First Name</SelectItem>
                    <SelectItem value="lastName">Last Name</SelectItem>
                    <SelectItem value="username">Username</SelectItem>
                    <SelectItem value="phoneNumber">Phone</SelectItem>
                    <SelectItem value="createdAt">Created</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm" onClick={() => toggleSort(sortBy)} className="px-3">
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>

                {/* Premium Filter */}
                <Select value={premiumFilter} onValueChange={(value: PremiumFilter) => setPremiumFilter(value)}>
                  <SelectTrigger className="w-[120px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                  </SelectContent>
                </Select>

                {/* App Filter */}
                <Select value={selectedApp} onValueChange={setSelectedApp}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Bots" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bots</SelectItem>
                    {appsData?.apps.map(app => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Results */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : customers.length === 0 ? (
            search || premiumFilter !== 'all' || selectedApp !== 'all' ? (
              <NoResultsState onClear={clearAllFilters} />
            ) : (
              <EmptyState />
            )
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {customers.map(customer => (
                <CustomerCard key={customer.id} customer={customer} onSendMessage={handleSendMessage} />
              ))}
            </div>
          )}
        </div>
      </main>

      <SendMessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
        customer={selectedCustomer}
        onSuccess={() => {
          setMessageDialogOpen(false);
          setSelectedCustomer(null);
        }}
      />
    </>
  );
}

function CustomerCard({ customer, onSendMessage }: { customer: any; onSendMessage: (customer: any) => void }) {
  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));

  const displayName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.username || 'Unknown User';

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-background to-muted/20 transition-all hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-primary/10">
              <AvatarImage src={customer.photoUrl || ''} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 font-semibold text-primary-foreground">
                {getInitials(customer.firstName, customer.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-base leading-none">{displayName}</CardTitle>
              <div className="flex items-center gap-2">
                {customer.isPremium && (
                  <Badge variant="default" className="text-xs">
                    Premium
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  {customer.app.name}
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
                <Link href={`/dashboard/customers/${customer.id}`}>View Details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSendMessage(customer)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Message
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Contact Info */}
        <div className="space-y-2">
          {customer.username && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Username:</span>
              <span className="font-mono">@{customer.username}</span>
            </div>
          )}
          {customer.phoneNumber && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-mono">{customer.phoneNumber}</span>
            </div>
          )}
          {customer.languageCode && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Language:</span>
              <span className="uppercase">{customer.languageCode}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Joined</p>
            <p className="text-sm font-medium">{formatDate(customer.createdAt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="flex items-center gap-1">
              <div className={`h-2 w-2 rounded-full ${customer.isPremium ? 'bg-yellow-500' : 'bg-green-500'}`} />
              <p className="text-sm font-medium">{customer.isPremium ? 'Premium' : 'Regular'}</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button onClick={() => onSendMessage(customer)} className="w-full" variant="outline">
          <MessageSquare className="mr-2 h-4 w-4" />
          Send Message
        </Button>
      </CardContent>

      {/* Hover Effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 transition-opacity group-hover:opacity-100" />
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
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

        <h3 className="mt-4 text-lg font-semibold">No customers found</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">No customers match your current search and filter criteria. Try adjusting your filters or search terms.</p>

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
          <Users className="h-10 w-10 text-muted-foreground" />
        </div>

        <h3 className="mt-4 text-lg font-semibold">No customers yet</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          You don't have any customers yet. Once users start interacting with your Telegram bots, they'll appear here.
        </p>

        <Button asChild>
          <Link href="/dashboard/apps">
            <Plus className="mr-2 h-4 w-4" />
            Manage Your Bots
          </Link>
        </Button>
      </div>
    </div>
  );
}