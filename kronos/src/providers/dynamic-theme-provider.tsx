'use client'

import { useUser } from "@clerk/nextjs"
import { useEffect } from "react"

export function DynamicThemeProvider({ children }: { children: React.ReactNode }) {
    const { user } = useUser()

    useEffect(() => {
        // Default Color (KRONOS Purple)
        let primaryColor = '#8B5CF6'

        const workspace = user?.publicMetadata?.workspace as any
        if (workspace?.primaryColor) {
            primaryColor = workspace.primaryColor
        }

        // Inject into CSS Variables
        document.documentElement.style.setProperty('--primary-color', primaryColor)

    }, [user]) // Re-run when user changes (e.g., metadata sync)

    return <>{children}</>
}
