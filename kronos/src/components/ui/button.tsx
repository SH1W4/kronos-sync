'use client'
import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"
import { Loader2 } from "lucide-react"

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "variant" | "size"> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg" | "icon"
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        whileTap={{ scale: 0.96 }}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-black shadow-lg shadow-[var(--primary-glow)] hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0": variant === "primary",
            "bg-white/5 text-white border border-white/10 hover:bg-white/10": variant === "secondary",
            "border border-white/20 bg-transparent text-white hover:bg-white/5": variant === "outline",
            "text-gray-400 hover:text-white hover:bg-white/5": variant === "ghost",
          },
          {
            "h-8 px-4 text-xs": size === "sm",
            "h-11 px-6 py-2": size === "md",
            "h-14 px-10 text-lg": size === "lg",
            "h-11 w-11 p-0": size === "icon",
          },
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>CARREGANDO</span>
          </>
        ) : (
          children
        )}
      </motion.button>
    )
  }
)
Button.displayName = "Button"

export { Button }

