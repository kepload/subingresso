export function text(value: unknown, min: number, max: number): string | null {
  if (typeof value !== 'string') return null;
  const clean = value.trim();
  return clean.length >= min && clean.length <= max && !/[\u0000-\u001f\u007f]/.test(clean) ? clean : null;
}
export function email(value: unknown): string | null {
  const clean = text(value, 3, 200)?.toLowerCase();
  if (!clean || clean.split('@')[0].length > 64 || clean.startsWith('.') || clean.includes('..') || clean.includes('.@')) return null;
  return /^[A-Za-z0-9!#$%&'*+\-/=?^_`{|}~.]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/.test(clean) ? clean : null;
}
export function phone(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 40 || !/^[+\d\s().\/-]+$/.test(value)) return null;
  let n = value.trim().replace(/[\s().\/-]/g, '');
  if (n.startsWith('+39')) n = n.slice(3);
  else if (n.startsWith('0039')) n = n.slice(4);
  else if (/^393\d{8,9}$/.test(n) || /^390\d{5,10}$/.test(n)) n = n.slice(2);
  if (!/^(?:3\d{8,9}|0\d{5,10})$/.test(n) || /^(\d)\1+$/.test(n)) return null;
  return /^3\d{9}$/.test(n) ? n.slice(0, 3) + ' ' + n.slice(3) : n;
}
