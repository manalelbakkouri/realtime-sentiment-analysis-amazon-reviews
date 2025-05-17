import type React from "react"
import { cn } from "../../lib/utils.ts"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "button",
        {
          "button-default": variant === "default",
          "button-destructive": variant === "destructive",
          "button-outline": variant === "outline",
          "button-secondary": variant === "secondary",
          "button-ghost": variant === "ghost",
          "button-link": variant === "link",
          "button-sm": size === "sm",
          "button-md": size === "default",
          "button-lg": size === "lg",
          "button-icon": size === "icon",
        },
        className,
      )}
      {...props}
    />
  )
}
