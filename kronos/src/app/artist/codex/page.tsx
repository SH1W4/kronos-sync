'use client'

import React, { useState, useEffect } from 'react'
import { getDocumentation } from '@/app/actions/docs'
import ReactMarkdown from 'react-markdown'
import { Book, Shield, FileText, ChevronRight, Terminal, Search, Zap, Cpu } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function CodexPage() {
    const { data: session } = useSession()
    const [docs, setDocs] = useState<any[]>([])
    const [selectedDoc, setSelectedDoc] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDocs = async () => {
            const userRole = (session?.user as any)?.role || 'ARTIST'
            const userEmail = session?.user?.email || null
            const data = await getDocumentation(userRole, userEmail)
            setDocs(data)
            if (data.length > 0) {
                setSelectedDoc(data[0])
            }
            setLoading(false)
        }
        if (session) {
            fetchDocs()
        }
    }, [session])

    const filteredDocs = docs.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const categories = {
        training: { icon: <Book size={16} />, label: 'TREINAMENTO' },
        governance: { icon: <Shield size={16} />, label: 'GOVERNANÇA' },
        templates: { icon: <FileText size={16} />, label: 'TEMPLATES' }
    }

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Cpu className="w-8 h-8 text-purple-500 animate-spin" />
                    <span className="font-mono text-[10px] text-purple-400 animate-pulse uppercase tracking-[0.3em]">
                        Carregando Manuais...
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                            <Terminal size={20} className="text-purple-400" />
                        </div>
                        <span className="text-[10px] font-mono text-purple-500 uppercase tracking-[0.4em] font-bold">Base de Conhecimento</span>
                    </div>
                    <h1 className="text-4xl font-orbitron font-black tracking-tight text-white italic">
                        M A N U A I S
                    </h1>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="BUSCAR NO SISTEMA..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-mono text-gray-300 focus:outline-none focus:border-purple-500/40 focus:bg-white/10 transition-all w-full md:w-64"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-8">
                    {Object.entries(categories).map(([key, config]: [string, any]) => {
                        const categoryDocs = filteredDocs.filter(d => d.category === key)
                        if (categoryDocs.length === 0) return null

                        return (
                            <div key={key} className="space-y-3">
                                <div className="flex items-center gap-2 px-2 text-gray-500">
                                    {config.icon}
                                    <span className="text-[9px] font-mono font-black tracking-[0.2em]">{config.label}</span>
                                </div>
                                <div className="space-y-1">
                                    {categoryDocs.map((doc) => (
                                        <button
                                            key={doc.id}
                                            onClick={() => setSelectedDoc(doc)}
                                            className={`w-full text-left px-4 py-2.5 rounded-xl border transition-all flex items-center justify-between group ${selectedDoc?.id === doc.id
                                                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                                                : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <span className="text-[10px] font-mono tracking-tighter truncate">{doc.title}</span>
                                            <ChevronRight size={12} className={`transition-transform ${selectedDoc?.id === doc.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )
                    })}

                    {/* System Status Decorative Card */}
                    <div className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between text-[8px] font-mono text-gray-500 uppercase tracking-widest">
                            <span>Status do Sistema</span>
                            <span className="text-emerald-500 animate-pulse">Online</span>
                        </div>
                        <div className="space-y-1">
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500/40 w-3/4"></div>
                            </div>
                            <p className="text-[8px] font-mono text-gray-600 uppercase">Sistema Operacional: 100%</p>
                        </div>
                    </div>
                </div>

                {/* Content Viewer */}
                <div className="lg:col-span-3 min-h-[60vh] bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden relative group shadow-2xl">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 p-4 pointer-events-none">
                        <Zap size={14} className="text-purple-500/30" />
                    </div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>

                    {selectedDoc ? (
                        <div className="p-8 md:p-12 overflow-y-auto max-h-[80vh] custom-scrollbar">
                            {/* Metadata Badge */}
                            {selectedDoc.metadata?.priority && (
                                <div className="inline-flex items-center gap-2 px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded md mb-6">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_5px_rgba(168,85,247,0.8)]"></span>
                                    <span className="text-[8px] font-mono text-purple-400 uppercase tracking-widest font-bold">
                                        Nível: {selectedDoc.metadata.priority}
                                    </span>
                                </div>
                            )}

                            <article className="prose prose-invert prose-purple max-w-none">
                                <ReactMarkdown
                                    components={{
                                        h1: ({ node, ...props }) => <h1 className="text-3xl font-orbitron font-bold text-white mb-8 border-b border-white/10 pb-4 italic" {...props} />,
                                        h2: ({ node, ...props }) => <h2 className="text-xl font-orbitron font-bold text-purple-400 mt-10 mb-4 flex items-center gap-2" {...props} />,
                                        h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-gray-200 mt-8 mb-2" {...props} />,
                                        p: ({ node, ...props }) => <p className="text-sm text-gray-400 leading-relaxed mb-4 font-mono select-text" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 mb-6" {...props} />,
                                        li: ({ node, ...props }) => <li className="text-sm text-gray-400 font-mono" {...props} />,
                                        code: ({ node, ...props }) => <code className="bg-purple-500/10 text-purple-300 px-1.5 py-0.5 rounded font-mono text-xs border border-purple-500/20" {...props} />,
                                        blockquote: ({ node, ...props }) => (
                                            <blockquote className="border-l-4 border-purple-500/50 bg-purple-500/5 p-4 rounded-r-xl italic my-6 text-gray-300 text-sm" {...props} />
                                        ),
                                        hr: () => <hr className="border-white/5 my-10" />,
                                    }}
                                >
                                    {selectedDoc.content}
                                </ReactMarkdown>
                            </article>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500 font-mono text-[10px] uppercase">
                            <FileText size={40} className="text-gray-800" />
                            <span>Selecione um ativo para visualizar</span>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(168, 85, 247, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(168, 85, 247, 0.4);
                }
            `}</style>
        </div>
    )
}
