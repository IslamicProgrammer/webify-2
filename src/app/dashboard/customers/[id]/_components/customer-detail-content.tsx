'use client';

import { useState } from 'react';
import { MessageSquare, Settings } from 'lucide-react';

import { BotAssociationCard } from './bot-association-card';
import { ContactInfoCard } from './contact-info-card';
import { CustomerHeader } from './customer-header';
import { CustomerInfoCard } from './customer-info-card';
import { QuickActionsCard } from './quick-actions-card';
import { TimelineCard } from './timeline-card';

import { SendMessageDialog } from '@/components/send-message-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/trpc/react';

interface CustomerDetailContentProps {
  id: string;
}

export function CustomerDetailContent({ id }: CustomerDetailContentProps) {
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  const { data: customer, isLoading } = api.customers.getById.useQuery({ id }) || {};

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/10">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted-foreground">Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/10">
        <div className="space-y-4 text-center">
          <p className="text-lg font-semibold">Customer not found</p>
          <p className="text-muted-foreground">The requested customer could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
        <CustomerHeader customer={customer} onSendMessage={() => setMessageDialogOpen(true)} getInitials={getInitials} />

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Sidebar */}
            <div className="space-y-6">
              <CustomerInfoCard customer={customer} getInitials={getInitials} />
              <BotAssociationCard customer={customer} />
              <QuickActionsCard customer={customer} onSendMessage={() => setMessageDialogOpen(true)} />
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    Activity
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    Settings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <TimelineCard customer={customer} formatDate={formatDate} formatRelativeTime={formatRelativeTime} />
                  <ContactInfoCard customer={customer} />
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
                  <Card className="bg-gradient-to-br from-card to-card/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="rounded-lg bg-blue-500/10 p-2">
                          <MessageSquare className="h-5 w-5 text-blue-600" />
                        </div>
                        Activity History
                      </CardTitle>
                      <CardDescription>Customer interactions and engagement timeline</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="py-12 text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
                          <MessageSquare className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="mb-3 text-xl font-semibold">Activity Tracking</h3>
                        <p className="mx-auto mb-6 max-w-md text-muted-foreground">Detailed activity tracking and interaction history will be available here in future updates.</p>
                        <Button variant="outline" onClick={() => setMessageDialogOpen(true)}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Start Conversation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <Card className="bg-gradient-to-br from-card to-card/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="rounded-lg bg-orange-500/10 p-2">
                          <Settings className="h-5 w-5 text-orange-600" />
                        </div>
                        Customer Management
                      </CardTitle>
                      <CardDescription>Advanced settings and customer preferences</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="py-12 text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
                          <Settings className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="mb-3 text-xl font-semibold">Advanced Management</h3>
                        <p className="mx-auto mb-6 max-w-md text-muted-foreground">Comprehensive customer management tools and preference settings will be available here.</p>
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
