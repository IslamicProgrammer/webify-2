'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Robot, User } from 'tabler-icons-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard/apps', label: 'Apps', icon: Robot },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/users', label: 'Users', icon: User }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen min-h-screen">
      <aside className="w-64 bg-background p-6">
        <h2 className="mb-6 text-2xl font-bold">
          <Link href="/">Dashboard</Link>
        </h2>
        <nav className="space-y-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname?.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  buttonVariants({ variant: isActive ? 'secondary' : 'ghost', size: 'default' }),
                  'flex w-full items-center justify-start gap-3',
                  isActive && 'font-semibold'
                )}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="h-screen flex-1 overflow-auto bg-background/20">{children}</div>
    </div>
  );
}
