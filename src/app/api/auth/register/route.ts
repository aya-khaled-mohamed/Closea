import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, phone, location, bio } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Security guard: Prevent unauthorized escalation to ADMIN or ATELIER via public registration
    const requestedRole = (role || 'CUSTOMER').toUpperCase();
    if (requestedRole === 'ADMIN' || requestedRole === 'ATELIER') {
      return NextResponse.json(
        { error: 'Unauthorized role assignment. Public registration only supports Customer and Dress Owner accounts.' },
        { status: 403 }
      );
    }

    const sanitizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists' },
        { status: 409 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        passwordHash,
        name: name.trim(),
        role: requestedRole === 'OWNER' ? 'OWNER' : 'CUSTOMER',
        phone: phone?.trim() || null,
        profile: {
          create: {
            location: location?.trim() || 'Qena, France',
            bio: bio?.trim() || null,
            idVerified: false,
          },
        },
      },
      include: { profile: true },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'CUSTOMER' | 'OWNER',
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating your account' },
      { status: 500 }
    );
  }
}
