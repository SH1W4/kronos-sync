'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useSpring, useTransform, useMotionValue, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GooeyButtonProps extends HTMLMotionProps<"button"> {
    className?: string
}

export function GooeyButton({ children, className, ...props }: GooeyButtonProps) {
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

    // Filter ID must be unique
    const filterId = "gooey-filter"

    return (
        <div className="relative group">
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
                    "relative overflow-hidden w-full px-8 py-4 bg-purple-600 text-white font-orbitron font-black uppercase italic tracking-widest rounded-2xl transition-all duration-300 active:scale-95 z-10",
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
                    <span className="absolute inset-0 bg-purple-600 rounded-2xl" />

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
                        className="absolute w-24 h-24 bg-purple-400 rounded-full blur-md"
                    />
                </span>

                {/* Button Content */}
                <span className="relative z-20 flex items-center justify-center gap-2">
                    {children}
                </span>
            </motion.button>

            {/* Outer Glow Effect */}
            <div
                className="absolute -inset-1 bg-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            />
        </div>
    )
}
