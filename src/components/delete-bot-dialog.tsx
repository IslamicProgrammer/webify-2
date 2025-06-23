'use client';

import { useState } from 'react';
import { AlertTriangle, Check, Copy, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { api } from '@/trpc/react';

interface DeleteBotDialogProps {
  bot: {
    id: string;
    name: string;
    botToken: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteBotDialog({ bot, open, onOpenChange, onSuccess }: DeleteBotDialogProps) {
  const [confirmationText, setConfirmationText] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);

  const utils = api.useUtils();

  const deleteMutation = api.apps.delete.useMutation({
    onSuccess: () => {
      toast.success('Bot deleted successfully');
      utils.apps.getAll.invalidate();
      onOpenChange(false);
      setConfirmationText('');
      onSuccess?.();
    },
    onError: error => {
      toast.error(error.message || 'Failed to delete bot');
    }
  });

  const isConfirmationValid = confirmationText === bot.name;
  const botUsername = bot.botToken.split(':')[0];

  const handleDelete = () => {
    if (!isConfirmationValid) return;
    deleteMutation.mutate({ id: bot.id });
  };

  const copyToClipboard = async (text: string, type: 'token' | 'username') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'token') {
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 2000);
      } else {
        setCopiedUsername(true);
        setTimeout(() => setCopiedUsername(false), 2000);
      }
      toast.success(`${type === 'token' ? 'Bot token' : 'Bot username'} copied to clipboard`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!deleteMutation.isPending) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setConfirmationText('');
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle className="text-xl">Delete Bot</AlertDialogTitle>
              <AlertDialogDescription className="text-base">This action cannot be undone. This will permanently delete your bot.</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-6">
          {/* Warning Section */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="space-y-2">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200">Important Notice</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Deleting this bot from your dashboard will not automatically delete it from Telegram's BotFather. You'll need to manually delete it from BotFather if you want to
                  completely remove the bot.
                </p>
              </div>
            </div>
          </div>

          {/* Bot Information */}
          <div className="space-y-4">
            <h4 className="font-semibold">Bot Details</h4>
            <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Bot Name:</span>
                <span className="font-mono text-sm">{bot.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Bot Username:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">@{botUsername}</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`@${botUsername}`, 'username')} className="h-6 w-6 p-0">
                    {copiedUsername ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Bot Token:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{bot.botToken.slice(0, 20)}...</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(bot.botToken, 'token')} className="h-6 w-6 p-0">
                    {copiedToken ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* BotFather Instructions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Delete from BotFather (Optional)</h4>
              <Button variant="outline" size="sm" asChild>
                <a className="flex items-center" href="https://t.me/botfather" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open BotFather
                </a>
              </Button>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="mb-3 text-sm text-muted-foreground">To completely remove this bot from Telegram, follow these steps in BotFather:</p>
              <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                <li>Open BotFather (@botfather) in Telegram</li>
                <li>
                  Send the command: <code className="rounded bg-muted px-1">/deletebot</code>
                </li>
                <li>
                  Select your bot: <code className="rounded bg-muted px-1">@{botUsername}</code>
                </li>
                <li>Confirm the deletion when prompted</li>
              </ol>
              <p className="mt-3 text-xs text-muted-foreground">Note: Once deleted from BotFather, the bot token will become invalid and cannot be recovered.</p>
            </div>
          </div>

          <Separator />

          {/* Confirmation Input */}
          <div className="space-y-3">
            <Label htmlFor="confirmation" className="text-sm font-medium">
              Type <span className="rounded bg-muted px-1 font-mono">{bot.name}</span> to confirm deletion:
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={e => setConfirmationText(e.target.value)}
              placeholder={`Type "${bot.name}" here`}
              disabled={deleteMutation.isPending}
              className={confirmationText && !isConfirmationValid ? 'border-destructive' : ''}
            />
            {confirmationText && !isConfirmationValid && <p className="text-sm text-destructive">Bot name doesn't match. Please type exactly: {bot.name}</p>}
          </div>
        </div>

        <AlertDialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={!isConfirmationValid || deleteMutation.isPending} className="min-w-[100px]">
            {deleteMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Deleting...
              </div>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Bot
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
