import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();
    const categorySlug = searchParams.get('category')?.trim();
    const sizeLabel = searchParams.get('size')?.trim();
    const color = searchParams.get('color')?.trim();
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const location = searchParams.get('location')?.trim();
    const featured = searchParams.get('featured') === 'true';
    const sort = searchParams.get('sort') || 'newest';
    const ownerId = searchParams.get('ownerId');

    // Build Prisma where clause
    const where: any = {
      status: 'APPROVED', // Public marketplace shows only approved dresses
    };

    if (ownerId) {
      where.ownerId = ownerId;
      // If fetching an owner's own inventory, show all statuses
      delete where.status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { brand: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ];
    }

    if (categorySlug && categorySlug !== 'all') {
      where.category = { slug: categorySlug };
    }

    if (sizeLabel && sizeLabel !== 'all') {
      where.size = { label: { contains: sizeLabel } };
    }

    if (color && color !== 'all') {
      where.color = { contains: color };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.rentalPricePerDay = {};
      if (minPrice !== undefined) where.rentalPricePerDay.gte = minPrice;
      if (maxPrice !== undefined) where.rentalPricePerDay.lte = maxPrice;
    }

    if (location && location !== 'all') {
      where.location = { contains: location };
    }

    if (featured) {
      where.isFeatured = true;
    }

    // Sort order
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { rentalPricePerDay: 'asc' };
    if (sort === 'price-desc') orderBy = { rentalPricePerDay: 'desc' };
    if (sort === 'popular') orderBy = { viewsCount: 'desc' };

    const dresses = await prisma.dress.findMany({
      where,
      orderBy,
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        category: true,
        size: true,
        owner: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    // Check wishlist for current user if logged in
    const currentUser = await getCurrentUser();
    let wishlistedDressIds = new Set<string>();
    if (currentUser) {
      const userWishlists = await prisma.wishlist.findMany({
        where: { userId: currentUser.id },
        select: { dressId: true },
      });
      wishlistedDressIds = new Set(userWishlists.map((w) => w.dressId));
    }

    const formattedDresses = dresses.map((dress) => ({
      ...dress,
      isWishlisted: wishlistedDressIds.has(dress.id),
      primaryImageUrl:
        dress.images.find((img) => img.isPrimary)?.url ||
        dress.images[0]?.url ||
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
    }));

    return NextResponse.json({
      success: true,
      dresses: formattedDresses,
      total: formattedDresses.length,
    });
  } catch (error) {
    console.error('Error fetching dresses:', error);
    return NextResponse.json({ error: 'Failed to retrieve dresses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only registered dress owners or administrators can list dresses' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      brand,
      categoryId,
      sizeId,
      color,
      condition,
      originalPrice,
      rentalPricePerDay,
      cleaningFee,
      securityDeposit,
      location,
      rentalTerms,
      images, // array of url strings
    } = body;

    if (!title || !description || !brand || !categoryId || !sizeId || !rentalPricePerDay || !location) {
      return NextResponse.json(
        { error: 'Please provide all mandatory dress details' },
        { status: 400 }
      );
    }

    // Generate unique slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    // Admins can create auto-approved listings; Owner listings go into PENDING_APPROVAL
    const initialStatus = user.role === 'ADMIN' ? 'APPROVED' : 'PENDING_APPROVAL';

    const dress = await prisma.dress.create({
      data: {
        title: title.trim(),
        slug: uniqueSlug,
        description: description.trim(),
        brand: brand.trim(),
        categoryId,
        sizeId,
        color: color?.trim() || 'Multicolor',
        condition: condition?.trim() || 'Excellent',
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        rentalPricePerDay: parseFloat(rentalPricePerDay),
        cleaningFee: cleaningFee ? parseFloat(cleaningFee) : 25.0,
        securityDeposit: securityDeposit ? parseFloat(securityDeposit) : 100.0,
        location: location.trim(),
        rentalTerms: rentalTerms?.trim() || 'Dry cleaning included by certified atelier.',
        ownerId: user.id,
        status: initialStatus,
        images: {
          create: (images && images.length > 0 ? images : [
            'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80',
          ]).map((url: string, index: number) => ({
            url,
            isPrimary: index === 0,
            displayOrder: index + 1,
          })),
        },
      },
      include: {
        images: true,
        category: true,
        size: true,
      },
    });

    // Notify admins if an owner submitted a listing
    if (initialStatus === 'PENDING_APPROVAL') {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: 'New Dress Pending Approval',
            message: `${user.name} submitted "${dress.title}" for curator review.`,
            link: '/admin/dresses',
            type: 'LISTING_SUBMISSION',
          },
        });
      }
    }

    return NextResponse.json({ success: true, dress }, { status: 201 });
  } catch (error) {
    console.error('Error creating dress listing:', error);
    return NextResponse.json({ error: 'Failed to create dress listing' }, { status: 500 });
  }
}
