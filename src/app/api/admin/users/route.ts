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
    const search = searchParams.get('search')?.trim();
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }
    if (role && role !== 'all') where.role = role;
    if (status && status !== 'all') where.status = status;

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        profile: true,
        _count: {
          select: {
            dresses: true,
            bookings: true,
          },
        },
      },
    });

    const sanitizedUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      status: u.status,
      avatarUrl: u.avatarUrl,
      createdAt: u.createdAt,
      dressesCount: u._count.dresses,
      bookingsCount: u._count.bookings,
      location: u.profile?.location,
      bio: u.profile?.bio,
    }));

    return NextResponse.json({ success: true, users: sanitizedUsers });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: 'Failed to retrieve users' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyApiAuth(['ADMIN'], true);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { userId, status, role, reason } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Protect primary admin from self-suspension
    if (targetUser.id === auth.user?.id && status === 'SUSPENDED') {
      return NextResponse.json({ error: 'Cannot suspend your own administrator account' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(status && { status }),
        ...(role && { role }),
      },
    });

    // Record admin activity log
    await prisma.adminActivityLog.create({
      data: {
        adminId: auth.user!.id,
        action: status === 'SUSPENDED' ? 'SUSPEND_USER' : status === 'ACTIVE' ? 'REACTIVATE_USER' : 'UPDATE_USER_ROLE',
        targetType: 'USER',
        targetId: userId,
        details: `Updated ${targetUser.email} status to ${status || targetUser.status}, role to ${role || targetUser.role}. Note: ${reason || 'Admin action'}`,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
