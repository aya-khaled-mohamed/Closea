import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'closea_fallback_secret_production_ready';
export const SESSION_COOKIE_NAME = 'closea_session';
export const ADMIN_COOKIE_NAME = 'closea_admin_session';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'CUSTOMER' | 'OWNER' | 'ATELIER' | 'ADMIN';
  name: string;
}

export function signToken(payload: TokenPayload, expiresIn = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Retrieves the currently logged-in user from the standard session cookie.
 */
export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      profile: true,
      atelier: true,
    },
  });

  if (!user || user.status === 'SUSPENDED') {
    return null;
  }

  return user;
}

/**
 * Retrieves the administrator from the dedicated admin session cookie.
 */
export async function getCurrentAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || payload.role !== 'ADMIN') return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || user.role !== 'ADMIN' || user.status === 'SUSPENDED') {
    return null;
  }

  return user;
}

/**
 * Helper to check role authorization in API route handlers
 */
export async function verifyApiAuth(
  allowedRoles: string[] = ['CUSTOMER', 'OWNER', 'ATELIER', 'ADMIN'],
  isAdminRoute = false
) {
  const cookieStore = cookies();
  const cookieName = isAdminRoute ? ADMIN_COOKIE_NAME : SESSION_COOKIE_NAME;
  const token = cookieStore.get(cookieName)?.value;

  if (!token) {
    return { authorized: false, error: 'Unauthorized: No session token provided', status: 401, user: null };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return { authorized: false, error: 'Unauthorized: Invalid or expired token', status: 401, user: null };
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { atelier: true, profile: true },
  });

  if (!user || user.status === 'SUSPENDED') {
    return { authorized: false, error: 'Account suspended or not found', status: 403, user: null };
  }

  if (!allowedRoles.includes(user.role)) {
    return { authorized: false, error: 'Forbidden: Insufficient privileges', status: 403, user: null };
  }

  return { authorized: true, user, status: 200 };
}
