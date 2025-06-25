'use client';

import { useState } from 'react';
import { ArrowLeft, Bot, Calendar, MessageSquare, MoreHorizontal, Phone, Settings, Share2, Star, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { SendMessageDialog } from '@/components/send-message-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/trpc/react';

interface CustomerDetailContentProps {
  id: string;
}

export function CustomerDetailContent({ id }: CustomerDetailContentProps) {
  const router = useRouter();
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  const { data: customer } = api.customers.getById.useQuery({ id }) || {};

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';

    return (first + last).toUpperCase() || '?';
  };

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!customer) return <div className="p-6">Loading...</div>;

  const displayName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.username || 'Unknown User';

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link className="flex items-center" href="/dashboard/customers">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Customers
                  </Link>
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                    <AvatarImage src={customer.photoUrl || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 font-semibold text-primary-foreground">
                      {getInitials(customer.firstName, customer.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-xl font-bold">{displayName}</h1>
                    <div className="flex items-center gap-2">
                      {customer.username && <p className="text-sm text-muted-foreground">@{customer.username}</p>}
                      {customer.isPremium && (
                        <Badge variant="default" className="text-xs">
                          <Star className="mr-1 h-3 w-3" />
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={() => setMessageDialogOpen(true)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setMessageDialogOpen(true)}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send Message
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/apps/${customer.app.id}`}>
                        <Bot className="mr-2 h-4 w-4" />
                        View Bot
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Profile
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Customer Info */}
            <div className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <Avatar className="mx-auto h-20 w-20 ring-4 ring-primary/10">
                      <AvatarImage src={customer.photoUrl || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-xl font-semibold text-primary-foreground">
                        {getInitials(customer.firstName, customer.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="mt-3 text-lg font-semibold">{displayName}</h3>
                    {customer.username && <p className="text-muted-foreground">@{customer.username}</p>}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    {customer.firstName && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">First Name</span>
                        <span className="text-sm font-medium">{customer.firstName}</span>
                      </div>
                    )}
                    {customer.lastName && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last Name</span>
                        <span className="text-sm font-medium">{customer.lastName}</span>
                      </div>
                    )}
                    {customer.phoneNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Phone</span>
                        <span className="font-mono text-sm">{customer.phoneNumber}</span>
                      </div>
                    )}
                    {customer.languageCode && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Language</span>
                        <span className="text-sm uppercase">{customer.languageCode}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Account Type</span>
                      <Badge variant={customer.isPremium ? 'default' : 'secondary'}>{customer.isPremium ? 'Premium' : 'Regular'}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Bot User</span>
                      <Badge variant={customer.isBot ? 'destructive' : 'secondary'}>{customer.isBot ? 'Bot Account' : 'Human'}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bot Association */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    Associated Bot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{customer.app.name}</p>
                      <p className="text-sm text-muted-foreground">/{customer.app.slug}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/apps/${customer.app.id}`}>
                        <Settings className="mr-2 h-4 w-4" />
                        Manage
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={() => setMessageDialogOpen(true)} className="w-full justify-start">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href={`/dashboard/apps/${customer.app.id}`}>
                      <Bot className="mr-2 h-4 w-4" />
                      View Bot Details
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Profile
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Detailed Information */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Timeline
                      </CardTitle>
                      <CardDescription>Customer journey and important dates</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                          <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Customer Joined</p>
                          <p className="text-sm text-muted-foreground">{formatDate(customer.createdAt)}</p>
                          <p className="text-xs text-muted-foreground">{formatRelativeTime(customer.createdAt)}</p>
                        </div>
                      </div>

                      {customer.isPremium && (
                        <div className="flex items-start gap-4">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                            <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Upgraded to Premium</p>
                            <p className="text-sm text-muted-foreground">Premium features unlocked</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        Contact Information
                      </CardTitle>
                      <CardDescription>How to reach this customer</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Telegram Username</label>
                          <div className="rounded-lg border bg-muted/50 p-3">
                            <span className="font-mono text-sm">{customer.username ? `@${customer.username}` : 'Not provided'}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                          <div className="rounded-lg border bg-muted/50 p-3">
                            <span className="font-mono text-sm">{customer.phoneNumber || 'Not provided'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Preferred Language</label>
                        <div className="rounded-lg border bg-muted/50 p-3">
                          <span className="text-sm">{customer.languageCode ? customer.languageCode.toUpperCase() : 'Not specified'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Activity History</CardTitle>
                      <CardDescription>Customer interactions and engagement history</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="py-8 text-center">
                        <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-semibold">Activity Tracking</h3>
                        <p className="mb-4 text-muted-foreground">Activity tracking and interaction history will be available here in future updates.</p>
                        <Button variant="outline">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Send Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Settings</CardTitle>
                      <CardDescription>Manage customer preferences and settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="py-8 text-center">
                        <Settings className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-semibold">Customer Management</h3>
                        <p className="mb-4 text-muted-foreground">Advanced customer management features will be available here.</p>
                        <Button variant="outline">
                          <Settings className="mr-2 h-4 w-4" />
                          Configure Settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <SendMessageDialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen} customer={customer} onSuccess={() => setMessageDialogOpen(false)} />
    </>
  );
}
