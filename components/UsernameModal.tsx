"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { validateUsername, generateRandomUsername } from '@/lib/username';
import { cn } from '@/lib/utils';

interface UsernameModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (username: string) => void;
  wallet: string;
}

export function UsernameModal({ open, onClose, onConfirm, wallet }: UsernameModalProps) {
  const [username, setUsername] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setUsername('');
      setIsAvailable(null);
      setValidationError(null);
      setIsValidating(false);
    }
  }, [open]);

  const checkAvailability = async (value: string) => {
    try {
      const response = await fetch(`/api/username/check?username=${encodeURIComponent(value)}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to check availability' }));
        setValidationError(errorData.error || 'Failed to check availability');
        setIsAvailable(false);
        setIsValidating(false);
        return;
      }

      const data = await response.json();
      setIsAvailable(data.available);
      if (!data.available) {
        setValidationError('Username is already taken');
      } else {
        setValidationError(null);
      }
    } catch (error) {
      console.error('Error checking username availability:', error);
      setValidationError('Failed to check availability');
      setIsAvailable(false);
    } finally {
      setIsValidating(false);
    }
  };

  // Debounced username validation and availability check
  useEffect(() => {
    if (!username || username.length < 3) {
      setIsAvailable(null);
      setValidationError(null);
      setIsValidating(false);
      return;
    }

    // Validate format first
    const validation = validateUsername(username);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid username');
      setIsAvailable(false);
      setIsValidating(false);
      return;
    }

    // Debounce availability check
    setIsValidating(true);
    const timeoutId = setTimeout(() => {
      checkAvailability(username);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setIsAvailable(null);
    setValidationError(null);
  };

  const handleUseRandom = () => {
    const randomUsername = generateRandomUsername();
    setUsername(randomUsername);
  };

  const handleSubmit = async () => {
    if (!username || !isAvailable) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet,
          username,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save username' }));
        setValidationError(errorData.error || 'Failed to save username');
        setIsSubmitting(false);
        return;
      }

      const data = await response.json();
      onConfirm(data.username);
      onClose();
    } catch (error: any) {
      console.error('Error saving username:', error);
      setValidationError(error.message || 'Failed to save username');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = username.length >= 3 && isAvailable === true && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="border-4 bg-black/95 backdrop-blur-sm max-w-md"
        style={{ borderColor: 'var(--racing-yellow)' }}
      >
        <DialogHeader>
          <DialogTitle
            className="text-3xl font-bold font-mono text-center"
            style={{ color: 'var(--racing-yellow)' }}
          >
            Choose Your Username
          </DialogTitle>
          <DialogDescription className="text-center font-mono text-white/80 mt-2">
            Pick a username to appear on the leaderboard
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-sm font-mono font-bold text-cyan-400">Username</label>
            <div className="relative">
              <Input
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="Enter username (3-20 characters)"
                className={cn(
                  'font-mono bg-black/50 border-2 text-white',
                  isAvailable === true && 'border-green-400',
                  isAvailable === false && 'border-red-400',
                  !isAvailable && isAvailable !== null && 'border-yellow-400',
                  isAvailable === null && 'border-cyan-400/50'
                )}
                disabled={isSubmitting}
                maxLength={20}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isValidating && <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />}
                {!isValidating && isAvailable === true && (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                )}
                {!isValidating && isAvailable === false && (
                  <XCircle className="h-4 w-4 text-red-400" />
                )}
              </div>
            </div>

            {/* Validation Messages */}
            {validationError && (
              <p className="text-sm font-mono text-red-400">{validationError}</p>
            )}
            {isAvailable === true && !validationError && (
              <p className="text-sm font-mono text-green-400">✓ Username available!</p>
            )}

            {/* Username Rules */}
            <div className="text-xs font-mono text-white/60 mt-2">
              <p>• 3-20 characters</p>
              <p>• Letters, numbers, and underscores only</p>
            </div>
          </div>

          {/* Use Random Button */}
          <Button
            onClick={handleUseRandom}
            variant="outline"
            className="w-full border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 font-bold font-mono"
            disabled={isSubmitting}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Use Random Name
          </Button>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-400/50 text-gray-400 hover:bg-gray-400/10 font-bold font-mono"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold font-mono"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
