/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  Bot,
  Calendar,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  Key,
  MessageSquare,
  MoreHorizontal,
  Settings,
  Share2,
  Shield,
  Trash2,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import SendMessageButton from './SendMessage';

import { DeleteBotDialog } from '@/components/delete-bot-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getBotAvatarsFromTokens } from '@/lib/get-bot-image';
import { api } from '@/trpc/react';

interface BotDetailContentProps {
  id: string;
}

export function BotDetailContent({ id }: BotDetailContentProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({});
  const [avatar, setAvatar] = useState<string>('');

  const { data: app } = api.apps.getById.useQuery({ id }) || {};
  const updateMutation = api.apps.update.useMutation();

  // Get bot username from token
  const botUsername = app?.botToken.split(':')[0];

  // Mock data for demonstration - replace with real data
  const botStats = {
    totalUsers: 1247,
    activeUsers: 892,
    messagesCount: 15420,
    uptime: '99.9%',
    lastActive: new Date()
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

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

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => ({ ...prev, [label]: true }));
      setTimeout(() => {
        setCopiedItems(prev => ({ ...prev, [label]: false }));
      }, 2000);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDeleteSuccess = () => {
    toast.success('Bot deleted successfully');
    router.push('/dashboard/apps');
  };

  useEffect(() => {
    async function fetchData() {
      const fetchedAvatars = await getBotAvatarsFromTokens([app?.botToken || '']);

      setAvatar(fetchedAvatars[0].image || '');
      if (app) {
        updateMutation.mutate({
          id: app.id,
          imageUrl: fetchedAvatars[0].image || '',
          botToken: app.botToken,
          name: app.name,
          slug: app.slug
        });
      }
    }

    fetchData();
  }, []);

  if (!app) return <div className="p-6">Loading...</div>;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link className="flex items-center" href="/dashboard/apps">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Bots
                  </Link>
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                    <AvatarImage src={avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 font-semibold text-primary-foreground">{getInitials(app.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-xl font-bold">{app.name}</h1>
                    <p className="text-sm text-muted-foreground">@{botUsername}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="border-green-200 bg-green-100 text-green-700">
                  <div className="mr-1 h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  Online
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/apps/${app.id}/settings`}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyToClipboard(`https://t.me/${botUsername}`, 'Bot Link')}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Bot
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteDialogOpen(true)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Bot
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
            {/* Left Column - Stats & Quick Actions */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                      <div className="text-2xl font-bold text-primary">{botStats.totalUsers.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Total Users</div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">{botStats.activeUsers.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Active Users</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">{botStats.messagesCount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Messages</div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                      <div className="text-2xl font-bold text-emerald-600">{botStats.uptime}</div>
                      <div className="text-xs text-muted-foreground">Uptime</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <SendMessageButton slug={app.slug} botToken={app.botToken} botId={app.id} />

                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a className="flex items-center" href={`https://t.me/${botUsername}`} target="_blank" rel="noopener noreferrer">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Open in Telegram
                      <ExternalLink className="ml-auto h-4 w-4" />
                    </a>
                  </Button>

                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link className="flex items-center" href={`/dashboard/apps/${app.id}/analytics`}>
                      <Activity className="mr-2 h-4 w-4" />
                      View Analytics
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link className="flex items-center" href={`/dashboard/apps/${app.id}/settings`}>
                      <Settings className="mr-2 h-4 w-4" />
                      Bot Settings
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Bot Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge variant="secondary" className="border-green-200 bg-green-100 text-green-700">
                      <div className="mr-1 h-2 w-2 rounded-full bg-green-500" />
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Active</span>
                    <span className="text-sm text-muted-foreground">{formatRelativeTime(botStats.lastActive)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Webhook</span>
                    <Badge variant={app.webhookUrl ? 'default' : 'secondary'}>{app.webhookUrl ? 'Configured' : 'Not Set'}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Detailed Information */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="configuration">Configuration</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="logs">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Bot Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        Bot Information
                      </CardTitle>
                      <CardDescription>Basic information about your Telegram bot</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Bot Name</label>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">{app.name}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Bot Username</label>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">@{botUsername}</span>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`@${botUsername}`, 'Bot Username')} className="h-6 w-6 p-0">
                              {copiedItems['Bot Username'] ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Bot Token</label>
                        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
                          <Key className="h-4 w-4 text-muted-foreground" />
                          <code className="flex-1 font-mono text-sm">{app.botToken.slice(0, 20)}•••••••••••••••</code>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(app.botToken, 'Bot Token')} className="h-6 w-6 p-0">
                            {copiedItems['Bot Token'] ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>

                      {/* {app?.description && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Description</label>
                          <p className="text-sm leading-relaxed">{app.description}</p>
                        </div>
                      )} */}

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Created</label>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(app.createdAt)}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(app.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* URLs and Links */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        URLs & Links
                      </CardTitle>
                      <CardDescription>External links and webhook configuration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Telegram Link</label>
                        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1 font-mono text-sm">https://t.me/{botUsername}</span>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`https://t.me/${botUsername}`, 'Telegram Link')} className="h-6 w-6 p-0">
                            {copiedItems['Telegram Link'] ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>

                      {app.webhookUrl && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Webhook URL</label>
                          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span className="flex-1 font-mono text-sm">{app.webhookUrl}</span>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(app.webhookUrl!, 'Webhook URL')} className="h-6 w-6 p-0">
                              {copiedItems['Webhook URL'] ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                        </div>
                      )}

                      {app.miniAppUrl && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Mini App URL</label>
                          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            <a href={app.miniAppUrl} target="_blank" rel="noopener noreferrer" className="flex-1 font-mono text-sm text-primary hover:underline">
                              {app.miniAppUrl}
                            </a>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(app.miniAppUrl!, 'Mini App URL')} className="h-6 w-6 p-0">
                              {copiedItems['Mini App URL'] ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="configuration" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Bot Configuration</CardTitle>
                      <CardDescription>Configure your bot settings and behavior</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="py-8 text-center">
                        <Settings className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-semibold">Configuration Panel</h3>
                        <p className="mb-4 text-muted-foreground">Advanced bot configuration options will be available here.</p>
                        <Button asChild>
                          <Link href={`/dashboard/apps/${app.id}/settings`}>
                            <Settings className="mr-2 h-4 w-4" />
                            Open Settings
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Analytics & Insights</CardTitle>
                      <CardDescription>Track your bot's performance and user engagement</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="py-8 text-center">
                        <Activity className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-semibold">Analytics Dashboard</h3>
                        <p className="mb-4 text-muted-foreground">Detailed analytics and performance metrics will be displayed here.</p>
                        <Button asChild>
                          <Link href={`/dashboard/apps/${app.id}/analytics`}>
                            <Activity className="mr-2 h-4 w-4" />
                            View Full Analytics
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="logs" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Activity Logs</CardTitle>
                      <CardDescription>Recent bot activity and system logs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="py-8 text-center">
                        <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-semibold">Activity Logs</h3>
                        <p className="mb-4 text-muted-foreground">Bot activity logs and message history will be shown here.</p>
                        <Button variant="outline">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          View Logs
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

      <DeleteBotDialog
        bot={{
          id: app.id,
          name: app.name,
          botToken: app.botToken
        }}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
