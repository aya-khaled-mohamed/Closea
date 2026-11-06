import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        dress: {
          include: {
            images: true,
            owner: { select: { id: true, name: true, phone: true, email: true } },
          },
        },
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        atelierAssignment: {
          include: { atelier: true, processingRecords: { orderBy: { createdAt: 'desc' } } },
        },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        transactions: true,
        reviews: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Role-based visibility check: customer, owner, assigned atelier, or admin
    const isCustomer = booking.customerId === user.id;
    const isOwner = booking.dress.ownerId === user.id;
    const isAssignedAtelier = user.atelier?.id === booking.atelierAssignment?.atelierId;
    const isAdmin = user.role === 'ADMIN';

    if (!isCustomer && !isOwner && !isAssignedAtelier && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized to view this booking' }, { status: 403 });
    }

    // Strip sensitive financial information for Atelier accounts (Part 5: "Do not expose customer financial information or unrelated personal information to atelier accounts.")
    if (user.role === 'ATELIER' && !isAdmin) {
      const sanitizedBooking = {
        ...booking,
        rentalSubtotal: undefined,
        platformFee: undefined,
        ownerPayout: undefined,
        totalAmount: undefined,
        transactions: [],
        customer: {
          name: booking.customer.name,
          phone: booking.customer.phone,
        },
      };
      return NextResponse.json({ success: true, booking: sanitizedBooking });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Failed to retrieve booking' }, { status: 500 });
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

    const bookingId = params.id;
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { dress: true, atelierAssignment: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const { action, note, rejectionReason, cancellationReason } = await req.json();

    const isCustomer = booking.customerId === user.id;
    const isOwner = booking.dress.ownerId === user.id;
    const isAdmin = user.role === 'ADMIN';
    const isAtelier = user.role === 'ATELIER';

    let newStatus = booking.status;
    let historyNote = note || '';

    if (action === 'ACCEPT') {
      if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: 'Only the dress owner can accept requests' }, { status: 403 });
      }
      newStatus = 'CONFIRMED';
      historyNote = note || `Request accepted by ${user.name}. Booking confirmed and atelier notified.`;

      // Update transaction status to SUCCESS
      await prisma.transaction.updateMany({
        where: { bookingId: booking.id, type: 'BOOKING_PAYMENT' },
        data: { status: 'SUCCESS' },
      });

      // Update atelier assignment status to RECEIVED/PREPARATION
      if (booking.atelierAssignment) {
        await prisma.atelierAssignment.update({
          where: { id: booking.atelierAssignment.id },
          data: { operationalStatus: 'AWAITING_DELIVERY' },
        });
      }

      // Notify customer
      await prisma.notification.create({
        data: {
          userId: booking.customerId,
          title: `Booking Confirmed: ${booking.dress.title}`,
          message: `Your booking #${booking.bookingReference} has been accepted! The atelier is preparing the garment.`,
          link: '/dashboard/customer',
          type: 'BOOKING_CONFIRMED',
        },
      });
    } else if (action === 'REJECT') {
      if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: 'Only the dress owner can decline requests' }, { status: 403 });
      }
      newStatus = 'REJECTED';
      historyNote = rejectionReason || 'Request declined by dress owner.';

      // Update transaction status to REFUNDED
      await prisma.transaction.updateMany({
        where: { bookingId: booking.id, type: 'BOOKING_PAYMENT' },
        data: { status: 'REFUNDED' },
      });

      // Notify customer
      await prisma.notification.create({
        data: {
          userId: booking.customerId,
          title: `Booking Request Declined`,
          message: `Your request #${booking.bookingReference} could not be fulfilled: ${historyNote}`,
          link: '/dashboard/customer',
          type: 'BOOKING_REJECTED',
        },
      });
    } else if (action === 'CANCEL') {
      if (!isCustomer && !isAdmin) {
        return NextResponse.json({ error: 'Only the renter or admin can cancel a booking' }, { status: 403 });
      }
      newStatus = 'CANCELLED';
      historyNote = cancellationReason || `Cancelled by ${user.name}.`;

      await prisma.notification.create({
        data: {
          userId: booking.dress.ownerId,
          title: `Booking Cancelled: #${booking.bookingReference}`,
          message: `Booking #${booking.bookingReference} was cancelled. Your dress dates are now freed for other renters.`,
          link: '/dashboard/owner',
          type: 'BOOKING_CANCELLED',
        },
      });
    } else if (action === 'ADVANCE_ATELIER' && (isAtelier || isAdmin)) {
      // Atelier operational progression
      const { operationalStatus } = await req.json();
      if (operationalStatus) {
        if (booking.atelierAssignment) {
          await prisma.atelierAssignment.update({
            where: { id: booking.atelierAssignment.id },
            data: { operationalStatus },
          });

          await prisma.dressProcessingRecord.create({
            data: {
              assignmentId: booking.atelierAssignment.id,
              stage: operationalStatus,
              description: historyNote || `Stage advanced to ${operationalStatus}`,
              performedBy: user.name,
            },
          });
        }

        // Map atelier status to booking status
        if (operationalStatus === 'READY') newStatus = 'READY_FOR_COLLECTION';
        if (operationalStatus === 'COLLECTED') newStatus = 'ACTIVE_RENTAL';
        if (operationalStatus === 'RETURNED') newStatus = 'RETURNED';
      }
    } else if (isAdmin && action === 'SET_STATUS') {
      // Direct Admin status override
      const { status } = await req.json();
      if (status) newStatus = status;
      historyNote = note || `Status updated to ${newStatus} by Administrator ${user.name}`;
    } else {
      return NextResponse.json({ error: 'Invalid action provided' }, { status: 400 });
    }

    // Save booking status update and history record
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: newStatus,
        cancellationReason: action === 'CANCEL' ? cancellationReason : booking.cancellationReason,
        statusHistory: {
          create: {
            status: newStatus,
            changedByUserId: user.id,
            note: historyNote,
          },
        },
      },
      include: {
        dress: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
