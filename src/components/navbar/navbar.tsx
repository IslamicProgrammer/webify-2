'use client';

// eslint-disable-next-line import/order
import { useSession } from 'next-auth/react';

import { LanguageSwitcher } from './language-switcher';

import { SignInButton } from '@/components/navbar/sign-in-button';
import { UserDropdown } from '@/components/navbar/user-dropdown';
import { Link } from '@/lib/i18n';
import * as m from '@/paraglide/messages';

export const Navbar = () => {
  const { data } = useSession();

  return (
    <header className="w-full border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-mono text-lg font-bold">
          {m.app_name()}
        </Link>
        <div className="flex items-center gap-2">
          {data ? <UserDropdown session={data} /> : <SignInButton />}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};
