-- SQL para criar uma chave mestra
-- Execute este comando no Prisma Studio ou diretamente no banco

INSERT INTO "invite_codes" (
    id,
    code,
    role,
    "workspaceId",
    "creatorId",
    "maxUses",
    "usedCount",
    "expiresAt",
    "isActive",
    "createdAt",
    "updatedAt"
)
SELECT
    gen_random_uuid(),
    'MASTER-2025',
    'ARTIST',
    w.id,
    u.id,
    999,
    0,
    '2099-12-31'::timestamp,
    true,
    NOW(),
    NOW()
FROM workspaces w
CROSS JOIN users u
WHERE u.role IN ('ADMIN', 'ARTIST')
LIMIT 1;
