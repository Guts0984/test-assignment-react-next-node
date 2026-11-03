type Entry = {
  promise: Promise<unknown>;
  expiresAt: number;
};

const DEFAULT_MAX_ENTRIES = 500;

export class TtlCache {
  private entries = new Map<string, Entry>();
  private readonly ttlMs: number;
  private readonly maxEntries: number;

  constructor(ttlMs: number, maxEntries = DEFAULT_MAX_ENTRIES) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
  }

  getOrSet<T>(key: string, factory: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const hit = this.entries.get(key);
    if (hit) {
      if (hit.expiresAt > now) {
        this.entries.delete(key);
        this.entries.set(key, hit);
        return hit.promise as Promise<T>;
      }
      this.entries.delete(key);
    }

    const promise = factory();
    this.entries.set(key, { promise, expiresAt: now + this.ttlMs });

    promise.catch(() => {
      if (this.entries.get(key)?.promise === promise) {
        this.entries.delete(key);
      }
    });

    if (this.entries.size > this.maxEntries) {
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) this.entries.delete(oldest);
    }

    return promise;
  }

  delete(key: string): void {
    this.entries.delete(key);
  }

  deleteWhere(predicate: (key: string) => boolean): void {
    for (const key of this.entries.keys()) {
      if (predicate(key)) {
        this.entries.delete(key);
      }
    }
  }

  clear(): void {
    this.entries.clear();
  }
}
