import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "primary" | "secondary" | "outline" | "destructive"
}

function Badge({ className, variant = "primary", ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                {
                    "bg-primary/10 text-primary border border-primary/20": variant === "primary",
                    "bg-white/5 text-gray-400 border border-white/10": variant === "secondary",
                    "border border-white/20 text-white": variant === "outline",
                    "bg-red-500/10 text-red-500 border border-red-500/20": variant === "destructive"
                },
                className
            )}
            {...props}
        />
    )
}

export { Badge }
