export function normalizePackageType(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export function normalizePackageCapacity(capacity: string): string {
  const normalized = normalizePackageType(capacity);
  return normalized || capacity.trim();
}
