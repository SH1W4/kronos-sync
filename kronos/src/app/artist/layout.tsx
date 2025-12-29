'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Calendar, DollarSign, Users, Settings, LogOut, Shield, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import McpWidget from '@/components/agent/McpWidget'
import { ThemeCustomizer } from '@/components/theme/theme-customizer'
import { ChevronDown } from 'lucide-react'
import { signOut } from 'next-auth/react'

export default function ArtistLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status, update: updateSession } = useSession()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (status === 'loading') return
        if (!session) {
            router.push('/auth/signin')
            return
        }

        const userRole = (session?.user as any)?.role
        const activeWorkspaceId = (session?.user as any)?.activeWorkspaceId

        if (userRole !== 'ARTIST' && userRole !== 'ADMIN') {
            router.push('/dashboard')
            return
        }

        if (userRole === 'ARTIST' && !activeWorkspaceId) {
            router.push('/onboarding')
        }
    }, [session, status, router])

    if (status === 'loading') {
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
                        <NavItem href="/artist/agenda" icon={<Calendar size={20} />} label="AGENDA" active={pathname === '/artist/agenda'} />
                        <NavItem href="/artist/finance" icon={<DollarSign size={20} />} label="FINANCEIRO" active={pathname === '/artist/finance'} />
                        <NavItem href="/artist/clients" icon={<Users size={20} />} label="CLIENTES" active={pathname === '/artist/clients'} />
                        {/* @ts-ignore */}
                        {session?.user?.role === 'ADMIN' && (
                            <NavItem href="/artist/team" icon={<Shield size={20} />} label="EQUIPE" active={pathname === '/artist/team'} />
                        )}
                        <NavItem href="/artist/codex" icon={<BookOpen size={20} />} label="CODEX" active={pathname?.startsWith('/artist/codex')} />
                        <NavItem href="/artist/settings" icon={<Settings size={20} />} label="SISTEMA" active={pathname === '/artist/settings'} />
                    </nav>
                </div>

                <div className="p-6 border-t border-white/5 space-y-4">
                    {/* Workspace Switcher / Display */}
                    {(session?.user as any)?.activeWorkspaceId && (
                        <div className="relative group">
                            {(session?.user as any)?.role === 'ADMIN' ? (
                                <>
                                    <button
                                        onClick={() => router.push('/auth/select')}
                                        className="w-full flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:border-primary/50 transition-all text-left"
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div
                                                className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_currentColor] flex-shrink-0"
                                                style={{ color: (session as any)?.workspaces?.find((w: any) => w.id === (session?.user as any).activeWorkspaceId)?.primaryColor || '#8B5CF6', backgroundColor: 'currentColor' }}
                                            />
                                            <span className="text-[10px] font-bold text-white truncate uppercase tracking-tighter">
                                                {(session as any)?.workspaces?.find((w: any) => w.id === (session?.user as any).activeWorkspaceId)?.name}
                                            </span>
                                        </div>
                                        <ChevronDown size={14} className="text-gray-500 group-hover:text-primary transition-colors" />
                                    </button>

                                    <div className="absolute bottom-full left-0 w-full mb-2 bg-gray-900 border border-white/10 rounded-xl overflow-hidden hidden group-hover:block z-50 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                                        <p className="p-3 text-[8px] font-mono text-gray-500 uppercase border-b border-white/5">Trocar Estúdio</p>
                                        {(session as any).workspaces?.map((w: any) => (
                                            <button
                                                key={w.id}
                                                onClick={() => {
                                                    (session?.user as any).activeWorkspaceId !== w.id && updateSession({ activeWorkspaceId: w.id })
                                                }}
                                                className={`w-full p-3 text-left hover:bg-white/5 flex items-center gap-2 transition-all ${w.id === (session?.user as any).activeWorkspaceId ? 'bg-primary/10' : ''}`}
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: w.primaryColor }} />
                                                <span className={`text-[10px] font-bold uppercase tracking-tighter ${w.id === (session?.user as any).activeWorkspaceId ? 'text-primary' : 'text-gray-400'}`}>
                                                    {w.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                /* ARTIST DISPLAY: Static Vínculo Permanente */
                                <div className="w-full flex items-center gap-2 p-3 bg-white/2 rounded-xl border border-white/5 cursor-default">
                                    <div
                                        className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]"
                                        style={{ color: (session as any)?.workspaces?.find((w: any) => w.id === (session?.user as any).activeWorkspaceId)?.primaryColor || '#8B5CF6', backgroundColor: 'currentColor' }}
                                    />
                                    <div className="overflow-hidden">
                                        <p className="text-[7px] font-mono text-gray-500 uppercase tracking-widest leading-none mb-1">CONECTADO_A</p>
                                        <p className="text-[10px] font-bold text-gray-300 truncate uppercase tracking-tighter">
                                            {(session as any)?.workspaces?.find((w: any) => w.id === (session?.user as any).activeWorkspaceId)?.name}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-4 overflow-hidden group/user">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-primary flex-shrink-0 flex items-center justify-center text-[10px] font-bold shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)] text-black">
                                {session?.user?.name?.charAt(0)}
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-bold truncate max-w-[100px]">{session?.user?.name}</p>
                                <p className="text-xs text-gray-500 font-mono uppercase tracking-tighter">
                                    {(session?.user as any)?.role}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
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
                {children}
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

