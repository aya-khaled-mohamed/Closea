import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === '') return 'EGP 0';
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return 'EGP 0';
  
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(numericAmount).replace('EGP', 'EGP ');
}

export function formatDate(dateString: string | Date): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateRange(startDate: string | Date, endDate: string | Date): string {
  if (!startDate || !endDate) return '';
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';
  
  const startStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(start);
  const endStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(end);
  
  return `${startStr} - ${endStr}`;
}

// الحسابات: التأمين بيتحجز وقت الاستلام، والمستخدم بيدفع الإيجار بس دلوقتي
export function calculateBookingFinancials(
  rentalPricePerDay: number,
  days: number,
  securityDeposit: number,
  commission?: { platformFeePercent: number; atelierFeePercent: number; ownerSharePercent: number }
) {
  const rentalSubtotal = rentalPricePerDay * days;
  const cleaningFee = 0; 
  
  const platformPct = commission?.platformFeePercent ?? 15;
  const atelierPct = commission?.atelierFeePercent ?? 10;
  const ownerPct = commission?.ownerSharePercent ?? 75;

  const platformFee = (rentalSubtotal * platformPct) / 100;
  const atelierFee = (rentalSubtotal * atelierPct) / 100;
  const ownerPayout = (rentalSubtotal * ownerPct) / 100;
  
  // المبلغ المدفوع الآن = الإيجار فقط
  const totalAmount = rentalSubtotal; 

  return {
    rentalSubtotal,
    cleaningFee,
    securityDeposit,
    platformFee,
    atelierFee,
    ownerPayout,
    totalAmount,
  };
}