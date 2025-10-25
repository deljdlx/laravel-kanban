/**
 * StorageStrategy interface (duck-typed):
 * - getItem(key): string|null
 * - setItem(key, value): void
 * - removeItem(key): void
 * - has(key): boolean
 * - clear(): void
 */
export class LocalStorageStrategy {
  constructor(area = (typeof window !== 'undefined' ? window.localStorage : null)) {
    this.area = area;
  }
  getItem(key) {
    try { return this.area?.getItem?.(key) ?? null; } catch { return null; }
  }
  setItem(key, value) {
    try { this.area?.setItem?.(key, value); } catch {}
  }
  removeItem(key) {
    try { this.area?.removeItem?.(key); } catch {}
  }
  has(key) {
    try { return this.getItem(key) !== null; } catch { return false; }
  }
  clear() {
    try { this.area?.clear?.(); } catch {}
  }
}

