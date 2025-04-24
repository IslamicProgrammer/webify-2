'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

import { Navbar } from '@/components/navbar/navbar';
import { Button } from '@/components/ui/button';
import * as m from '@/paraglide/messages';

const Home = () => {
  const { status } = useSession();

  return (
    <div>
      <Navbar />
      <section className="container mt-10 flex flex-col items-center gap-3 text-center md:absolute md:left-1/2 md:top-1/2 md:mt-0 md:-translate-x-1/2 md:-translate-y-1/2">
        <h1 className="mb-1 font-mono text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">{m.nextjs_starter_template_headline()}</h1>
        <p className="max-w-2xl text-muted-foreground">{m.nextjs_starter_template_description()}</p>

        <div className="mt-2 flex gap-4">
          {status === 'authenticated' && (
            <Button>
              <Link href="/dashboard/apps">Dashboard</Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
