'use client'

import { useUser, useClerk, UserButton } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Calendar, DollarSign, Users, Settings, LogOut, Shield, BookOpen, ShoppingBag, ChevronDown, QrCode, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import McpWidget from '@/components/agent/McpWidget'
import { ThemeCustomizer } from '@/components/theme/theme-customizer'
import { TermsGate } from '@/components/auth/TermsGate'

export default function ArtistLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoaded, isSignedIn } = useUser()
    const { signOut } = useClerk()
    const router = useRouter()
    const pathname = usePathname()
    const [dbUser, setDbUser] = useState<any>(null)

    useEffect(() => {
        if (!isLoaded) return
        if (!isSignedIn) {
            router.push('/auth/signin')
            return
        }

        // Fetch additional DB data if needed (Role/Workspace)
        // For now using metadata from Clerk
        const userRole = user?.publicMetadata?.role
        
        if (userRole !== 'ARTIST' && userRole !== 'ADMIN') {
            // Se não for artista nem admin, talvez seja um novo registro desvinculado
            // router.push('/onboarding')
        }
    }, [user, isLoaded, isSignedIn, router])

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-pulse font-mono text-xs tracking-widest text-primary">INITIALIZING NEURAL LINK...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Sidebar Fixa */}
            <aside className="w-20 md:w-64 border-r border-white/5 bg-gray-900/20 flex flex-col justify-between transition-all duration-300">
                <div className="p-6">
                    <Link href="/artist/dashboard" className="block mb-10 group">
                        <h1 className="font-orbitron font-bold text-xl tracking-wider hidden md:block group-hover:text-primary transition-colors">
                            KRONØS <span className="text-primary">OS</span>
                        </h1>
                        <span className="md:hidden font-orbitron font-bold text-2xl text-primary">K</span>
                    </Link>

                    <nav className="space-y-2">
                        <NavItem href="/artist/dashboard" icon={<LayoutDashboard size={20} />} label="VISÃO GERAL" active={pathname === '/artist/dashboard'} />
                        <NavItem href="/artist/profile" icon={<UserIcon size={20} />} label="MEU PERFIL" active={pathname === '/artist/profile'} />
                        <NavItem href="/artist/agenda" icon={<Calendar size={20} />} label="MINHA AGENDA" active={pathname === '/artist/agenda'} />
                        <NavItem href="/artist/studio-agenda" icon={<Users size={20} />} label="AGENDA ESTÚDIO" active={pathname === '/artist/studio-agenda'} />
                        <NavItem href="/artist/finance" icon={<DollarSign size={20} />} label="FINANCEIRO" active={pathname === '/artist/finance'} />
                        <NavItem href="/artist/scanner" icon={<QrCode size={20} />} label="SCANNER" active={pathname === '/artist/scanner'} />
                        <NavItem href="/artist/inventory" icon={<ShoppingBag size={20} />} label="INVENTÁRIO" active={pathname === '/artist/inventory'} />
                        <NavItem href="/artist/clients" icon={<Users size={20} />} label="CLIENTES" active={pathname === '/artist/clients'} />
                        {user?.publicMetadata?.role === 'ADMIN' && (
                            <NavItem href="/artist/team" icon={<Shield size={20} />} label="EQUIPE" active={pathname === '/artist/team'} />
                        )}
                        <NavItem href="/artist/codex" icon={<BookOpen size={20} />} label="CODEX" active={pathname?.startsWith('/artist/codex')} />
                        <NavItem href="/artist/settings" icon={<Settings size={20} />} label="SISTEMA" active={pathname === '/artist/settings'} />
                    </nav>
                </div>

                <div className="p-6 border-t border-white/5 space-y-4">
                    {/* Workspace Switcher / Display - TODO: Reimplement with Clerk/Context */}
                    {/* (Legacy Workspace Switcher removed during Auth Migration) */}

                    <div className="flex items-center justify-between mb-4 overflow-hidden group/user">
                        <div className="flex items-center gap-3">
                            <UserButton 
                                appearance={{
                                    elements: {
                                        userButtonAvatarBox: "w-8 h-8 rounded border border-primary/20",
                                        userButtonPopoverCard: "bg-gray-900 border border-white/10 text-white",
                                        userButtonPopoverActionButtonText: "text-gray-300",
                                        userButtonPopoverFooter: "hidden"
                                    }
                                }}
                            />
                            <div className="hidden md:block">
                                <p className="text-sm font-bold truncate max-w-[100px]">{user?.fullName}</p>
                                <p className="text-xs text-gray-500 font-mono uppercase tracking-tighter">
                                    {user?.publicMetadata?.role as string}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => signOut({ redirectUrl: '/auth/signin' })}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-300 group/logout"
                            title="ENCERRAR SESSÃO"
                        >
                            <LogOut size={18} className="group-hover/logout:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Área de Conteúdo Principal */}
            <main className="flex-1 overflow-y-auto bg-black relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none fixed"></div>
                <TermsGate>
                    {children}
                </TermsGate>
                <McpWidget />
                <ThemeCustomizer />
            </main>
        </div>
    )
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link href={href}>
            <div className={`
                flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
                ${active ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)] translate-x-1' : 'text-gray-500 hover:bg-white/5 hover:text-white'}
            `}>
                <span className={`group-hover:scale-110 transition-transform duration-200 ${active ? 'scale-110' : ''}`}>{icon}</span>
                <span className="text-[10px] font-mono tracking-widest font-black hidden md:block">{label}</span>
            </div>
        </Link>
    )
}
