import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'ATELIER' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Atelier partner privileges required' }, { status: 403 });
    }

    let atelierId = user.atelier?.id;

    // Admin can specify atelierId or view all
    const { searchParams } = new URL(req.url);
    if (user.role === 'ADMIN' && searchParams.get('atelierId')) {
      atelierId = searchParams.get('atelierId')!;
    }

    const where: any = {};
    if (atelierId) {
      where.atelierId = atelierId;
    }

    const assignments = await prisma.atelierAssignment.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        atelier: true,
        dress: {
          include: {
            images: { where: { isPrimary: true } },
            owner: { select: { id: true, name: true, phone: true } },
          },
        },
        booking: {
          select: {
            id: true,
            bookingReference: true,
            startDate: true,
            endDate: true,
            totalDays: true,
            status: true,
            deliveryAddress: true,
            specialRequests: true,
            customer: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
        processingRecords: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({ success: true, assignments });
  } catch (error) {
    console.error('Error fetching atelier assignments:', error);
    return NextResponse.json({ error: 'Failed to retrieve assignments' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (user.role !== 'ATELIER' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Atelier privileges required' }, { status: 403 });
    }

    const { assignmentId, operationalStatus, note, description } = await req.json();

    if (!assignmentId || !operationalStatus) {
      return NextResponse.json(
        { error: 'Assignment ID and operational status are required' },
        { status: 400 }
      );
    }

    const assignment = await prisma.atelierAssignment.findUnique({
      where: { id: assignmentId },
      include: { booking: true },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Verify atelier ownership if not admin
    if (user.role === 'ATELIER' && user.atelier?.id !== assignment.atelierId) {
      return NextResponse.json({ error: 'Unauthorized to modify this assignment' }, { status: 403 });
    }

    // Determine timestamp updates based on operational status
    const updateData: any = {
      operationalStatus,
      notes: note || assignment.notes,
    };

    const now = new Date();
    if (operationalStatus === 'RECEIVED') updateData.receivedAt = now;
    if (operationalStatus === 'READY') updateData.readyAt = now;
    if (operationalStatus === 'COLLECTED') updateData.collectedAt = now;
    if (operationalStatus === 'RETURNED') updateData.returnedAt = now;

    // Map to booking status if applicable
    let bookingNewStatus: string | null = null;
    if (operationalStatus === 'READY') bookingNewStatus = 'READY_FOR_COLLECTION';
    if (operationalStatus === 'COLLECTED') bookingNewStatus = 'ACTIVE_RENTAL';
    if (operationalStatus === 'RETURNED') bookingNewStatus = 'RETURNED';

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.atelierAssignment.update({
        where: { id: assignmentId },
        data: updateData,
        include: { processingRecords: true },
      });

      // Record stage history
      await tx.dressProcessingRecord.create({
        data: {
          assignmentId,
          stage: operationalStatus,
          description: description || note || `Stage updated to ${operationalStatus}`,
          performedBy: user.name,
        },
      });

      // Update booking status and history
      if (bookingNewStatus) {
        await tx.booking.update({
          where: { id: assignment.bookingId },
          data: {
            status: bookingNewStatus,
            statusHistory: {
              create: {
                status: bookingNewStatus,
                changedByUserId: user.id,
                note: `Atelier update: ${operationalStatus}. ${note || ''}`,
              },
            },
          },
        });
      }

      return result;
    });

    return NextResponse.json({ success: true, assignment: updated });
  } catch (error) {
    console.error('Error updating atelier assignment:', error);
    return NextResponse.json({ error: 'Failed to update atelier status' }, { status: 500 });
  }
}
