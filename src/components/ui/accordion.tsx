'use client';
import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
export const Accordion = AccordionPrimitive.Root;
export const AccordionItem = AccordionPrimitive.Item;
export function AccordionTrigger({ children, className, ...props }: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>) {
  return <AccordionPrimitive.Header><AccordionPrimitive.Trigger className={cn('accordion-trigger', className)} {...props}>{children}<Plus size={17} /></AccordionPrimitive.Trigger></AccordionPrimitive.Header>;
}
export function AccordionContent({ children, ...props }: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>) { return <AccordionPrimitive.Content className="accordion-content" {...props}><div>{children}</div></AccordionPrimitive.Content>; }
