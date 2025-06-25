'use client';

import { ArrowLeft, Bot, MessageSquare, MoreHorizontal, Share2, Star } from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

interface CustomerHeaderProps {
  customer: any;
  onSendMessage: () => void;
  getInitials: (firstName?: string, lastName?: string) => string;
}

export function CustomerHeader({ customer, onSendMessage, getInitials }: CustomerHeaderProps) {
  const displayName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.username || 'Unknown User';

  return (
    <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="hover:bg-muted/80">
              <Link className="flex items-center" href="/dashboard/customers">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Customers
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-12 w-12 shadow-lg ring-2 ring-primary/20">
                  <AvatarImage src={customer.photoUrl || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-primary via-primary to-primary/80 text-lg font-semibold text-primary-foreground">
                    {getInitials(customer?.firstName || '', customer?.lastName || '')}
                  </AvatarFallback>
                </Avatar>
                {customer.isPremium && (
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500">
                    <Star className="h-3 w-3 fill-white text-white" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-2xl font-bold">{displayName}</h1>
                <div className="mt-1 flex items-center gap-3">
                  {customer.username && <p className="text-sm font-medium text-muted-foreground">@{customer.username}</p>}
                  {customer.isPremium && (
                    <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-xs hover:from-yellow-600 hover:to-yellow-700">
                      <Star className="mr-1 h-3 w-3 fill-current" />
                      Premium
                    </Badge>
                  )}
                  {customer.isBot && (
                    <Badge variant="secondary" className="text-xs">
                      <Bot className="mr-1 h-3 w-3" />
                      Bot
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={onSendMessage} className="bg-gradient-to-r from-primary to-primary/90 shadow-lg hover:from-primary/90 hover:to-primary">
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Message
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hover:bg-muted/80">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={onSendMessage}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/apps/${customer.app.id}`}>
                    <Bot className="mr-2 h-4 w-4" />
                    View Bot Details
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
  );
}
