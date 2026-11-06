import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyApiAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await verifyApiAuth(['ADMIN'], true);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    let setting = await prisma.commissionSetting.findFirst({
      where: { isActive: true },
    });

    if (!setting) {
      setting = await prisma.commissionSetting.create({
        data: {
          key: 'DEFAULT',
          platformFeePercent: 15.0,
          atelierFeePercent: 10.0,
          ownerSharePercent: 75.0,
          isActive: true,
        },
      });
    }

    return NextResponse.json({ success: true, commission: setting });
  } catch (error) {
    console.error('Error fetching commission setting:', error);
    return NextResponse.json({ error: 'Failed to retrieve commission settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyApiAuth(['ADMIN'], true);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { platformFeePercent, atelierFeePercent, ownerSharePercent } = await req.json();

    const pFee = parseFloat(platformFeePercent);
    const aFee = parseFloat(atelierFeePercent);
    const oShare = parseFloat(ownerSharePercent);

    if (isNaN(pFee) || isNaN(aFee) || isNaN(oShare)) {
      return NextResponse.json({ error: 'Invalid percentage values' }, { status: 400 });
    }

    const sum = Math.round((pFee + aFee + oShare) * 100) / 100;
    if (sum !== 100) {
      return NextResponse.json(
        { error: `The sum of Platform (${pFee}%) + Atelier (${aFee}%) + Owner (${oShare}%) must equal exactly 100%. Current total: ${sum}%` },
        { status: 400 }
      );
    }

    const current = await prisma.commissionSetting.findFirst({
      where: { isActive: true },
    });

    const updated = await prisma.commissionSetting.upsert({
      where: { key: current?.key || 'DEFAULT' },
      update: {
        platformFeePercent: pFee,
        atelierFeePercent: aFee,
        ownerSharePercent: oShare,
      },
      create: {
        key: 'DEFAULT',
        platformFeePercent: pFee,
        atelierFeePercent: aFee,
        ownerSharePercent: oShare,
        isActive: true,
      },
    });

    // Record admin activity log
    await prisma.adminActivityLog.create({
      data: {
        adminId: auth.user!.id,
        action: 'UPDATE_COMMISSION',
        targetType: 'SETTING',
        targetId: updated.id,
        details: `Updated commission split: Platform ${pFee}%, Atelier ${aFee}%, Owner ${oShare}%`,
      },
    });

    return NextResponse.json({ success: true, commission: updated });
  } catch (error) {
    console.error('Error updating commission:', error);
    return NextResponse.json({ error: 'Failed to update commission settings' }, { status: 500 });
  }
}
