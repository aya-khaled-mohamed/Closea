import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const identifier = params.id;

    // Find by either slug or id
    const dress = await prisma.dress.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        category: true,
        size: true,
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            profile: true,
          },
        },
        reviews: {
          include: {
            author: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!dress) {
      return NextResponse.json({ error: 'Dress not found' }, { status: 404 });
    }

    // Increment views count asynchronously
    await prisma.dress.update({
      where: { id: dress.id },
      data: { viewsCount: { increment: 1 } },
    });

    // Fetch existing confirmed bookings to prevent overlapping dates
    const activeBookings = await prisma.booking.findMany({
      where: {
        dressId: dress.id,
        status: { in: ['CONFIRMED', 'ACTIVE_RENTAL', 'ACCEPTED', 'READY_FOR_COLLECTION'] },
      },
      select: {
        startDate: true,
        endDate: true,
        status: true,
      },
    });

    // Fetch related dresses in the same category
    const relatedDresses = await prisma.dress.findMany({
      where: {
        categoryId: dress.categoryId,
        id: { not: dress.id },
        status: 'APPROVED',
      },
      take: 4,
      include: {
        images: { where: { isPrimary: true } },
        category: true,
        size: true,
      },
    });

    // Check wishlist status for logged in user
    const currentUser = await getCurrentUser();
    let isWishlisted = false;
    if (currentUser) {
      const wishlistEntry = await prisma.wishlist.findUnique({
        where: {
          userId_dressId: {
            userId: currentUser.id,
            dressId: dress.id,
          },
        },
      });
      isWishlisted = !!wishlistEntry;
    }

    return NextResponse.json({
      success: true,
      dress: {
        ...dress,
        isWishlisted,
        bookedDates: activeBookings.map((b) => ({
          startDate: b.startDate,
          endDate: b.endDate,
        })),
        relatedDresses: relatedDresses.map((r) => ({
          ...r,
          primaryImageUrl: r.images[0]?.url || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching dress details:', error);
    return NextResponse.json({ error: 'Failed to retrieve dress details' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const dressId = params.id;
    const existing = await prisma.dress.findUnique({
      where: { id: dressId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Dress not found' }, { status: 404 });
    }

    // Must be dress owner or admin
    if (existing.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized to edit this listing' }, { status: 403 });
    }

    const body = await req.json();
    const updated = await prisma.dress.update({
      where: { id: dressId },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description && { description: body.description }),
        ...(body.brand && { brand: body.brand }),
        ...(body.rentalPricePerDay && { rentalPricePerDay: parseFloat(body.rentalPricePerDay) }),
        ...(body.cleaningFee && { cleaningFee: parseFloat(body.cleaningFee) }),
        ...(body.securityDeposit && { securityDeposit: parseFloat(body.securityDeposit) }),
        ...(body.location && { location: body.location }),
        ...(body.condition && { condition: body.condition }),
        ...(body.status && (user.role === 'ADMIN' ? { status: body.status } : {})),
      },
      include: { images: true, category: true, size: true },
    });

    return NextResponse.json({ success: true, dress: updated });
  } catch (error) {
    console.error('Error updating dress:', error);
    return NextResponse.json({ error: 'Failed to update dress' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const dressId = params.id;
    const existing = await prisma.dress.findUnique({
      where: { id: dressId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Dress not found' }, { status: 404 });
    }

    if (existing.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized to delete this listing' }, { status: 403 });
    }

    // Set to DEACTIVATED so past booking references remain integral
    await prisma.dress.update({
      where: { id: dressId },
      data: { status: 'DEACTIVATED' },
    });

    return NextResponse.json({ success: true, message: 'Listing deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating dress:', error);
    return NextResponse.json({ error: 'Failed to deactivate listing' }, { status: 500 });
  }
}
