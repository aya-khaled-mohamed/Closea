import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyApiAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyApiAuth(['ADMIN'], true);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.trim();

    const where: any = {};
    if (status && status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { brand: { contains: search } },
        { owner: { name: { contains: search } } },
      ];
    }

    const dresses = await prisma.dress.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        images: true,
        category: true,
        size: true,
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { bookings: true },
        },
      },
    });

    return NextResponse.json({ success: true, dresses });
  } catch (error) {
    console.error('Error fetching admin dresses:', error);
    return NextResponse.json({ error: 'Failed to retrieve listings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyApiAuth(['ADMIN'], true);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { dressId, action, rejectionReason, isFeatured } = await req.json();

    if (!dressId) {
      return NextResponse.json({ error: 'Dress ID is required' }, { status: 400 });
    }

    const targetDress = await prisma.dress.findUnique({
      where: { id: dressId },
      include: { owner: true },
    });

    if (!targetDress) {
      return NextResponse.json({ error: 'Dress not found' }, { status: 404 });
    }

    let updatedDress;
    let logAction = '';
    let logDetails = '';

    if (action === 'APPROVE') {
      updatedDress = await prisma.dress.update({
        where: { id: dressId },
        data: {
          status: 'APPROVED',
          rejectionReason: null,
        },
      });
      logAction = 'APPROVE_LISTING';
      logDetails = `Approved listing "${targetDress.title}" (${targetDress.brand})`;

      // Notify owner
      await prisma.notification.create({
        data: {
          userId: targetDress.ownerId,
          title: 'Listing Approved & Live!',
          message: `Your dress "${targetDress.title}" has been approved by Closéa curators and is now available in the marketplace.`,
          link: `/dresses/${targetDress.slug}`,
          type: 'LISTING_APPROVED',
        },
      });
    } else if (action === 'REJECT') {
      if (!rejectionReason) {
        return NextResponse.json(
          { error: 'A specific reason is required when rejecting a listing' },
          { status: 400 }
        );
      }

      updatedDress = await prisma.dress.update({
        where: { id: dressId },
        data: {
          status: 'REJECTED',
          rejectionReason,
        },
      });
      logAction = 'REJECT_LISTING';
      logDetails = `Rejected "${targetDress.title}". Reason: ${rejectionReason}`;

      // Notify owner
      await prisma.notification.create({
        data: {
          userId: targetDress.ownerId,
          title: 'Listing Revision Needed',
          message: `Your dress "${targetDress.title}" was not approved: ${rejectionReason}`,
          link: '/dashboard/owner',
          type: 'LISTING_REJECTED',
        },
      });
    } else if (action === 'TOGGLE_FEATURED') {
      updatedDress = await prisma.dress.update({
        where: { id: dressId },
        data: { isFeatured: Boolean(isFeatured) },
      });
      logAction = 'TOGGLE_FEATURED';
      logDetails = `Set featured status to ${Boolean(isFeatured)} for "${targetDress.title}"`;
    } else if (action === 'DEACTIVATE') {
      updatedDress = await prisma.dress.update({
        where: { id: dressId },
        data: { status: 'DEACTIVATED' },
      });
      logAction = 'DEACTIVATE_LISTING';
      logDetails = `Deactivated listing "${targetDress.title}"`;
    } else {
      return NextResponse.json({ error: 'Invalid action provided' }, { status: 400 });
    }

    // Record admin activity log
    await prisma.adminActivityLog.create({
      data: {
        adminId: auth.user!.id,
        action: logAction,
        targetType: 'DRESS',
        targetId: dressId,
        details: logDetails,
      },
    });

    return NextResponse.json({ success: true, dress: updatedDress });
  } catch (error) {
    console.error('Error updating dress status:', error);
    return NextResponse.json({ error: 'Failed to update dress status' }, { status: 500 });
  }
}
