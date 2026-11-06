import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyApiAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.platformSetting.findMany();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, settings: [], error: 'Failed to retrieve settings' }, { status: 200 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyApiAuth(['ADMIN'], true);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { key, value } = await req.json();

    if (!key) {
      return NextResponse.json({ error: 'Setting key is required' }, { status: 400 });
    }

    const updated = await prisma.platformSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    await prisma.adminActivityLog.create({
      data: {
        adminId: auth.user!.id,
        action: 'UPDATE_SETTING',
        targetType: 'PLATFORM_SETTING',
        targetId: key,
        details: `Updated platform setting "${key}" to "${value}"`,
      },
    });

    return NextResponse.json({ success: true, setting: updated });
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
