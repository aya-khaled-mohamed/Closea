// src/lib/auth.ts
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
export const SESSION_COOKIE_NAME = 'closea_session';
export const ADMIN_COOKIE_NAME = 'closea_admin_session';

// دالة توقيع التوكن
export function signToken(payload: { userId: string; email: string; role: string; name: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// دالة جلب المستخدم الحالي (اللي كانت ناقصة)
export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value || cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        profile: true,
        atelier: true,
      },
    });

    if (!user || user.status === 'SUSPENDED') return null;

    return user;
  } catch (error) {
    return null;
  }
}

// دالة التحقق من صلاحيات الـ API (اللي كانت ناقصة)
export async function verifyApiAuth(allowedRoles: string[], requireAdmin = false) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { authorized: false, error: 'Authentication required', status: 401, user: null };
    }

    if (requireAdmin && user.role !== 'ADMIN') {
      return { authorized: false, error: 'Admin privileges required', status: 403, user: null };
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return { authorized: false, error: 'Unauthorized access', status: 403, user: null };
    }

    return { authorized: true, user };
  } catch (error) {
    return { authorized: false, error: 'Server error', status: 500, user: null };
  }
}