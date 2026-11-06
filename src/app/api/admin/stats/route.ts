import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyApiAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await verifyApiAuth(['ADMIN'], true);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const [
      totalUsers,
      totalCustomers,
      totalOwners,
      totalDresses,
      pendingDressApprovals,
      approvedDresses,
      totalBookings,
      activeRentals,
      completedBookings,
      pendingAtelierTasks,
      activeAteliers,
      commissionSetting,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'OWNER' } }),
      prisma.dress.count(),
      prisma.dress.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.dress.count({ where: { status: 'APPROVED' } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'ACTIVE_RENTAL' } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.atelierAssignment.count({
        where: { operationalStatus: { in: ['AWAITING_DELIVERY', 'RECEIVED', 'CLEANING', 'ALTERATION'] } },
      }),
      prisma.atelier.count({ where: { isActive: true } }),
      prisma.commissionSetting.findFirst({ where: { isActive: true } }),
    ]);

    // Financial calculations from confirmed, active, and completed bookings
    const bookings = await prisma.booking.findMany({
      where: {
        status: { in: ['CONFIRMED', 'ACTIVE_RENTAL', 'RETURNED', 'COMPLETED'] },
      },
      select: {
        totalAmount: true,
        rentalSubtotal: true,
        platformFee: true,
        atelierFee: true,
        ownerPayout: true,
        createdAt: true,
      },
    });

    const totalGrossVolume = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalPlatformRevenue = bookings.reduce((sum, b) => sum + b.platformFee, 0);
    const totalOwnerPayouts = bookings.reduce((sum, b) => sum + b.ownerPayout, 0);
    const totalAtelierPayouts = bookings.reduce((sum, b) => sum + b.atelierFee, 0);

    // Category breakdown
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { dresses: true } },
      },
    });

    return NextResponse.json({
      success: true,
      metrics: {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          owners: totalOwners,
        },
        dresses: {
          total: totalDresses,
          pending: pendingDressApprovals,
          approved: approvedDresses,
        },
        bookings: {
          total: totalBookings,
          active: activeRentals,
          completed: completedBookings,
        },
        finances: {
          grossVolume: Math.round(totalGrossVolume * 100) / 100,
          platformRevenue: Math.round(totalPlatformRevenue * 100) / 100,
          ownerPayouts: Math.round(totalOwnerPayouts * 100) / 100,
          atelierPayouts: Math.round(totalAtelierPayouts * 100) / 100,
        },
        operations: {
          pendingAtelierTasks,
          activeAteliers,
        },
        commission: commissionSetting || {
          platformFeePercent: 15.0,
          atelierFeePercent: 10.0,
          ownerSharePercent: 75.0,
        },
        categoryBreakdown: categories.map((c) => ({
          name: c.name,
          count: c._count.dresses,
        })),
      },
    });
  } catch (error) {
    console.error('Error in admin stats:', error);
    return NextResponse.json({ error: 'Failed to retrieve admin analytics' }, { status: 500 });
  }
}
