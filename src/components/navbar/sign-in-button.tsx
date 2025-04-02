'use client';

import { useTransition } from 'react';
import { signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import * as m from '@/paraglide/messages';

export const SignInButton = () => {
  const [isPending, startTransition] = useTransition();

  const handleSignIn = () => {
    startTransition(async () => {
      await signIn('google');
    });
  };

  return (
    <Button onClick={handleSignIn} loading={isPending}>
      {m.sign_in()}
    </Button>
  );
};
