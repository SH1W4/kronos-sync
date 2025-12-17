import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

console.log("⚠️ PRE-BOOT CHECK:")
console.log("ID:", process.env.GOOGLE_CLIENT_ID?.substring(0, 10))
console.log("SECRET:", process.env.GOOGLE_CLIENT_SECRET?.substring(0, 10))


export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        GoogleProvider({
            // INVERTIDO TEMPORARIAMENTE PARA CORRIGIR ERRO DE AMBIENTE DA VERCEL
            clientId: process.env.GOOGLE_CLIENT_SECRET ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_ID ?? "",
            authorization: {
                params: {
                    scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
    ],
    // DEBUG LOGS
    callbacks: {
        async signIn({ account, profile }) {
            console.log("DEBUG AUTH - ID STARTS WITH:", process.env.GOOGLE_CLIENT_ID?.substring(0, 5))
            console.log("DEBUG AUTH - SECRET STARTS WITH:", process.env.GOOGLE_CLIENT_SECRET?.substring(0, 5))
            if (account?.provider === "google") {
                // You can add additional checks here if needed
            }
            return true // Allow sign-in by default
        },
        async session({ session, user }) {
            // Adiciona o ID do usuário na sessão para fácil acesso
            if (session.user) {
                (session.user as any).id = user.id;
            }
            return session
        },
    },
    pages: {
        signIn: '/auth/signin',
        // error: '/auth/error',
    },
    debug: process.env.NODE_ENV === 'development',
}
