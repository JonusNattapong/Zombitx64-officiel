import * as React from "react"

declare module "@/components/ui/accordion" {
  import type { Root, Item, Trigger, Content } from "@radix-ui/react-accordion"

  export type AccordionProps = React.ComponentPropsWithoutRef<typeof Root>
  export type AccordionItemProps = React.ComponentPropsWithoutRef<typeof Item> & {
    value: string
  }
  export type AccordionTriggerProps = React.ComponentPropsWithoutRef<typeof Trigger>
  export type AccordionContentProps = React.ComponentPropsWithoutRef<typeof Content>

  export declare const Accordion: React.FC<AccordionProps>
  export declare const AccordionItem: React.FC<AccordionItemProps>
  export declare const AccordionTrigger: React.FC<AccordionTriggerProps>
  export declare const AccordionContent: React.FC<AccordionContentProps>
}

declare module "@/components/ui/progress" {
  import type { Root } from "@radix-ui/react-progress"

  export type ProgressProps = React.ComponentPropsWithoutRef<typeof Root> & {
    value?: number
  }

  export declare const Progress: React.FC<ProgressProps>
}

declare module "@/components/ui/button" {
  export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
  }

  export declare const Button: React.FC<ButtonProps>
}
