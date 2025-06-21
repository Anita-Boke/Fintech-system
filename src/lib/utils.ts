import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Class name utility function (keep this as is)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency (e.g. 1000 -> $1,000.00)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Format date (e.g. "2023-05-15" -> "May 15, 2023")
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Generate random account number (e.g. "ACC12345")
export function generateAccountNumber(): string {
  return `ACC${Math.floor(10000 + Math.random() * 90000)}`;
}

// Validate email format
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate phone number format (10 digits)
export function validatePhone(phone: string): boolean {
  const re = /^\d{10}$/;
  return re.test(phone);
}

// Optional: Format phone number for display (e.g. "1234567890" -> "(123) 456-7890")
export function formatPhoneNumber(phone: string): string {
  if (!validatePhone(phone)) return phone;
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}

// Optional: Truncate long strings with ellipsis
export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}