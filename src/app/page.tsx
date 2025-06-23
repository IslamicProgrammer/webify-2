'use client';

/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/anchor-is-valid */

import { ArrowRight, BarChart3, Bot, Check, Palette, Shield, ShoppingCart, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

import { AnimatedGradientBg } from '@/components/animated-gradient-bg';
import { FloatingParticles } from '@/components/floating-particles';
import { Navbar } from '@/components/navbar/navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import * as m from '@/paraglide/messages';

const Home = () => {
  const { status } = useSession();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedGradientBg />
      <FloatingParticles />

      <Navbar />

      {/* Hero Section */}
      <section className="container relative z-10 mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-background/30 p-8 backdrop-blur-sm">
          <Badge variant="secondary" className="mb-4">
            🚀 The Future of Telegram Commerce
          </Badge>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Build Your Own
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Telegram </span>
            E-commerce Bot
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
            Create powerful mini web bot applications for Telegram that turn conversations into sales. No coding required - just drag, drop, and sell.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            {status === 'authenticated' ? (
              <Button size="lg" className="text-lg">
                <Link className="flex items-center justify-center" href="/dashboard/apps">
                  Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" className="text-lg">
                <Link className="flex items-center justify-center" href="/auth/signin">
                  Start Building Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
            <Button size="lg" variant="outline" className="text-lg">
              Watch Demo
            </Button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Free to start
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              No coding required
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Deploy in minutes
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold">Why Choose Our Platform?</h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Unlike traditional Telegram bots, our mini web bot applications provide rich, interactive shopping experiences
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-2 transition-colors hover:border-primary/50">
            <CardHeader>
              <Bot className="mb-2 h-12 w-12 text-blue-500" />
              <CardTitle>Mini Web Bot Technology</CardTitle>
              <CardDescription>Advanced mini web applications that run seamlessly within Telegram, offering native app-like experiences</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 transition-colors hover:border-primary/50">
            <CardHeader>
              <ShoppingCart className="mb-2 h-12 w-12 text-green-500" />
              <CardTitle>Complete E-commerce Suite</CardTitle>
              <CardDescription>Product catalogs, shopping carts, payment processing, and order management - all built for Telegram</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 transition-colors hover:border-primary/50">
            <CardHeader>
              <Zap className="mb-2 h-12 w-12 text-yellow-500" />
              <CardTitle>Lightning Fast Setup</CardTitle>
              <CardDescription>Launch your Telegram store in minutes with our intuitive drag-and-drop builder and pre-built templates</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 transition-colors hover:border-primary/50">
            <CardHeader>
              <BarChart3 className="mb-2 h-12 w-12 text-purple-500" />
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>Track sales, user behavior, and bot performance with detailed analytics and reporting tools</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 transition-colors hover:border-primary/50">
            <CardHeader>
              <Palette className="mb-2 h-12 w-12 text-pink-500" />
              <CardTitle>Full Customization</CardTitle>
              <CardDescription>Brand your bot with custom themes, colors, and layouts that match your business identity</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 transition-colors hover:border-primary/50">
            <CardHeader>
              <Shield className="mb-2 h-12 w-12 text-red-500" />
              <CardTitle>Enterprise Security</CardTitle>
              <CardDescription>Bank-level security with encrypted transactions and secure payment processing for peace of mind</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground">Get your Telegram store up and running in 3 simple steps</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-2xl font-bold text-white">1</div>
              <h3 className="mb-2 text-xl font-semibold">Design Your Store</h3>
              <p className="text-muted-foreground">Use our intuitive builder to create your product catalog, set up payment methods, and customize your bot's appearance</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-2xl font-bold text-white">2</div>
              <h3 className="mb-2 text-xl font-semibold">Deploy to Telegram</h3>
              <p className="text-muted-foreground">Connect your bot to Telegram with one click. We handle all the technical setup and hosting for you</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500 text-2xl font-bold text-white">3</div>
              <h3 className="mb-2 text-xl font-semibold">Start Selling</h3>
              <p className="text-muted-foreground">Share your bot with customers and start processing orders. Monitor sales and grow your business with our analytics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground">Start free, scale as you grow</p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="text-3xl font-bold">
                $0<span className="text-sm font-normal">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="mb-6 space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Up to 100 products
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Basic templates
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Community support
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Check className="h-4 w-4" />
                  Platform branding
                </li>
              </ul>
              <Button className="w-full" variant="outline">
                Get Started Free
              </Button>
            </CardContent>
          </Card>

          <Card className="relative border-2 border-primary">
            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">Most Popular</Badge>
            <CardHeader>
              <CardTitle className="text-2xl">Pro</CardTitle>
              <CardDescription>For growing businesses</CardDescription>
              <div className="text-3xl font-bold">
                $29<span className="text-sm font-normal">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="mb-6 space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Unlimited products
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Custom branding
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Advanced analytics
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Priority support
                </li>
              </ul>
              <Button className="w-full">Start Pro Trial</Button>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Enterprise</CardTitle>
              <CardDescription>For large organizations</CardDescription>
              <div className="text-3xl font-bold">Custom</div>
            </CardHeader>
            <CardContent>
              <ul className="mb-6 space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Everything in Pro
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  White-label solution
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Dedicated support
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Custom integrations
                </li>
              </ul>
              <Button className="w-full" variant="outline">
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">Trusted by Businesses Worldwide</h2>
            <div className="mb-4 flex items-center justify-center gap-2 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-current" />
              ))}
            </div>
            <p className="text-xl text-muted-foreground">4.9/5 from over 1,000+ happy customers</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center gap-2 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mb-4">"This platform revolutionized how we sell on Telegram. Our sales increased by 300% in just 2 months!"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                  <div>
                    <p className="font-semibold">Sarah Chen</p>
                    <p className="text-sm text-muted-foreground">E-commerce Manager</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center gap-2 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mb-4">"The mini web bot experience is incredible. Our customers love shopping directly in Telegram!"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500" />
                  <div>
                    <p className="font-semibold">Mike Rodriguez</p>
                    <p className="text-sm text-muted-foreground">Store Owner</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex items-center gap-2 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mb-4">"Setup was incredibly easy. We had our bot running in under 10 minutes. Highly recommended!"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                  <div>
                    <p className="font-semibold">Emma Thompson</p>
                    <p className="text-sm text-muted-foreground">Digital Marketer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-3xl font-bold">Ready to Transform Your Telegram Presence?</h2>
          <p className="mb-8 text-xl text-muted-foreground">Join thousands of businesses already selling successfully on Telegram with our mini web bot platform</p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            {status === 'authenticated' ? (
              <Button size="lg" className="text-lg" asChild>
                <Link href="/dashboard/apps">
                  Create Your First Bot <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" className="text-lg" asChild>
                <Link href="/auth/signin">
                  Start Building Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
            <Button size="lg" variant="outline" className="text-lg">
              Schedule Demo
            </Button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">No credit card required • Free forever plan available</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-bold">{m.app_name()}</h3>
              <p className="text-muted-foreground">The leading platform for creating Telegram mini web bot e-commerce applications.</p>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Resources</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Tutorials
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-semibold">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 {m.app_name()}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
