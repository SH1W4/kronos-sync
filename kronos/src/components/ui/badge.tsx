import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "primary" | "secondary" | "outline"
}

function Badge({ className, variant = "primary", ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                {
                    "bg-primary/10 text-primary border border-primary/20": variant === "primary",
                    "bg-white/5 text-gray-400 border border-white/10": variant === "secondary",
                    "border border-white/20 text-white": variant === "outline"
                },
                className
            )}
            {...props}
        />
    )
}

export { Badge }
