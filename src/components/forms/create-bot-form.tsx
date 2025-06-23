'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, CheckCircle, ExternalLink, HelpCircle, ImageIcon, Info, Loader2, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { type CreateBotFormData, createBotSchema } from '@/lib/validations/bot';

export function CreateBotForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<CreateBotFormData>({
    resolver: zodResolver(createBotSchema),
    mode: 'onChange'
  });

  const watchedName = watch('name');
  const watchedToken = watch('token');

  async function setupBotWebhook(botToken: string, botId: string) {
    const webhookUrl = `https://webhook-yom4.onrender.com/webhook/${botId}`;
    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl, drop_pending_updates: true })
    });

    return response.json();
  }

  const onSubmit = async (data: CreateBotFormData) => {
    setIsSubmitting(true);
    setCurrentStep(1);

    try {
      // Step 1: Validate bot token
      setCurrentStep(1);

      const validate = await fetch('/api/validate-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken: data.token })
      });

      const validationResult = await validate.json();

      if (!validationResult.ok) {
        toast({
          variant: 'destructive',
          title: 'Invalid Token',
          description: 'The BotFather token you entered is not valid.'
        });
        return;
      }

      // Step 2: Create bot
      setCurrentStep(2);

      const save = await fetch('/api/create-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data })
      });

      const result = await save.json();

      if (!result.ok || !result.id) {
        toast({
          variant: 'destructive',
          title: 'Creation Failed',
          description: result.error ?? 'Failed to create bot. Please try again.'
        });
        return;
      }

      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const botId = result.id;
      const webhookResult = await setupBotWebhook(data.token, botId);

      if (!webhookResult.ok) {
        toast({
          variant: 'destructive',
          title: 'Webhook Error',
          description: webhookResult.description ?? 'Failed to setup webhook'
        });
        return;
      }

      setCurrentStep(4);
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: 'Bot Created Successfully! 🎉',
        description: `${data.name} is ready to serve your customers.`
      });

      router.push(`/dashboard/apps/${botId}`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
      setCurrentStep(1);
    }
  };

  const getStepProgress = () => {
    if (!isSubmitting) return 0;
    return (currentStep / 4) * 100;
  };

  const steps = [
    { id: 1, title: 'Validating Token', description: 'Checking your BotFather token...' },
    { id: 2, title: 'Creating Bot', description: 'Setting up your bot in our system...' },
    { id: 3, title: 'Configuring Webhook', description: 'Connecting your bot to Telegram...' },
    { id: 4, title: 'Finalizing', description: 'Almost done! Preparing your dashboard...' }
  ];

  return (
    <div className="mx-auto space-y-6">
      {/* Progress Indicator */}
      {isSubmitting && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Creating Your Bot</h3>
                <Badge variant="secondary">{currentStep}/4</Badge>
              </div>
              <Progress value={getStepProgress()} className="h-2" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {steps[currentStep - 1]?.description}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Don't have a bot token yet?{' '}
            <a
              href="https://t.me/BotFather"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium underline underline-offset-4 hover:no-underline"
            >
              Create one with BotFather
              <ExternalLink className="h-3 w-3" />
            </a>
          </AlertDescription>
        </Alert>

        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">Your bot will be ready in under 30 seconds after creation!</AlertDescription>
        </Alert>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Bot Configuration
              </CardTitle>
              <CardDescription>Enter your bot details to get started with your Telegram store</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Bot Avatar */}
                <div className="space-y-2">
                  <Label>Bot Avatar</Label>
                  <div className="flex items-start gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/25 bg-muted/50">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>This platform does not control your Telegram bot’s avatar.</p>
                      <p className="text-xs">To change your bot's profile photo:</p>
                      <ul className="list-disc space-y-1 pl-5 text-xs">
                        <li>
                          Open{' '}
                          <a href="https://t.me/botfather" target="_blank" rel="noreferrer" className="text-blue-500 underline">
                            @BotFather
                          </a>{' '}
                          in Telegram
                        </li>
                        <li>Select your bot</li>
                        <li>
                          Choose <strong>Edit Bot</strong> → <strong>Edit Botpic</strong>
                        </li>
                        <li>Upload your desired image</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Bot Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    Bot Name
                    <Badge variant="secondary" className="text-xs">
                      Required
                    </Badge>
                  </Label>
                  <Input id="name" placeholder="My Awesome Store Bot" {...register('name')} className={cn(errors.name && 'border-destructive')} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                  {watchedName && !errors.name && (
                    <p className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Great name choice!
                    </p>
                  )}
                </div>

                {/* Bot Token */}
                <div className="space-y-2">
                  <Label htmlFor="token" className="flex items-center gap-2">
                    BotFather Token
                    <Badge variant="secondary" className="text-xs">
                      Required
                    </Badge>
                  </Label>
                  <Input
                    id="token"
                    type="password"
                    placeholder="123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                    {...register('token')}
                    className={cn('font-mono', errors.token && 'border-destructive')}
                  />
                  {errors.token && <p className="text-sm text-destructive">{errors.token.message}</p>}
                  {watchedToken && !errors.token && (
                    <p className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Token format looks good!
                    </p>
                  )}
                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="text-sm text-muted-foreground">🔒 Your bot token is encrypted and stored securely. We never share your credentials.</p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center gap-2">
                    Description
                    <Badge variant="outline" className="text-xs">
                      Optional
                    </Badge>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us about your bot and what products you'll be selling..."
                    {...register('description')}
                    className={cn('min-h-[100px] resize-none', errors.description && 'border-destructive')}
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                  <p className="text-sm text-muted-foreground">This helps us provide better recommendations and support.</p>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={!isValid || isSubmitting} className="flex-1">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Creating Bot...' : 'Create My Bot'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* What You'll Get */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-yellow-500" />
                What You'll Get
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Mini Web App Interface</p>
                    <p className="text-xs text-muted-foreground">Rich, interactive shopping experience</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Instant Deployment</p>
                    <p className="text-xs text-muted-foreground">Your bot goes live immediately</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Analytics Dashboard</p>
                    <p className="text-xs text-muted-foreground">Track sales and user behavior</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">24/7 Support</p>
                    <p className="text-xs text-muted-foreground">We're here to help you succeed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help & Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HelpCircle className="h-5 w-5 text-blue-500" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="token" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="token">Get Token</TabsTrigger>
                  <TabsTrigger value="tips">Tips</TabsTrigger>
                </TabsList>
                <TabsContent value="token" className="space-y-3">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">How to get a bot token:</h4>
                    <ol className="space-y-1 text-xs text-muted-foreground">
                      <li>1. Open Telegram and search for @BotFather</li>
                      <li>2. Send /newbot command</li>
                      <li>3. Choose a name for your bot</li>
                      <li>4. Choose a username ending in 'bot'</li>
                      <li>5. Copy the token BotFather gives you</li>
                    </ol>
                  </div>
                </TabsContent>
                <TabsContent value="tips" className="space-y-3">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Pro Tips:</h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li>• Choose a memorable bot name</li>
                      <li>• Keep your token secure</li>
                      <li>• Test your bot before going live</li>
                      <li>• Add a clear description</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="pt-6">
              <div className="space-y-2 text-center">
                <div className="text-2xl font-bold">1,000+</div>
                <p className="text-sm text-muted-foreground">Bots created this month</p>
                <div className="text-lg font-semibold">⚡ 30s</div>
                <p className="text-xs text-muted-foreground">Average setup time</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
