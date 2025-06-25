'use client';

import { Calendar, Clock, Star, User } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TimelineCardProps {
  customer: any;
  formatDate: (date: Date) => string;
  formatRelativeTime: (date: Date) => string;
}

export function TimelineCard({ customer, formatDate, formatRelativeTime }: TimelineCardProps) {
  const timelineEvents = [
    {
      icon: User,
      title: 'Customer Joined',
      description: 'Account created and onboarded',
      date: customer.createdAt,
      color: 'green'
    },
    ...(customer.isPremium
      ? [
          {
            icon: Star,
            title: 'Upgraded to Premium',
            description: 'Premium features unlocked',
            date: customer.createdAt, // This would be the upgrade date in real scenario
            color: 'yellow'
          }
        ]
      : [])
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
      yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400',
      blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
    };

    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="rounded-lg bg-purple-500/10 p-2">
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          Customer Timeline
        </CardTitle>
        <CardDescription>Important milestones and events</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {timelineEvents.map((event, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index} className="relative flex items-start gap-4">
            {index < timelineEvents.length - 1 && <div className="absolute left-4 top-8 h-8 w-0.5 bg-border" />}
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${getColorClasses(event.color)} shadow-sm`}>
              <event.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <p className="font-semibold">{event.title}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(event.date)}
                </div>
              </div>
              <p className="mb-1 text-sm text-muted-foreground">{event.description}</p>
              <p className="font-mono text-xs text-muted-foreground">{formatDate(event.date)}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
