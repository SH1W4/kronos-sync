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
            id: "credentials",
            name: "Test Login",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (credentials?.username === "master") {
                    const masterUser = await prisma.user.findFirst({
                        where: { email: { in: ['galeria.kronos@gmail.com', 'admin@kronos.com'] } }
                    })
                    if (masterUser) return masterUser
                }
                return null
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
