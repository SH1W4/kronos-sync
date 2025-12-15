import React from 'react'

interface BrandLogoProps {
    className?: string
    size?: number
    variant?: 'full' | 'icon'
    animated?: boolean
}

export function BrandLogo({
    className = '',
    size = 40,
    variant = 'full',
    animated = true
}: BrandLogoProps) {
    return (
        <div className={`flex items-center gap-4 select-none group ${className}`}>
            {/* Icon Wrapper */}
            <div
                className="relative flex items-center justify-center"
                style={{ width: size, height: size }}
            >
                {/* Subtle Ambient Glow (White/Gray) */}
                {animated && (
                    <div
                        className="absolute inset-0 rounded-full bg-white blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-1000"
                    />
                )}

                {/* SVG Logo Icon - Monochrome Geometric */}
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="relative z-10 text-foreground"
                >
                    {/* Main Shape: Stylized Hourglass / K */}
                    {/* Outer Frame - Brutalist Lines */}
                    <path
                        d="M20 20 H80 M20 80 H80"
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeLinecap="square"
                    />

                    {/* Inner X / Hourglass Structure */}
                    <path
                        d="M30 20 L70 80 M70 20 L30 80"
                        stroke="currentColor"
                        strokeWidth="5"
                        strokeLinecap="square"
                    />

                    {/* Center Connector (Sync Point) */}
                    <rect
                        x="42"
                        y="42"
                        width="16"
                        height="16"
                        transform="rotate(45 50 50)"
                        fill="currentColor"
                        className={animated ? "animate-pulse" : ""}
                    />
                </svg>
            </div>

            {/* Text Logo - Only for 'full' variant */}
            {variant === 'full' && (
                <div className="flex flex-col justify-center h-full">
                    <h1
                        className="font-orbitron font-bold tracking-[0.2em] leading-none text-foreground"
                        style={{ fontSize: size * 0.55 }}
                    >
                        KRONOS
                    </h1>
                    <span
                        className="font-mono text-muted-foreground tracking-[0.5em] font-normal uppercase border-t border-muted-foreground/30 mt-1 pt-1 w-full flex justify-between px-1"
                        style={{ fontSize: size * 0.22 }}
                    >
                        <span>S</span><span>Y</span><span>N</span><span>C</span>
                    </span>
                </div>
            )}
        </div>
    )
}
