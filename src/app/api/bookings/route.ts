import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateBookingFinancials } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get('as') || (user.role === 'OWNER' ? 'owner' : 'customer');

    let where: any = {};

    if (user.role === 'ADMIN') {
      // Admin sees all bookings or can filter
      const status = searchParams.get('status');
      if (status && status !== 'all') where.status = status;
    } else if (roleFilter === 'owner' && user.role === 'OWNER') {
      where.dress = { ownerId: user.id };
    } else {
      where.customerId = user.id;
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        dress: {
          include: {
            images: { where: { isPrimary: true } },
            owner: { select: { id: true, name: true, phone: true } },
          },
        },
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        atelierAssignment: {
          include: {
            atelier: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        transactions: true,
      },
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to retrieve bookings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to book a dress' }, { status: 401 });
    }

    const body = await req.json();
    const {
      dressId,
      startDate: startStr,
      endDate: endStr,
      specialRequests,
      deliveryAddress,
      selectedAtelierId,
    } = body;

    if (!dressId || !startStr || !endStr) {
      return NextResponse.json(
        { error: 'Dress selection, start date, and end date are required' },
        { status: 400 }
      );
    }

    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Invalid dates provided' }, { status: 400 });
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'Rental end date must be after the start date' },
        { status: 400 }
      );
    }

    // Minimum rental calculation (in days)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (totalDays < 2) {
      return NextResponse.json(
        { error: 'Minimum rental duration is 2 days' },
        { status: 400 }
      );
    }

    // Fetch dress
    const dress = await prisma.dress.findUnique({
      where: { id: dressId },
      include: { owner: true },
    });

    if (!dress || dress.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'The selected dress is not available for rental' },
        { status: 404 }
      );
    }

    // Prevent owner from booking their own dress
    if (dress.ownerId === user.id) {
      return NextResponse.json(
        { error: 'You cannot book your own dress listing' },
        { status: 400 }
      );
    }

    // Strict Non-Overlapping Dates Validation
    const conflictingBookings = await prisma.booking.findFirst({
      where: {
        dressId: dress.id,
        status: {
          in: ['PENDING', 'ACCEPTED', 'CONFIRMED', 'ACTIVE_RENTAL', 'READY_FOR_COLLECTION'],
        },
        AND: [
          { startDate: { lt: endDate } },
          { endDate: { gt: startDate } },
        ],
      },
    });

    if (conflictingBookings) {
      return NextResponse.json(
        {
          error:
            'These dates are already reserved or have a pending request. Please select alternate dates.',
        },
        { status: 409 }
      );
    }

    // Fetch dynamic commission settings from database
    const commissionSetting = await prisma.commissionSetting.findFirst({
      where: { isActive: true },
    }) || {
      platformFeePercent: 15.0,
      atelierFeePercent: 10.0,
      ownerSharePercent: 75.0,
    };

    // Calculate financials
    const financials = calculateBookingFinancials(
      dress.rentalPricePerDay,
      totalDays,
      dress.cleaningFee,
      dress.securityDeposit,
      commissionSetting
    );

    // Generate unique booking reference
    const bookingReference = `CLS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Resolve atelier (either selected by customer, or default first active atelier)
    let atelierId = selectedAtelierId;
    if (!atelierId) {
      const defaultAtelier = await prisma.atelier.findFirst({
        where: { isActive: true },
      });
      atelierId = defaultAtelier?.id;
    }

    // Create booking and associated records in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          bookingReference,
          dressId: dress.id,
          customerId: user.id,
          startDate,
          endDate,
          totalDays,
          dailyRate: dress.rentalPricePerDay,
          rentalSubtotal: financials.rentalSubtotal,
          cleaningFee: financials.cleaningFee,
          securityDeposit: financials.securityDeposit,
          platformFee: financials.platformFee,
          atelierFee: financials.atelierFee,
          ownerPayout: financials.ownerPayout,
          totalAmount: financials.totalAmount,
          status: 'PENDING',
          specialRequests: specialRequests?.trim() || null,
          deliveryAddress: deliveryAddress?.trim() || null,
          selectedAtelierId: atelierId || null,
          statusHistory: {
            create: {
              status: 'PENDING',
              changedByUserId: user.id,
              note: `Rental request submitted by ${user.name} for ${totalDays} days.`,
            },
          },
          transactions: {
            create: {
              type: 'BOOKING_PAYMENT',
              amount: financials.totalAmount,
              status: 'PENDING',
              paymentMethod: 'STRIPE_CARD_EMULATED',
              reference: `tx_req_${bookingReference.toLowerCase()}`,
              gatewayNote: 'Pre-authorization held in escrow pending owner approval.',
            },
          },
        },
        include: {
          dress: true,
          statusHistory: true,
        },
      });

      // If an atelier was assigned, create the atelier assignment
      if (atelierId) {
        await tx.atelierAssignment.create({
          data: {
            atelierId,
            bookingId: newBooking.id,
            dressId: dress.id,
            operationalStatus: 'AWAITING_DELIVERY',
            notes: 'Pending owner confirmation. Garment logistics will trigger upon acceptance.',
            processingRecords: {
              create: {
                stage: 'AWAITING_DELIVERY',
                description: 'Booking request created; pending owner confirmation.',
                performedBy: 'System',
              },
            },
          },
        });
      }

      // Notify the dress owner
      await tx.notification.create({
        data: {
          userId: dress.ownerId,
          title: `New Rental Request: ${dress.title}`,
          message: `${user.name} has requested to rent "${dress.title}" from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}.`,
          link: '/dashboard/owner',
          type: 'BOOKING_REQUEST',
        },
      });

      return newBooking;
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to process booking request' }, { status: 500 });
  }
}
