export class MemoryStorageStrategy {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
  has(key) { return this.map.has(key); }
  clear() { this.map.clear(); }
}
