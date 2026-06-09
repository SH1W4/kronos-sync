import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getDocumentation } from '@/app/actions/docs'

export async function GET() {
  const clerkUser = await currentUser()
  if (!clerkUser) {
    return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
  }

  const role = (clerkUser.publicMetadata as any)?.role || 'ARTIST'
  const email =
    clerkUser.primaryEmailAddress?.emailAddress ||
    clerkUser.emailAddresses?.[0]?.emailAddress ||
    null

  const docs = await getDocumentation(role, email)
  return NextResponse.json(docs)
}
