import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'EGP0';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatDateRange(start: string | Date, end: string | Date): string {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export interface PriceBreakdown {
  days: number;
  dailyRate: number;
  rentalSubtotal: number;
  cleaningFee: number;
  securityDeposit: number;
  platformFee: number;
  atelierFee: number;
  ownerPayout: number;
  totalAmount: number;
}

export function calculateBookingFinancials(
  dailyRate: number,
  days: number,
  cleaningFee = 25,
  securityDeposit = 100,
  commissionSetting = { platformFeePercent: 15, atelierFeePercent: 10, ownerSharePercent: 75 }
): PriceBreakdown {
  const rentalSubtotal = dailyRate * Math.max(1, days);
  const platformFee = Math.round((rentalSubtotal * (commissionSetting.platformFeePercent / 100)) * 100) / 100;
  const atelierFee = Math.round((rentalSubtotal * (commissionSetting.atelierFeePercent / 100)) * 100) / 100;
  const ownerPayout = Math.round((rentalSubtotal - platformFee - atelierFee) * 100) / 100;
  const totalAmount = rentalSubtotal + cleaningFee + securityDeposit;

  return {
    days,
    dailyRate,
    rentalSubtotal,
    cleaningFee,
    securityDeposit,
    platformFee,
    atelierFee,
    ownerPayout,
    totalAmount,
  };
}
