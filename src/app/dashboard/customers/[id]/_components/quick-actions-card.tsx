'use client';

import { Bot, ExternalLink, MessageSquare, Share2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuickActionsCardProps {
  customer: any;
  onSendMessage: () => void;
}

export function QuickActionsCard({ customer, onSendMessage }: QuickActionsCardProps) {
  return (
    <Card className="bg-gradient-to-br from-card to-card/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={onSendMessage} className="w-full justify-start bg-gradient-to-r from-primary to-primary/90 shadow-md hover:from-primary/90 hover:to-primary">
          <MessageSquare className="mr-3 h-4 w-4" />
          Send Message
        </Button>
        <Button variant="outline" className="flex w-full justify-start hover:bg-muted/80">
          <Link className="flex w-full items-center" href={`/dashboard/apps/${customer.app.id}`}>
            <Bot className="mr-3 h-4 w-4" />
            View Bot Details
            <ExternalLink className="ml-auto h-3 w-3" />
          </Link>
        </Button>
        <Button variant="outline" className="w-full justify-start hover:bg-muted/80">
          <Share2 className="mr-3 h-4 w-4" />
          Share Profile
        </Button>
      </CardContent>
    </Card>
  );
}
