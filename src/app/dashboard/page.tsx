'use client';

import { BarChart3, Bot, DollarSign, Plus, TrendingUp, Users } from 'lucide-react';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
  {
    title: 'Total Bots',
    value: '12',
    change: '+2 from last month',
    icon: Bot,
    trend: 'up'
  },
  {
    title: 'Active Users',
    value: '2,847',
    change: '+12% from last month',
    icon: Users,
    trend: 'up'
  },
  {
    title: 'Revenue',
    value: '$8,429',
    change: '+8% from last month',
    icon: DollarSign,
    trend: 'up'
  },
  {
    title: 'Conversion Rate',
    value: '3.2%',
    change: '+0.5% from last month',
    icon: TrendingUp,
    trend: 'up'
  }
];

const recentActivity = [
  {
    id: 1,
    title: 'New order received',
    description: 'Bot #3 processed a new order',
    time: '2 minutes ago',
    type: 'order'
  },
  {
    id: 2,
    title: 'Bot deployed',
    description: 'Store Bot v2.1 is now live',
    time: '1 hour ago',
    type: 'deployment'
  },
  {
    id: 3,
    title: 'User registered',
    description: 'New customer signed up via Bot #1',
    time: '3 hours ago',
    type: 'user'
  },
  {
    id: 4,
    title: 'Payment processed',
    description: '$127.50 payment completed',
    time: '5 hours ago',
    type: 'payment'
  }
];

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader title="Dashboard" description="Welcome back! Here's what's happening with your bots." />

      <main className="flex-1 overflow-auto p-6">
        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map(stat => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your bots and customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Button className="h-auto justify-start p-4" variant="outline">
                  <Plus className="mr-3 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Create New Bot</div>
                    <div className="text-sm text-muted-foreground">Set up a new Telegram bot</div>
                  </div>
                </Button>
                <Button className="h-auto justify-start p-4" variant="outline">
                  <BarChart3 className="mr-3 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">View Analytics</div>
                    <div className="text-sm text-muted-foreground">Check performance metrics</div>
                  </div>
                </Button>
                <Button className="h-auto justify-start p-4" variant="outline">
                  <Users className="mr-3 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Manage Customers</div>
                    <div className="text-sm text-muted-foreground">View and manage users</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
