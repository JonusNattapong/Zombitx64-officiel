import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import * as ProgressPrimitive from "@radix-ui/react-progress"

// Accordion Types
export type AccordionProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>

export interface AccordionItemProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {
  value: string;
}

export type AccordionTriggerProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>

export type AccordionContentProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>

// Progress Types
export interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
}

// Button Types
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}
