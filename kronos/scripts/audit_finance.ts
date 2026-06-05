import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runAudit() {
    console.log("💰 KRONØS OS - Início da Auditoria Financeira...");
    let fixedCount = 0;

    // 1. Auditoria de Bookings (Sessões)
    const bookings = await prisma.booking.findMany({
        include: { artist: true }
    });

    for (const booking of bookings) {
        // Tolerância de centavos na matemática de float
        const mathTotal = booking.studioShare + booking.artistShare;
        const diff = Math.abs(booking.finalValue - mathTotal);

        if (diff > 0.05) {
            console.warn(`⚠️ Inconsistência no Booking ${booking.id}: Total=${booking.finalValue}, Studio=${booking.studioShare}, Artist=${booking.artistShare}`);
            
            // Recalculando baseado na taxa atual do artista
            const rate = booking.artist.commissionRate || 0.5;
            const newStudioShare = booking.finalValue * rate;
            const newArtistShare = booking.finalValue * (1 - rate);

            await prisma.booking.update({
                where: { id: booking.id },
                data: {
                    studioShare: newStudioShare,
                    artistShare: newArtistShare
                }
            });
            fixedCount++;
            console.log(`✅ Corrigido Booking ${booking.id} -> Studio: ${newStudioShare}, Artist: ${newArtistShare}`);
        }
    }

    // 2. Auditoria de Orders (Produtos)
    const orders = await prisma.order.findMany();
    for (const order of orders) {
        const orderMathTotal = order.studioShare + order.artistShare;
        const orderDiff = Math.abs(order.finalTotal - orderMathTotal);

        if (orderDiff > 0.05) {
            console.warn(`⚠️ Inconsistência na Order ${order.id}: Total=${order.finalTotal}, Studio=${order.studioShare}, Artist=${order.artistShare}`);
            
            // Num marketplace, geralmente a divisão depende dos produtos (já calculado no createOrder).
            // Se falhar, colocamos o artistShare como prioritário e o resto pro estúdio.
            const adjustedStudioShare = Math.max(0, order.finalTotal - order.artistShare);
            
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    studioShare: adjustedStudioShare
                }
            });
            fixedCount++;
            console.log(`✅ Corrigido Order ${order.id} -> Studio: ${adjustedStudioShare}`);
        }
    }

    console.log(`\n🎉 Auditoria concluída! Foram feitas ${fixedCount} correções de precisão matemática nas partições financeiras.`);
    process.exit(0);
}

runAudit().catch(e => {
    console.error("Erro na auditoria:", e);
    process.exit(1);
});
