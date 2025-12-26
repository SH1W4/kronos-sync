'use client'

import { useSession } from "next-auth/react"
import { useEffect } from "react"

export function DynamicThemeProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession()

    useEffect(() => {
        // Default Color (KRONOS Purple)
        let primaryColor = '#8B5CF6'

        if (session && (session as any).workspaces && (session.user as any).activeWorkspaceId) {
            const activeId = (session.user as any).activeWorkspaceId
            const activeWorkspace = (session as any).workspaces.find((w: any) => w.id === activeId)

            if (activeWorkspace && activeWorkspace.primaryColor) {
                primaryColor = activeWorkspace.primaryColor
            }
        }

        // Inject into CSS Variables
        document.documentElement.style.setProperty('--primary-color', primaryColor)

    }, [session]) // Re-run when session changes (e.g., switching workspace)

    return <>{children}</>
}
