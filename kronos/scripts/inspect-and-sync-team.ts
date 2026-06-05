import { PrismaClient, UserRole, ArtistPlan } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// Use the production database URL from the command line env or local config
const databaseUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_K5pzLT0MQYWq@ep-long-rain-a498adc9.us-east-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl
        }
    }
})

const CLERK_SECRET_KEY = 'sk_test_fj1bM23vdJRFnv7kP3w3vPEFrm4X3cKvEC45kogjWH';

async function main() {
    console.log('=== INSPECT AND SYNC TEAM STATUS ===\n');
    console.log(`Using database URL: ${databaseUrl.split('@')[1] || databaseUrl}`);

    // 1. Fetch workspaces
    const workspaces = await prisma.workspace.findMany({
        include: {
            members: {
                include: {
                    user: true
                }
            }
        }
    });

    console.log('\n--- WORKSPACES IN DB ---');
    for (const ws of workspaces) {
        console.log(`Workspace: ${ws.name} (${ws.slug}) | ID: ${ws.id}`);
        console.log(`- Google Calendar ID: ${ws.googleCalendarId || 'None'}`);
        console.log(`- Members (${ws.members.length}):`);
        for (const m of ws.members) {
            console.log(`  * ${m.role} | ${m.user.name} (${m.user.email})`);
        }
    }

    if (workspaces.length === 0) {
        console.log('No workspaces found in the database!');
        return;
    }

    const targetWorkspace = workspaces[0]; // Link them to the first workspace found

    // 2. Fetch users from Clerk
    console.log('\n--- FETCHING CLERK USERS ---');
    let clerkUsers: any[] = [];
    try {
        const res = await fetch('https://api.clerk.com/v1/users', {
            headers: {
                'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        if (res.status === 200) {
            clerkUsers = await res.json();
            console.log(`Found ${clerkUsers.length} users in Clerk.`);
        } else {
            console.error(`Clerk API Error: ${res.status}`);
            return;
        }
    } catch (err) {
        console.error('Error fetching from Clerk:', err);
        return;
    }

    // 3. Sync Clerk Users to DB
    console.log('\n--- SYNCING CLERK USERS TO DB ---');
    for (const cu of clerkUsers) {
        const email = cu.email_addresses?.[0]?.email_address;
        if (!email) continue;

        const name = `${cu.first_name || ''} ${cu.last_name || ''}`.trim() || email.split('@')[0];
        const imageUrl = cu.image_url;

        console.log(`Processing Clerk User: ${name} (${email}) [Clerk ID: ${cu.id}]`);

        // Upsert user
        const dbUser = await prisma.user.upsert({
            where: { email },
            update: {
                clerkId: cu.id,
                name,
                image: imageUrl
            },
            create: {
                email,
                clerkId: cu.id,
                name,
                image: imageUrl,
                role: email === 'galeria.kronos@gmail.com' ? 'ADMIN' : 'ARTIST'
            }
        });

        console.log(`  -> Synced user record (ID: ${dbUser.id}, Role: ${dbUser.role})`);

        // If artist or admin, make sure they are workspace members
        const isMember = targetWorkspace.members.some(m => m.user.email === email);
        if (!isMember) {
            await prisma.workspaceMember.create({
                data: {
                    workspaceId: targetWorkspace.id,
                    userId: dbUser.id,
                    role: dbUser.role
                }
            });
            console.log(`  -> Added to workspace "${targetWorkspace.name}" members`);
        }

        // If artist, make sure they have an Artist record
        if (dbUser.role === 'ARTIST') {
            const existingArtist = await prisma.artist.findUnique({
                where: { userId: dbUser.id }
            });

            if (!existingArtist) {
                const newArtist = await prisma.artist.create({
                    data: {
                        userId: dbUser.id,
                        workspaceId: targetWorkspace.id,
                        plan: 'RESIDENT',
                        commissionRate: 0.7, // 70% artist share / 30% studio
                        isActive: true
                    }
                });
                console.log(`  -> Created Artist record (ID: ${newArtist.id})`);
            } else {
                console.log(`  -> Artist record already exists (Sync Enabled: ${existingArtist.calendarSyncEnabled}, Calendar ID: ${existingArtist.googleCalendarId || 'None'})`);
            }
        }
    }

    // 4. Verify Yan and Caio
    console.log('\n--- VERIFYING YAN & CAIO DB + GOOGLE CALENDAR STATE ---');
    const targetEmails = ['yank.tattoo@gmail.com', 'azoth.ttt@gmail.com'];
    for (const email of targetEmails) {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                artist: true,
                memberships: {
                    include: {
                        workspace: true
                    }
                }
            }
        });

        if (!user) {
            console.error(`❌ User ${email} not found in DB!`);
            continue;
        }

        console.log(`\nUser: ${user.name} (${user.email})`);
        console.log(`- Role: ${user.role}`);
        console.log(`- Clerk ID: ${user.clerkId || 'None (⚠️)'}`);
        console.log(`- Workspace Member: ${user.memberships.map(m => m.workspace.name).join(', ') || 'None (⚠️)'}`);
        
        if (user.artist) {
            console.log(`- Artist Record: Found ✅`);
            console.log(`  * Plan: ${user.artist.plan}`);
            console.log(`  * Commission Rate: ${user.artist.commissionRate * 100}%`);
            console.log(`  * Google Calendar Sync Enabled: ${user.artist.calendarSyncEnabled ? 'Yes ✅' : 'No ❌'}`);
            console.log(`  * Google Calendar ID: ${user.artist.googleCalendarId || 'None ❌'}`);
            console.log(`  * Has Refresh Token: ${user.artist.googleRefreshToken ? 'Yes ✅' : 'No ❌'}`);
        } else {
            console.error(`- Artist Record: NOT Found ❌`);
        }
    }

    console.log('\n=== RUN COMPLETED ===');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
