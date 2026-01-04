import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

console.log("⚠️ Auth initialized")


export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    session: {
        strategy: "jwt",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
            authorization: {
                params: {
                    scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
        CredentialsProvider({
            id: "magic-link",
            name: "Magic Link",
            credentials: {
                email: { label: "Email", type: "email" },
                code: { label: "Code", type: "text" },
                inviteCode: { label: "Invite Code", type: "text" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.code) return null

                try {
                    // 1. Validate Login Code
                    const verificationCode = await prisma.verificationCode.findFirst({
                        where: {
                            email: credentials.email.toLowerCase(),
                            code: credentials.code.trim(),
                            used: false,
                            expiresAt: { gte: new Date() }
                        },
                        orderBy: { createdAt: 'desc' }
                    })

                    if (!verificationCode) {
                        throw new Error("Código inválido ou expirado")
                    }

                    // 2. Mark code as used
                    await prisma.verificationCode.update({
                        where: { id: verificationCode.id },
                        data: { used: true }
                    })

                    // 3. Find User
                    let user = await prisma.user.findUnique({
                        where: { email: credentials.email.toLowerCase() },
                        include: { artist: true }
                    })

                    // 4. Professional Gate Logic
                    const isProfessional = user && (user.role === 'ARTIST' || user.role === 'ADMIN')
                    const inviteCode = credentials.inviteCode

                    if (!isProfessional) {
                        // If not a pro, MUST have a valid invite code to enter
                        if (!inviteCode) {
                            throw new Error("Acesso restrito a profissionais. Utilize um link de convite.")
                        }

                        const invite = await prisma.inviteCode.findUnique({
                            where: { code: inviteCode, isActive: true },
                        })

                        if (!invite || (invite.expiresAt && invite.expiresAt < new Date()) || (invite.maxUses > 0 && invite.currentUses >= invite.maxUses)) {
                            throw new Error("Convite inválido ou expirado")
                        }

                        // Create/Upgrade User as Artist
                        if (!user) {
                            user = await prisma.user.create({
                                data: {
                                    email: credentials.email.toLowerCase(),
                                    name: credentials.email.split('@')[0],
                                    role: 'ARTIST'
                                },
                                include: { artist: true }
                            })
                        } else {
                            // If they were a CLIENT, upgrade to ARTIST
                            user = await prisma.user.update({
                                where: { id: user.id },
                                data: { role: 'ARTIST' },
                                include: { artist: true }
                            })
                        }

                        // Create Artist Profile linked to the invite's workspace
                        if (!user.artist) {
                            await prisma.artist.create({
                                data: {
                                    userId: user.id,
                                    workspaceId: invite.workspaceId,
                                    plan: invite.targetPlan || 'GUEST',
                                    validUntil: invite.durationDays ? new Date(Date.now() + invite.durationDays * 24 * 60 * 60 * 1000) : null
                                }
                            })
                        }

                        // Increment invite uses
                        await prisma.inviteCode.update({
                            where: { id: invite.id },
                            data: { currentUses: { increment: 1 } }
                        })
                    }

                    if (!user) {
                        throw new Error("Falha crítica: Usuário não pôde ser autenticado.")
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        image: user.image
                    }
                } catch (error: any) {
                    console.error("❌ Magic Link Error:", error)
                    throw new Error(error.message || "Erro na autenticação")
                }
            }
        }),
        CredentialsProvider({
            id: "credentials", // Dev Mode
            name: "Modo Dev (Bypass)",
            credentials: {
                username: { label: "Username (use 'dev')", type: "text", placeholder: "dev" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    // MESTRE / ADMIN BYPASS
                    // MASTER BYPASS (Used by E2E Tests)
                    if (credentials?.username === "master") {
                        console.log("👑 ACESSO MASTER: Iniciando Sessão Administrativa...")

                        const masterUser = await prisma.user.upsert({
                            where: { email: 'admin@kronos.com' },
                            update: { role: 'ADMIN' },
                            create: {
                                email: 'admin@kronos.com',
                                name: 'Master Admin',
                                role: 'ADMIN',
                                image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Master"
                            }
                        })

                        const workspace = await prisma.workspace.upsert({
                            where: { slug: 'demo-studio' },
                            update: {},
                            create: {
                                name: "Kronus Demo Studio",
                                slug: "demo-studio",
                                primaryColor: "#8B5CF6",
                                ownerId: masterUser.id
                            }
                        })

                        const artist = await prisma.artist.upsert({
                            where: { userId: masterUser.id },
                            create: {
                                userId: masterUser.id,
                                workspaceId: workspace.id,
                                plan: "RESIDENT",
                                commissionRate: 0.10,
                                isActive: true,
                                termsAcceptedAt: new Date()
                            },
                            update: { workspaceId: workspace.id, isActive: true, termsAcceptedAt: new Date() }
                        })

                        await prisma.workspaceMember.upsert({
                            where: { workspaceId_userId: { workspaceId: workspace.id, userId: masterUser.id } },
                            create: { workspaceId: workspace.id, userId: masterUser.id, role: 'ADMIN' },
                            update: { role: 'ADMIN' }
                        })

                        // 3. SEED DATA (Only if totally empty to save time)
                        const bookingCount = await prisma.booking.count({ where: { workspaceId: workspace.id } })
                        if (bookingCount === 0) {
                            const scenarios = [
                                { name: 'Ricardo Mautone', email: 'ricardo@kronos.com', time: 10, art: 'Samurai Full Sleeve', value: 4500 },
                                { name: 'Lucas Mendonça', email: 'lucas@kronos.com', time: 14, art: 'Leão Realismo', value: 2800 },
                                { name: 'Beatriz Oliveira', email: 'beatriz@kronos.com', time: 18, art: 'Floral Fineline', value: 850 }
                            ]

                            for (const s of scenarios) {
                                const u = await prisma.user.upsert({
                                    where: { email: s.email },
                                    create: { name: s.name, email: s.email, role: 'CLIENT', phone: '(11) 99999-0000' },
                                    update: { name: s.name }
                                })

                                const start = new Date()
                                start.setHours(s.time, 0, 0, 0)
                                const end = new Date(start)
                                end.setHours(s.time + 3, 0, 0, 0)

                                const slot = await prisma.slot.create({ data: { workspaceId: workspace.id, startTime: start, endTime: end, macaId: 1 } })
                                const b = await prisma.booking.create({
                                    data: {
                                        workspaceId: workspace.id, artistId: artist.id, clientId: u.id, slotId: slot.id,
                                        status: 'CONFIRMED', value: s.value, finalValue: s.value,
                                        studioShare: s.value * 0.1, artistShare: s.value * 0.9,
                                        scheduledFor: start, duration: 180, fichaStatus: 'COMPLETED'
                                    }
                                })
                                await prisma.anamnesis.create({
                                    data: { clientId: u.id, workspaceId: workspace.id, bookingId: b.id, fullName: s.name, whatsapp: u.phone, artDescription: s.art, agreedValue: s.value.toString() }
                                })
                            }

                            console.log("📝 Semeando feedbacks de demonstração...")
                            await prisma.agentFeedback.createMany({
                                data: [
                                    {
                                        userId: masterUser.id,
                                        workspaceId: workspace.id,
                                        type: 'BUG',
                                        message: 'Botão de salvar não responde ocasionalmente.',
                                        status: 'PENDING'
                                    },
                                    {
                                        userId: masterUser.id,
                                        workspaceId: workspace.id,
                                        type: 'SUGGESTION',
                                        message: 'Adicionar filtro por data na agenda.',
                                        status: 'REVIEWED'
                                    }
                                ]
                            })
                        }

                        return { id: masterUser.id, email: masterUser.email, name: masterUser.name, image: masterUser.image, role: masterUser.role }
                    }

                    // DEV BYPASS (Manual Dev Testing)
                    if (credentials?.username === "dev") {
                        console.log("🔓 ACESSO DEV: Garantindo Perfil de Artista...")

                        let workspace = await prisma.workspace.findFirst()
                        if (!workspace) {
                            const admin = await prisma.user.upsert({
                                where: { email: 'admin@kronos.com' },
                                update: {},
                                create: { email: 'admin@kronos.com', name: 'Admin System', role: 'ADMIN' }
                            })
                            workspace = await prisma.workspace.create({
                                data: { name: "Kronus Demo Studio", slug: "demo-studio", ownerId: admin.id }
                            })
                        }

                        const devUser = await prisma.user.upsert({
                            where: { email: "neo.sh1w4@gmail.com" },
                            update: { role: "ARTIST" },
                            create: { email: "neo.sh1w4@gmail.com", name: "Neo Developer", role: "ARTIST", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" }
                        })

                        await prisma.artist.upsert({
                            where: { userId: devUser.id },
                            create: { userId: devUser.id, workspaceId: workspace.id, plan: "RESIDENT", isActive: true },
                            update: { workspaceId: workspace.id, isActive: true }
                        })

                        await prisma.workspaceMember.upsert({
                            where: { workspaceId_userId: { workspaceId: workspace.id, userId: devUser.id } },
                            create: { workspaceId: workspace.id, userId: devUser.id, role: "ADMIN" },
                            update: { role: "ADMIN" }
                        })

                        return { id: devUser.id, email: devUser.email, name: devUser.name, image: devUser.image, role: devUser.role }
                    }
                    return null
                } catch (error) {
                    console.error("❌ ERRO NO DEV MODE:", error)
                    throw error // Joga o erro para NextAuth capturar
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Se houver usuário (primeiro login), preenche os dados iniciais
            if (user) {
                token.id = user.id
                token.role = (user as any).role
            }

            // Sempre busca/atualiza os dados de workspace e role se tivermos o ID
            // Isso permite que o update() do frontend funcione para convites e promoções
            if (token.id) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: token.id as string },
                        include: { artist: true }
                    })

                    if (dbUser) {
                        token.name = dbUser.name // Sincroniza o nome
                        token.role = dbUser.email === 'admin@kronos.com' ? 'ADMIN' : dbUser.role
                        token.customColor = dbUser.customColor
                        if (dbUser.artist) {
                            token.isArtist = true
                            token.instagram = dbUser.artist.instagram // Sincroniza o instagram
                            token.commissionRate = dbUser.artist.commissionRate
                            token.validUntil = dbUser.artist.validUntil?.toISOString() || null

                            // VERIFICAÇÃO DE REVOGAÇÃO AUTOMÁTICA (GUEST EXPIRADO)
                            if (dbUser.artist.validUntil && new Date(dbUser.artist.validUntil) < new Date()) {
                                console.log(`⏳ ACESSO EXPIRADO para ${dbUser.name}. Revogando automaticamente...`)
                                token.role = 'CLIENT'
                                token.workspaces = []
                                token.activeWorkspaceId = null
                                token.isArtist = false
                            }
                        }
                    }

                    const memberships = await prisma.workspaceMember.findMany({
                        where: { userId: token.id as string },
                        include: { workspace: true }
                    })

                    if (memberships && memberships.length > 0) {
                        token.workspaces = memberships.map(m => ({
                            id: m.workspaceId,
                            name: m.workspace?.name || "Sem Nome",
                            slug: m.workspace?.slug || "",
                            role: m.role,
                            primaryColor: m.workspace?.primaryColor || "#8B5CF6",
                            pixKey: m.workspace?.pixKey || "",
                            pixRecipient: m.workspace?.pixRecipient || ""
                        }))

                        // Define o workspace ativo
                        const currentWorkspaces = token.workspaces as any[]
                        const isValid = currentWorkspaces.some(w => w.id === token.activeWorkspaceId)
                        if (!token.activeWorkspaceId || !isValid) {
                            token.activeWorkspaceId = currentWorkspaces[0].id
                        }
                    } else {
                        token.workspaces = []
                        token.activeWorkspaceId = null
                    }
                } catch (error) {
                    console.error("❌ Erro ao buscar dados do usuário no JWT callback:", error)
                    // Não lança erro para não quebrar o login, apenas mantém o token base
                }
            }

            // Permite troca manual de workspace via update({ activeWorkspaceId: '...' })
            if (trigger === "update" && session?.activeWorkspaceId) {
                token.activeWorkspaceId = session.activeWorkspaceId
            }

            return token
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).workspaces = token.workspaces;
                (session.user as any).activeWorkspaceId = token.activeWorkspaceId;
                (session.user as any).commissionRate = token.commissionRate;
                (session.user as any).isArtist = token.isArtist;
                (session.user as any).instagram = token.instagram;
                (session.user as any).customColor = token.customColor;
                (session.user as any).validUntil = token.validUntil;
            }

            // Map to session root as well for compatibility with legacy components
            (session as any).activeWorkspaceId = token.activeWorkspaceId;
            (session as any).role = token.role;

            return session
        }
    },
    pages: {
        signIn: '/auth/signin',
    },
    debug: process.env.NODE_ENV === 'development',
}
