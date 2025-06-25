'use client';

import { Bot, Star, User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface CustomerInfoCardProps {
  customer: any;
  getInitials: (firstName?: string, lastName?: string) => string;
}

export function CustomerInfoCard({ customer, getInitials }: CustomerInfoCardProps) {
  const displayName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.username || 'Unknown User';

  const infoItems = [
    { label: 'First Name', value: customer.firstName, show: !!customer.firstName },
    { label: 'Last Name', value: customer.lastName, show: !!customer.lastName },
    { label: 'Username', value: customer.username ? `@${customer.username}` : null, show: !!customer.username },
    { label: 'Phone', value: customer.phoneNumber, show: !!customer.phoneNumber, mono: true },
    { label: 'Language', value: customer.languageCode?.toUpperCase(), show: !!customer.languageCode }
  ];

  return (
    <Card className="bg-gradient-to-br from-card to-card/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="rounded-lg bg-primary/10 p-2">
            <User className="h-5 w-5 text-primary" />
          </div>
          Customer Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="relative inline-block">
            <Avatar className="mx-auto h-24 w-24 shadow-xl ring-4 ring-primary/10">
              <AvatarImage src={customer.photoUrl || ''} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-2xl font-bold text-primary-foreground">
                {getInitials(customer?.firstName || '', customer?.lastName || '')}
              </AvatarFallback>
            </Avatar>
            {customer.isPremium && (
              <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg">
                <Star className="h-4 w-4 fill-white text-white" />
              </div>
            )}
          </div>
          <h3 className="mt-4 text-xl font-bold">{displayName}</h3>
          <div className="mt-2 flex items-center justify-center gap-2">
            {customer.isPremium && (
              <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-yellow-600">
                <Star className="mr-1 h-3 w-3 fill-current" />
                Premium
              </Badge>
            )}
            {customer.isBot && (
              <Badge variant="secondary">
                <Bot className="mr-1 h-3 w-3" />
                Bot Account
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          {infoItems
            .filter(item => item.show)
            .map((item, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={index} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 transition-colors hover:bg-muted/50">
                <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                <span className={`text-sm font-semibold ${item.mono ? 'font-mono' : ''}`}>{item.value}</span>
              </div>
            ))}

          <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
            <span className="text-sm font-medium text-muted-foreground">Account Status</span>
            <Badge variant={customer.isPremium ? 'default' : 'secondary'} className={customer.isPremium ? 'bg-gradient-to-r from-green-500 to-green-600' : ''}>
              {customer.isPremium ? 'Premium Member' : 'Standard User'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
