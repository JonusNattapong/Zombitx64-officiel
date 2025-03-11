// This file provides type definitions for our custom components
import { AccordionProps, AccordionItemProps, AccordionTriggerProps, AccordionContentProps } from '@radix-ui/react-accordion'
import { ProgressProps } from '@radix-ui/react-progress'

declare module '@/components/ui/accordion' {
  export const Accordion: React.FC<AccordionProps>
  export const AccordionItem: React.FC<AccordionItemProps>
  export const AccordionTrigger: React.FC<AccordionTriggerProps>
  export const AccordionContent: React.FC<AccordionContentProps>
}

declare module '@/components/ui/progress' {
  export const Progress: React.FC<ProgressProps>
}
