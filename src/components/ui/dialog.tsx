'use client';
import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
export const DialogClose = DialogPrimitive.Close;
export function DialogContent({ children, className, side = false, onOpenAutoFocus, onCloseAutoFocus, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { side?: boolean }) {
  const returnFocus = React.useRef<HTMLElement | null>(null);
  return <DialogPrimitive.Portal><DialogPrimitive.Overlay className="dialog-overlay" /><DialogPrimitive.Content className={cn(side ? 'sheet-content' : 'dialog-content', className)} {...props} onOpenAutoFocus={event => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    onOpenAutoFocus?.(event);
  }} onCloseAutoFocus={event => {
    onCloseAutoFocus?.(event); if (event.defaultPrevented) return;
    event.preventDefault();
    const target = returnFocus.current?.isConnected ? returnFocus.current : document.querySelector<HTMLButtonElement>('.cart-trigger');
    target?.focus({ preventScroll: true });
  }}>{children}<DialogPrimitive.Close className="icon-button dialog-close" aria-label="Close dialog"><X size={22} /></DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>;
}
