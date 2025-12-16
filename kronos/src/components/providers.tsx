'use client'

import React from 'react'
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/contexts/theme-context"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            {/* O ThemeProvider já cuida do tema, SessionProvider cuida do Auth */}
            <ThemeProvider>
                {children}
            </ThemeProvider>
        </SessionProvider>
    )
}
