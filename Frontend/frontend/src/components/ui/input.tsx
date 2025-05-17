import type React from "react"
import { cn } from "../../lib/utils.ts"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return <input className={cn("input", className)} {...props} />
}
