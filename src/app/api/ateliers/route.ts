import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyApiAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const ateliers = await prisma.atelier.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { assignments: true },
        },
      },
    });

    return NextResponse.json({ success: true, ateliers });
  } catch (error) {
    console.error('Error fetching ateliers:', error);
    return NextResponse.json({ success: false, ateliers: [], error: 'Failed to retrieve ateliers' }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyApiAuth(['ADMIN'], true);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { name, contactPerson, email, phone, address, city, postalCode } = await req.json();

    if (!name || !email || !phone || !address || !city) {
      return NextResponse.json({ error: 'Please provide all atelier partner details' }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const atelier = await prisma.atelier.create({
      data: {
        name: name.trim(),
        slug,
        contactPerson: contactPerson?.trim() || name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode?.trim() || '75000',
        isActive: true,
      },
    });

    await prisma.adminActivityLog.create({
      data: {
        adminId: auth.user!.id,
        action: 'ADD_ATELIER',
        targetType: 'ATELIER',
        targetId: atelier.id,
        details: `Added new partner atelier "${atelier.name}" in ${atelier.city}`,
      },
    });

    return NextResponse.json({ success: true, atelier }, { status: 201 });
  } catch (error) {
    console.error('Error creating atelier:', error);
    return NextResponse.json({ error: 'Failed to create atelier' }, { status: 500 });
  }
}
