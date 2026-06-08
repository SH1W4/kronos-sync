import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import FinanceDashboard from './FinanceDashboard'

export default async function FinancePage() {
    const { userId } = await auth()
    
    if (!userId) {
        redirect('/auth/signin')
    }

    const user = await prisma.user.findUnique({
        where: { clerkId: userId },
    })

    if (user?.role !== 'ADMIN') {
        redirect('/artist/finance/meus-ganhos')
    }

    return <FinanceDashboard />
}
