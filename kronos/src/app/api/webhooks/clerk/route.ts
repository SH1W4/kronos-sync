import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { clerkClient, WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  // Handle the event
  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses[0]?.email_address;

    if (!email) {
      console.error(`[CLERK WEBHOOK] No email found for user ${id}`);
      return new Response('No email found', { status: 400 });
    }

    console.log(`[CLERK WEBHOOK] Processing ${eventType} for user ${id}, email: ${email}`);

    try {
      // 1. Buscar usuário existente para preservar nome customizado
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { clerkId: id }] }
      })

      const clerkName = `${first_name || ''} ${last_name || ''}`.trim() || email.split('@')[0]

      // Preserva o nome customizado se já existir — apenas sobrescreve com dado do Clerk se ainda não há nome no banco
      const nameToSave = (existingUser?.name && existingUser.name !== email.split('@')[0])
        ? existingUser.name
        : clerkName

      // 1. Sync with Prisma
      const dbUser = await prisma.user.upsert({
        where: { email },
        update: {
          clerkId: id,
          name: nameToSave,
          image: image_url,
        },
        create: {
          email,
          clerkId: id,
          name: clerkName,
          image: image_url,
          role: 'ARTIST',
        },
      });

      console.log(`[CLERK WEBHOOK] User synced to Prisma: ${dbUser.id}, role: ${dbUser.role}`);

      // 2. Sync Role & Workspace to Clerk Metadata (for client-side access)
      const userWithWorkspace = await prisma.user.findUnique({
        where: { id: dbUser.id },
        include: { memberships: { include: { workspace: true } } }
      });

      const activeWorkspace = userWithWorkspace?.memberships[0]?.workspace;
      const membershipsCount = userWithWorkspace?.memberships.length || 0;

      console.log(`[CLERK WEBHOOK] User has ${membershipsCount} workspace membership(s)`);
      if (!activeWorkspace) {
        console.warn(`[CLERK WEBHOOK] User ${id} has no workspace membership - will need invite code`);
      }

      const client = await clerkClient();
      await client.users.updateUserMetadata(id, {
        publicMetadata: {
          role: dbUser.role,
          workspace: activeWorkspace ? {
            id: activeWorkspace.id,
            name: activeWorkspace.name,
            primaryColor: activeWorkspace.primaryColor,
            logoUrl: activeWorkspace.logoUrl,
            capacity: activeWorkspace.capacity,
            googleCalendarId: activeWorkspace.googleCalendarId
          } : null
        }
      });

      console.log(`[CLERK WEBHOOK] Metadata updated for user ${id}, workspace: ${activeWorkspace?.name || 'none'}`);
    } catch (error) {
      console.error('[CLERK WEBHOOK] Error syncing user with Prisma:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  return new Response('', { status: 200 })
}
