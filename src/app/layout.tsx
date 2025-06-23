import { PropsWithChildren } from 'react';
import { LanguageProvider } from '@inlang/paraglide-next';
import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { Toaster as SonnerToaster } from 'sonner';

import '@/styles/globals.css';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { siteConfig } from '@/lib/constant';
import { fonts } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { languageTag } from '@/paraglide/runtime.js';
import { TRPCReactProvider } from '@/trpc/react';

export const generateMetadata = (): Metadata => ({
  metadataBase: new URL(siteConfig.url()),
  title: {
    default: siteConfig.title(),
    template: `%s | ${siteConfig.title()}`
  },
  description: siteConfig.description(),
  keywords: siteConfig.keywords(),
  robots: { index: true, follow: true },
  icons: {
    icon: '/favicon/favicon.ico',
    shortcut: '/favicon/favicon-16x16.png',
    apple: '/favicon/apple-touch-icon.png'
  },
  verification: {
    google: siteConfig.googleSiteVerificationId()
  },
  openGraph: {
    url: siteConfig.url(),
    title: siteConfig.title(),
    description: siteConfig.description(),
    siteName: siteConfig.title(),
    images: '/opengraph-image.png',
    type: 'website',
    locale: languageTag()
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title(),
    description: siteConfig.description(),
    images: '/opengraph-image.png'
  }
});

const RootLayout = ({ children }: PropsWithChildren) => (
  <html lang={languageTag()} suppressHydrationWarning>
    <body className={cn('min-h-screen font-sans', fonts)}>
      <LanguageProvider>
        <ThemeProvider attribute="class">
          <SessionProvider>
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </SessionProvider>
          <Toaster />
          <SonnerToaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))'
              }
            }}
          />
        </ThemeProvider>
      </LanguageProvider>
    </body>
  </html>
);

export default RootLayout;
