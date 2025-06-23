'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';

import { Sidebar } from './sidebar';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <Sidebar isCollapsed={false} onToggle={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
