import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ wishlist: [] });
    }

    const items = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: {
        dress: {
          include: {
            images: { where: { isPrimary: true } },
            category: true,
            size: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = items.map((item) => ({
      ...item.dress,
      isWishlisted: true,
      primaryImageUrl: item.dress.images[0]?.url || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
    }));

    return NextResponse.json({ success: true, wishlist: formatted });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to retrieve wishlist' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to save dresses to your wishlist' }, { status: 401 });
    }

    const { dressId } = await req.json();
    if (!dressId) {
      return NextResponse.json({ error: 'Dress ID is required' }, { status: 400 });
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_dressId: {
          userId: user.id,
          dressId,
        },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, wishlisted: false });
    } else {
      await prisma.wishlist.create({
        data: {
          userId: user.id,
          dressId,
        },
      });
      return NextResponse.json({ success: true, wishlisted: true });
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}
