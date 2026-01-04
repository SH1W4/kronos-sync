'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Terminal } from 'lucide-react'
import { useState } from 'react'

export default function DevLogin() {
    const [loading, setLoading] = useState(false)

    if (process.env.NODE_ENV === 'production') return null

    const handleDevLogin = async (username: string) => {
        setLoading(true)
        try {
            await signIn('credentials', {
                username,
                callbackUrl: '/artist/dashboard',
                redirect: true
            })
        } catch (error) {
            console.error('Dev login failed:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="pt-6 border-t border-white/5 space-y-3">
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest text-center">
                Dev Mode / Bypass
            </p>
            <div className="grid grid-cols-2 gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] font-mono h-8 border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-500/10"
                    onClick={() => handleDevLogin('master')}
                    disabled={loading}
                >
                    <Terminal className="w-3 h-3 mr-2 text-cyan-500" />
                    MASTER
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] font-mono h-8 border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/10"
                    onClick={() => handleDevLogin('dev')}
                    disabled={loading}
                >
                    <Terminal className="w-3 h-3 mr-2 text-purple-500" />
                    ARTIST
                </Button>
            </div>
        </div>
    )
}
