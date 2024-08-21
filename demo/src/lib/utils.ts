import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const isMobile = (() => {
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent || navigator.vendor || '',
  );
})();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
