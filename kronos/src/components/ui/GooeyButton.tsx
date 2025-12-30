'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useSpring, useTransform, useMotionValue, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GooeyButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    children: React.ReactNode
    className?: string
    variant?: 'primary' | 'secondary' | 'outline' | 'purple'
}

export function GooeyButton({ children, className, variant = 'purple', ...props }: GooeyButtonProps) {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [isHovered, setIsHovered] = useState(false)

    // Mouse coords relative to button
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    // Smooth springs for the "blob" movement
    const smoothX = useSpring(mouseX, { damping: 20, stiffness: 150 })
    const smoothY = useSpring(mouseY, { damping: 20, stiffness: 150 })

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!buttonRef.current) return
        const rect = buttonRef.current.getBoundingClientRect()
        mouseX.set(e.clientX - rect.left)
        mouseY.set(e.clientY - rect.top)
    }

    // Filter ID must be unique per instance
    const id = React.useId()
    const filterId = `gooey-filter-${id.replace(/:/g, '')}`

    const getColors = () => {
        switch (variant) {
            case 'primary':
                return {
                    bg: 'bg-primary',
                    blob: 'bg-primary/60 blur-xl',
                    glow: 'bg-primary/20',
                    text: 'text-black font-black'
                }
            case 'secondary':
                return {
                    bg: 'bg-secondary',
                    blob: 'bg-secondary/60 blur-xl',
                    glow: 'bg-secondary/20',
                    text: 'text-white'
                }
            case 'outline':
                return {
                    bg: 'bg-zinc-900 border border-white/10',
                    blob: 'bg-white/10 blur-xl',
                    glow: 'bg-white/5',
                    text: 'text-white'
                }
            case 'purple':
            default:
                return {
                    bg: 'bg-purple-600',
                    blob: 'bg-purple-400 blur-md',
                    glow: 'bg-purple-500/20',
                    text: 'text-white'
                }
        }
    }

    const colors = getColors()

    return (
        <div className="relative group w-full">
            {/* SVG Filter for Gooey Effect */}
            <svg className="absolute w-0 h-0" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id={filterId}>
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                            result="goo"
                        />
                        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                    </filter>
                </defs>
            </svg>

            <motion.button
                ref={buttonRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn(
                    "relative overflow-hidden w-full px-8 py-4 font-orbitron uppercase italic tracking-widest rounded-2xl transition-all duration-300 active:scale-95 z-10",
                    colors.bg,
                    colors.text,
                    className
                )}
                {...props}
            >
                {/* The "Gooey" Layer */}
                <span
                    className="absolute inset-0 pointer-events-none"
                    style={{ filter: `url(#${filterId})` }}
                >
                    {/* Main Button Body (The Goo Source) */}
                    <span className={cn("absolute inset-0 rounded-2xl", colors.bg)} />

                    {/* The Slime Blob that follows mouse */}
                    <motion.span
                        style={{
                            x: smoothX,
                            y: smoothY,
                            translateX: '-50%',
                            translateY: '-50%',
                        }}
                        animate={{
                            scale: isHovered ? 1.5 : 0,
                            opacity: isHovered ? 0.8 : 0,
                        }}
                        className={cn("absolute w-32 h-32 rounded-full", colors.blob)}
                    />
                </span>

                {/* Button Content */}
                <span className="relative z-20 flex items-center justify-center gap-2">
                    {children}
                </span>
            </motion.button>

            {/* Outer Glow Effect */}
            <div
                className={cn(
                    "absolute -inset-1 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
                    colors.glow
                )}
            />
        </div>
    )
}
