import React from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type ConfirmationType = 'info' | 'warning' | 'danger';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: ConfirmationType;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'info',
  isLoading = false,
  onConfirm,
  onCancel,
  children,
}) => {
  const typeStyles = {
    info: {
      buttonClass: 'bg-info hover:bg-info/90',
      iconColor: 'text-info'
    },
    warning: {
      buttonClass: 'bg-warning hover:bg-warning/90',
      iconColor: 'text-warning'
    },
    danger: {
      buttonClass: 'bg-destructive hover:bg-destructive/90',
      iconColor: 'text-destructive'
    }
  };

  const styles = typeStyles[type];

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <AlertCircle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${styles.iconColor}`} />
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold text-foreground">{title}</DialogTitle>
              {description && (
                <DialogDescription className="text-muted-foreground mt-1">{description}</DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          {message && <div className="text-foreground/80">{message}</div>}
          {children && <div className="space-y-3">{children}</div>}
        </div>

        <DialogFooter className="flex gap-2 justify-end pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="border-border hover:bg-secondary"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={styles.buttonClass}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
