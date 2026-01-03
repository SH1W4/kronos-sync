'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, TrendingUp, AlertCircle, CheckCircle2, Clock, Download } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Feedback {
    id: string
    type: 'SUGGESTION' | 'BUG' | 'FEATURE'
    message: string
    userEmail: string
    userName: string
    status: 'PENDING' | 'REVIEWED' | 'IMPLEMENTED'
    createdAt: Date
    workspaceId: string
}

export default function FeedbackDashboard() {
    const { data: session } = useSession()
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'ALL' | 'SUGGESTION' | 'BUG' | 'FEATURE'>('ALL')
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'REVIEWED' | 'IMPLEMENTED'>('ALL')

    const isAdmin = session?.user?.role === 'ADMIN'

    useEffect(() => {
        if (!isAdmin) return
        fetchFeedbacks()
    }, [isAdmin])

    const fetchFeedbacks = async () => {
        try {
            const res = await fetch('/api/feedback')
            const data = await res.json()
            setFeedbacks(data.feedbacks || [])
        } catch (error) {
            console.error('Error fetching feedbacks:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (id: string, status: 'PENDING' | 'REVIEWED' | 'IMPLEMENTED') => {
        try {
            await fetch('/api/feedback', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            })
            fetchFeedbacks()
        } catch (error) {
            console.error('Error updating status:', error)
        }
    }

    const exportFeedbacks = () => {
        const csv = [
            ['Data', 'Tipo', 'Status', 'Usuário', 'Email', 'Mensagem'].join(','),
            ...filteredFeedbacks.map(f => [
                format(new Date(f.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
                f.type,
                f.status,
                f.userName,
                f.userEmail,
                `"${f.message.replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `feedback_${format(new Date(), 'yyyy-MM-dd')}.csv`
        a.click()
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="text-red-500" />
                            Acesso Restrito
                        </CardTitle>
                        <CardDescription>
                            Esta página é exclusiva para administradores.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    const filteredFeedbacks = feedbacks.filter(f => {
        const typeMatch = filter === 'ALL' || f.type === filter
        const statusMatch = statusFilter === 'ALL' || f.status === statusFilter
        return typeMatch && statusMatch
    })

    const stats = {
        total: feedbacks.length,
        pending: feedbacks.filter(f => f.status === 'PENDING').length,
        reviewed: feedbacks.filter(f => f.status === 'REVIEWED').length,
        implemented: feedbacks.filter(f => f.status === 'IMPLEMENTED').length,
        suggestions: feedbacks.filter(f => f.type === 'SUGGESTION').length,
        bugs: feedbacks.filter(f => f.type === 'BUG').length,
        features: feedbacks.filter(f => f.type === 'FEATURE').length
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Central de Feedback</h1>
                        <p className="text-muted-foreground">Sugestões e relatórios da equipe via KAI</p>
                    </div>
                    <Button onClick={exportFeedbacks} variant="outline" className="gap-2">
                        <Download size={16} />
                        Exportar CSV
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Clock size={14} />
                                Pendentes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <TrendingUp size={14} />
                                Revisados
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-500">{stats.reviewed}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <CheckCircle2 size={14} />
                                Implementados
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-500">{stats.implemented}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Filtros</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Tipo</label>
                            <div className="flex gap-2">
                                <Button
                                    variant={filter === 'ALL' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilter('ALL')}
                                >
                                    Todos ({stats.total})
                                </Button>
                                <Button
                                    variant={filter === 'SUGGESTION' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilter('SUGGESTION')}
                                >
                                    Sugestões ({stats.suggestions})
                                </Button>
                                <Button
                                    variant={filter === 'BUG' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilter('BUG')}
                                >
                                    Bugs ({stats.bugs})
                                </Button>
                                <Button
                                    variant={filter === 'FEATURE' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilter('FEATURE')}
                                >
                                    Features ({stats.features})
                                </Button>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Status</label>
                            <div className="flex gap-2">
                                <Button
                                    variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setStatusFilter('ALL')}
                                >
                                    Todos
                                </Button>
                                <Button
                                    variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setStatusFilter('PENDING')}
                                >
                                    Pendentes
                                </Button>
                                <Button
                                    variant={statusFilter === 'REVIEWED' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setStatusFilter('REVIEWED')}
                                >
                                    Revisados
                                </Button>
                                <Button
                                    variant={statusFilter === 'IMPLEMENTED' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setStatusFilter('IMPLEMENTED')}
                                >
                                    Implementados
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Feedback List */}
                <div className="space-y-4">
                    {loading ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                Carregando feedbacks...
                            </CardContent>
                        </Card>
                    ) : filteredFeedbacks.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                Nenhum feedback encontrado com os filtros selecionados.
                            </CardContent>
                        </Card>
                    ) : (
                        filteredFeedbacks.map((feedback) => (
                            <Card key={feedback.id} className="hover:border-primary/50 transition-colors">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={
                                                    feedback.type === 'BUG' ? 'destructive' :
                                                        feedback.type === 'FEATURE' ? 'default' : 'secondary'
                                                }>
                                                    {feedback.type}
                                                </Badge>
                                                <Badge variant={
                                                    feedback.status === 'IMPLEMENTED' ? 'default' :
                                                        feedback.status === 'REVIEWED' ? 'secondary' : 'outline'
                                                }>
                                                    {feedback.status}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-base">{feedback.userName}</CardTitle>
                                            <CardDescription className="text-xs">
                                                {feedback.userEmail} • {format(new Date(feedback.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            {feedback.status === 'PENDING' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => updateStatus(feedback.id, 'REVIEWED')}
                                                >
                                                    Marcar como Revisado
                                                </Button>
                                            )}
                                            {feedback.status === 'REVIEWED' && (
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    onClick={() => updateStatus(feedback.id, 'IMPLEMENTED')}
                                                >
                                                    Marcar como Implementado
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{feedback.message}</p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
