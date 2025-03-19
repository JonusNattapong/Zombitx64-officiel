import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { spinnerVariants } from "@/lib/animations"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
  label?: string
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12"
}

export function LoadingSpinner({ 
  className, 
  size = "md",
  label
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <motion.div
        variants={spinnerVariants}
        animate="animate"
        className={cn(
          "rounded-full border-2 border-gray-200",
          "border-t-gray-900 dark:border-t-gray-100",
          sizeClasses[size],
          className
        )}
      />
      {label && (
        <p className="text-sm text-gray-500 animate-pulse">
          {label}
        </p>
      )}
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" label="Loading..." />
    </div>
  )
}

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-white/80 dark:bg-gray-950/80 flex items-center justify-center z-50">
      <LoadingSpinner size="lg" />
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="rounded-lg border bg-card p-8 flex items-center justify-center">
      <LoadingSpinner label="Loading..." />
    </div>
  )
}

export function LoadingInline() {
  return <LoadingSpinner size="sm" />
}
