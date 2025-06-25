'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Customer } from '@prisma/client';
import { Bold, Code, Eye, EyeOff, Italic, Link, Loader2, MessageSquare, Send, Type } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/trpc/react';

const sendMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(4096, 'Message must be less than 4096 characters')
});

type SendMessageFormData = z.infer<typeof sendMessageSchema>;

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
  onSuccess?: () => void;
}

export function SendMessageDialog({ open, onOpenChange, customer, onSuccess }: SendMessageDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const form = useForm<SendMessageFormData>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      message: ''
    }
  });

  const sendMessageMutation = api.customers.sendMessage.useMutation({
    onSuccess: () => {
      toast.success('Message sent successfully!');
      form.reset();
      onSuccess?.();
    },
    onError: error => {
      toast.error(error.message || 'Failed to send message');
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = async (data: SendMessageFormData) => {
    if (!customer) return;

    setIsSubmitting(true);
    sendMessageMutation.mutate({
      customerId: customer?.chatId || '',
      message: data.message
    });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';

    return (first + last).toUpperCase() || '?';
  };

  const displayName = customer ? [customer.firstName, customer.lastName].filter(Boolean).join(' ') || customer.username || 'Unknown User' : '';

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen);
      if (!newOpen) {
        form.reset();
        setShowPreview(false);
      }
    }
  };

  const insertMarkup = (markup: string, placeholder = '') => {
    const textarea = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;

    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const textToInsert = selectedText || placeholder;

    let newText = '';
    let cursorPosition = start;

    switch (markup) {
      case 'bold':
        newText = `*${textToInsert}*`;
        cursorPosition = start + (selectedText ? newText.length : 1);
        break;
      case 'italic':
        newText = `_${textToInsert}_`;
        cursorPosition = start + (selectedText ? newText.length : 1);
        break;
      case 'code':
        newText = `\`${textToInsert}\``;
        cursorPosition = start + (selectedText ? newText.length : 1);
        break;
      case 'link':
        newText = `[${textToInsert || 'link text'}](https://example.com)`;
        cursorPosition = start + newText.length - 20;
        break;
      default:
        return;
    }

    const newValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);

    form.setValue('message', newValue);

    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };

  const renderPreview = (text: string) =>
    text
      .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, "<code class='bg-muted px-1 py-0.5 rounded text-sm'>$1</code>")
      .replace(/\[([^\]]+)\]$$([^)]+)$$/g, "<a href='$2' class='text-primary underline'>$1</a>")
      .replace(/\n/g, '<br>');

  const formatExamples = [
    { label: 'Bold', example: '*bold text*', description: 'Makes text bold' },
    { label: 'Italic', example: '_italic text_', description: 'Makes text italic' },
    { label: 'Code', example: '`code`', description: 'Monospace font' },
    { label: 'Link', example: '[link text](https://example.com)', description: 'Creates a clickable link' }
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            Send Message to Customer
          </DialogTitle>
          <DialogDescription>Send a direct message with Telegram formatting to this customer</DialogDescription>
        </DialogHeader>

        {customer && (
          <Card className="border-0 bg-gradient-to-r from-muted/50 to-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                    <AvatarImage src={customer.photoUrl || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 font-semibold text-primary-foreground">
                      {getInitials(customer.firstName || '', customer.lastName || '')}
                    </AvatarFallback>
                  </Avatar>
                  {customer.isPremium && (
                    <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500">
                      <span className="text-xs text-white">★</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{displayName}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    {customer.username && <span className="font-mono text-sm text-muted-foreground">@{customer.username}</span>}
                    {customer.isPremium && <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-xs">Premium</Badge>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="compose" className="flex h-full flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="compose">Compose</TabsTrigger>
              <TabsTrigger value="help">Formatting Help</TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="flex-1 overflow-hidden">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col space-y-4 p-1">
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem className="flex flex-1 flex-col">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-base font-semibold">Message</FormLabel>
                          <div className="flex items-center gap-2">
                            <Button type="button" variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)} className="text-xs">
                              {showPreview ? <EyeOff className="mr-1 h-3 w-3" /> : <Eye className="mr-1 h-3 w-3" />}
                              {showPreview ? 'Hide Preview' : 'Show Preview'}
                            </Button>
                          </div>
                        </div>

                        {/* Formatting Toolbar */}
                        <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-2">
                          <Button type="button" variant="ghost" size="sm" onClick={() => insertMarkup('bold', 'bold text')} className="h-8 w-8 p-0" title="Bold">
                            <Bold className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => insertMarkup('italic', 'italic text')} className="h-8 w-8 p-0" title="Italic">
                            <Italic className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => insertMarkup('code', 'code')} className="h-8 w-8 p-0" title="Code">
                            <Code className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => insertMarkup('link', 'link text')} className="h-8 w-8 p-0" title="Link">
                            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                            <Link className="h-4 w-4" />
                          </Button>
                          <div className="ml-auto text-xs text-muted-foreground">{field.value.length}/4096</div>
                        </div>

                        <div className="flex flex-1 gap-4">
                          <div className="flex-1">
                            <FormControl>
                              <Textarea
                                placeholder="Type your message here... Use *bold*, _italic_, `code`, or [links](https://example.com)"
                                className="min-h-[200px] resize-none font-mono text-sm"
                                {...field}
                              />
                            </FormControl>
                          </div>

                          {showPreview && (
                            <div className="flex-1">
                              <div className="min-h-[200px] rounded-md border bg-muted/20 p-3 text-sm">
                                {field.value ? (
                                  <div
                                    // eslint-disable-next-line react/no-danger
                                    dangerouslySetInnerHTML={{
                                      __html: renderPreview(field.value)
                                    }}
                                  />
                                ) : (
                                  <span className="italic text-muted-foreground">Preview will appear here...</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <FormDescription className="text-xs">
                          Maximum 4096 characters. The message will be sent directly to the customer's Telegram chat with formatting applied.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="help" className="flex-1 overflow-auto">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Telegram Formatting Guide</h3>
                  <p className="mb-4 text-sm text-muted-foreground">Use these formatting options to make your messages more engaging:</p>
                </div>

                <div className="grid gap-4">
                  {formatExamples.map((example, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <Card key={index} className="border-0 bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{example.label}</h4>
                            <p className="text-sm text-muted-foreground">{example.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="mb-1 text-xs text-muted-foreground">Syntax:</div>
                            <code className="rounded bg-background px-2 py-1 font-mono text-sm">{example.example}</code>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="border-0 bg-primary/5">
                  <CardContent className="p-4">
                    <h4 className="mb-2 flex items-center gap-2 font-medium">
                      <Type className="h-4 w-4" />
                      Pro Tips
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• You can combine formatting: *_bold italic_*</li>
                      <li>• Use the toolbar buttons to insert formatting quickly</li>
                      <li>• Select text first, then click a formatting button to wrap it</li>
                      <li>• Preview your message to see how it will look</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
