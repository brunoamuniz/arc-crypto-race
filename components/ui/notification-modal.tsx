"use client";

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: NotificationType;
  title: string;
  message: string;
  details?: string;
  onConfirm?: () => void;
  confirmLabel?: string;
  showCancel?: boolean;
  onCancel?: () => void;
  cancelLabel?: string;
}

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: {
    border: 'border-green-400/50',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    icon: 'text-green-400',
    button: 'bg-green-500 hover:bg-green-600 text-black',
  },
  error: {
    border: 'border-red-400/50',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    icon: 'text-red-400',
    button: 'bg-red-500 hover:bg-red-600 text-black',
  },
  warning: {
    border: 'border-yellow-400/50',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    icon: 'text-yellow-400',
    button: 'bg-yellow-500 hover:bg-yellow-600 text-black',
  },
  info: {
    border: 'border-cyan-400/50',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    icon: 'text-cyan-400',
    button: 'bg-cyan-500 hover:bg-cyan-600 text-black',
  },
};

export function NotificationModal({
  open,
  onOpenChange,
  type,
  title,
  message,
  details,
  onConfirm,
  confirmLabel = 'OK',
  showCancel = false,
  onCancel,
  cancelLabel = 'Cancel',
}: NotificationModalProps) {
  const Icon = iconMap[type];
  const colors = colorMap[type];

  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'border-4 bg-black/95 backdrop-blur-sm',
          colors.border,
          'max-w-md'
        )}
        style={{
          borderColor: `var(--${type === 'success' ? 'green' : type === 'error' ? 'ferrari-red' : type === 'warning' ? 'racing-yellow' : 'neon-cyan'}-400)`,
        }}
      >
        <DialogHeader className="space-y-4">
          <div className="flex items-start gap-4">
            <div className={cn('flex-shrink-0', colors.icon)}>
              <Icon className="h-8 w-8" />
            </div>
            <div className="flex-1 space-y-2">
              <DialogTitle
                className={cn('text-2xl font-bold font-mono', colors.text)}
                style={{
                  color: `var(--${type === 'success' ? 'green' : type === 'error' ? 'ferrari-red' : type === 'warning' ? 'racing-yellow' : 'neon-cyan'}-400)`,
                }}
              >
                {title}
              </DialogTitle>
              <DialogDescription className="text-base font-mono text-white/90 whitespace-pre-line">
                {message}
              </DialogDescription>
              {details && (
                <div className="mt-3 p-3 rounded border border-white/10 bg-black/50">
                  <p className="text-sm font-mono text-white/70 whitespace-pre-line">{details}</p>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex gap-3 justify-end mt-6">
          {showCancel && (
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 font-bold font-mono"
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            className={cn('font-bold font-mono', colors.button)}
            style={{
              backgroundColor: `var(--${type === 'success' ? 'green' : type === 'error' ? 'ferrari-red' : type === 'warning' ? 'racing-yellow' : 'neon-cyan'}-500)`,
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook para usar o modal facilmente
export function useNotificationModal() {
  const [modalState, setModalState] = React.useState<{
    open: boolean;
    type: NotificationType;
    title: string;
    message: string;
    details?: string;
    onConfirm?: () => void;
    confirmLabel?: string;
    showCancel?: boolean;
    onCancel?: () => void;
    cancelLabel?: string;
  }>({
    open: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showNotification = React.useCallback(
    (config: {
      type: NotificationType;
      title: string;
      message: string;
      details?: string;
      onConfirm?: () => void;
      confirmLabel?: string;
      showCancel?: boolean;
      onCancel?: () => void;
      cancelLabel?: string;
    }) => {
      setModalState({
        open: true,
        ...config,
      });
    },
    []
  );

  const hideNotification = React.useCallback(() => {
    setModalState((prev) => ({ ...prev, open: false }));
  }, []);

  const Modal = React.useMemo(
    () => (
      <NotificationModal
        open={modalState.open}
        onOpenChange={(open) => {
          if (!open) hideNotification();
        }}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        details={modalState.details}
        onConfirm={modalState.onConfirm}
        confirmLabel={modalState.confirmLabel}
        showCancel={modalState.showCancel}
        onCancel={modalState.onCancel}
        cancelLabel={modalState.cancelLabel}
      />
    ),
    [modalState, hideNotification]
  );

  return {
    showNotification,
    hideNotification,
    Modal,
  };
}
