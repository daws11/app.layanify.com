'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';

interface VerifyNumberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  numberId: string;
  phoneNumber: string;
  onSuccess: () => void;
}

export function VerifyNumberDialog({
  isOpen,
  onOpenChange,
  numberId,
  phoneNumber,
  onSuccess,
}: VerifyNumberDialogProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const { toast } = useToast();

  const verifyMutation = trpc.whatsapp.verifyNumber.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'WhatsApp number verified successfully',
      });
      onSuccess();
      onOpenChange(false);
      setVerificationCode('');
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter the verification code',
      });
      return;
    }

    verifyMutation.mutate({
      id: numberId,
      verificationCode: verificationCode.trim(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <DialogTitle>Verify WhatsApp Number</DialogTitle>
            </div>
            <DialogDescription>
              We've sent a verification code to <strong>{phoneNumber}</strong>. 
              Please enter the 6-digit code to verify your number.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert>
              <AlertDescription>
                For testing purposes, use code <strong>123456</strong> to verify any number.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                pattern="\d{6}"
                className="text-center text-lg font-mono"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={verifyMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={verifyMutation.isLoading || verificationCode.length !== 6}
            >
              {verifyMutation.isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Verify
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
