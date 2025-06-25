'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Customer } from '@prisma/client';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/trpc/react';

const sendMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(4096, 'Message must be less than 4096 characters'),
  webAppUrl: z.string().url('Invalid URL').optional().or(z.literal(''))
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

  const form = useForm<SendMessageFormData>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      message: '',
      webAppUrl: ''
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
      customerId: customer.chatId,
      message: data.message,
      webAppUrl: data.webAppUrl || undefined
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
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send Message
          </DialogTitle>
          <DialogDescription>Send a direct message to this customer via Telegram</DialogDescription>
        </DialogHeader>

        {customer && (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={customer.photoUrl || ''} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                {getInitials(customer.firstName || '', customer.lastName || '')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{displayName}</p>
              <div className="flex items-center gap-2">
                {customer.username && <p className="text-sm text-muted-foreground">@{customer.username}</p>}
                {customer.isPremium && (
                  <Badge variant="default" className="text-xs">
                    Premium
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Type your message here..." className="min-h-[100px] resize-none" {...field} />
                  </FormControl>
                  <FormDescription>Maximum 4096 characters. The message will be sent directly to the customer's Telegram chat.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="webAppUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mini App URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://your-mini-app.com" {...field} />
                  </FormControl>
                  <FormDescription>If provided, an "Open Mini App" button will be added to the message.</FormDescription>
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
      </DialogContent>
    </Dialog>
  );
}
