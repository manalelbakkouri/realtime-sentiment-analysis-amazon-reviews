import type React from "react"
import { cn } from "../../lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "badge",
        {
          "badge-default": variant === "default",
          "badge-secondary": variant === "secondary",
          "badge-destructive": variant === "destructive",
          "badge-outline": variant === "outline",
        },
        className,
      )}
      {...props}
    />
  )
}
