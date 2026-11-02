export class TtlCache {
    entries = new Map();
    ttlMs;
    constructor(ttlMs) {
        this.ttlMs = ttlMs;
    }
    getOrSet(key, factory) {
        const now = Date.now();
        const hit = this.entries.get(key);
        if (hit) {
            if (hit.expiresAt > now) {
                return hit.promise;
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
    delete(key) {
        this.entries.delete(key);
    }
    deleteWhere(predicate) {
        for (const key of this.entries.keys()) {
            if (predicate(key)) {
                this.entries.delete(key);
            }
        }
    }
    clear() {
        this.entries.clear();
    }
}
