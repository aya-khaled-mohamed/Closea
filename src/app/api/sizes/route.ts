import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sizes = await prisma.size.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, sizes });
  } catch (error) {
    console.error('Error fetching sizes:', error);
    return NextResponse.json({ success: false, sizes: [], error: 'Failed to retrieve sizes' }, { status: 200 });
  }
}
