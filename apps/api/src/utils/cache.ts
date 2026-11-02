type Entry = {
  promise: Promise<unknown>;
  expiresAt: number;
};

export class TtlCache {
  private entries = new Map<string, Entry>();
  private readonly ttlMs: number;

  constructor(ttlMs: number) {
    this.ttlMs = ttlMs;
  }

  getOrSet<T>(key: string, factory: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const hit = this.entries.get(key);
    if (hit) {
      if (hit.expiresAt > now) {
        return hit.promise as Promise<T>;
      }
      this.entries.delete(key);
    }

    const promise = factory();
    this.entries.set(key, { promise, expiresAt: now + this.ttlMs });
    // A rejected factory must not poison the cache — evict it so the next
    // call retries, but keep the rejection visible to current awaiters.
    promise.catch(() => {
      if (this.entries.get(key)?.promise === promise) {
        this.entries.delete(key);
      }
    });
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
