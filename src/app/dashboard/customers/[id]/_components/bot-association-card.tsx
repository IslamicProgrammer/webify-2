'use client';

import { Bot, ExternalLink, Settings } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BotAssociationCardProps {
  customer: any;
}

export function BotAssociationCard({ customer }: BotAssociationCardProps) {
  return (
    <Card className="bg-gradient-to-br from-card to-card/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="rounded-lg bg-blue-500/10 p-2">
            <Bot className="h-5 w-5 text-blue-600" />
          </div>
          Associated Bot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 rounded-xl border bg-gradient-to-r from-muted/50 to-muted/30 p-4 transition-all duration-200 hover:from-muted/60 hover:to-muted/40">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold">{customer.app.name}</p>
            <p className="font-mono text-sm text-muted-foreground">/{customer.app.slug}</p>
          </div>
          <Button variant="outline" size="sm" asChild className="shrink-0 hover:bg-background/80">
            <Link href={`/dashboard/apps/${customer.app.id}`}>
              <Settings className="mr-2 h-4 w-4" />
              Manage
              <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
