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
        // Magic Link Provider Removed for Sovereign Auth Pivot (Phase 15)
        CredentialsProvider({
            id: "credentials",
            name: "Sovereign Login",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                // 1. Find User
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email.toLowerCase() },
                    include: { artist: true }
                })

                if (!user) {
                    throw new Error("Usuário não encontrado.")
                }

                // 2. PASSWORD CHECK (Sovereign)
                if (user.password) {
                    // @ts-ignore (bcryptjs types loaded)
                    const bcrypt = await import('bcryptjs')
                    const isValid = await bcrypt.compare(credentials.password, user.password)

                    if (!isValid) {
                        throw new Error("Senha incorreta.")
                    }
                } else {
                    // MIGRATION FALLBACK: If user has no password (legacy magic link user),
                    // prevent login and tell them to reset/register?
                    // OR: Auto-create password via Invite flow?
                    // Re-registering with same email via /auth/register should update it?
                    // For now, fail secure.
                    throw new Error("Conta antiga sem senha. Por favor, use seu código de convite para atualizar o cadastro.")
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.image
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
