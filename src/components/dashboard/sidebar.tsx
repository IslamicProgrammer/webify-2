'use client';

import { useState } from 'react';
import { BarChart3, Bell, Bot, ChevronDown, ChevronLeft, ChevronRight, HelpCircle, LayoutDashboard, Package, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SubNavItem {
  href: string;
  label: string;
  badge?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  subItems?: SubNavItem[];
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    href: '/dashboard/apps',
    label: 'Bots',
    icon: Bot,
    badge: '3'
  },
  {
    href: '/dashboard/customers',
    label: 'Customers',
    icon: Users,
    badge: '24'
  },
  {
    href: '/dashboard/products',
    label: 'Products',
    icon: Package,
    badge: '12',
    subItems: [
      {
        href: '/dashboard/products/categories',
        label: 'Categories',
        badge: '8'
      },
      {
        href: '/dashboard/products/inventory',
        label: 'Inventory'
      },
      {
        href: '/dashboard/products/pricing',
        label: 'Pricing'
      }
    ]
  },
  {
    href: '/dashboard/analytics',
    label: 'Analytics',
    icon: BarChart3
  },
  {
    href: '/dashboard/notifications',
    label: 'Notifications',
    icon: Bell,
    badge: '2'
  }
];

const bottomNavItems: NavItem[] = [
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings
  },
  {
    href: '/dashboard/support',
    label: 'Support',
    icon: HelpCircle
  }
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => (prev.includes(href) ? prev.filter(item => item !== href) : [...prev, href]));
  };

  const isItemExpanded = (href: string) => expandedItems.includes(href);

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = isItemExpanded(item.href);

    return (
      <div key={item.href}>
        <div
          className={cn(
            'group relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          )}
          onClick={() => {
            if (hasSubItems && !isCollapsed) {
              toggleExpanded(item.href);
            }
          }}
        >
          <Link
            href={item.href}
            className="flex flex-1 items-center gap-3"
            onClick={e => {
              if (hasSubItems && !isCollapsed) {
                e.preventDefault();
              }
            }}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </Link>

          {/* Expand/Collapse chevron for items with sub-navigation */}
          {hasSubItems && !isCollapsed && <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />}

          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full z-50 ml-2 rounded-md bg-popover px-2 py-1 text-sm text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100">
              {item.label}
              {item.badge && (
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                  {item.badge}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Sub-navigation items */}
        {hasSubItems && !isCollapsed && isExpanded && (
          <div className="ml-6 mt-1 space-y-1">
            {item.subItems!.map(subItem => {
              const isSubActive = pathname === subItem.href;

              return (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isSubActive ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground'
                  )}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-current opacity-40" />
                  <span className="flex-1 truncate">{subItem.label}</span>
                  {subItem.badge && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {subItem.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('relative flex h-screen flex-col border-r bg-background transition-all duration-300 ease-in-out', isCollapsed ? 'w-16' : 'w-64')}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">TeleBot</span>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={onToggle} className="h-8 w-8 p-0">
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">{navItems.map(renderNavItem)}</nav>

      {/* Bottom Navigation */}
      <div className="border-t p-2">
        {bottomNavItems.map(item => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full z-50 ml-2 rounded-md bg-popover px-2 py-1 text-sm text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="border-t p-2">
        <div className={cn('flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent', isCollapsed && 'justify-center')}>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">John Doe</p>
              <p className="truncate text-xs text-muted-foreground">john@example.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
