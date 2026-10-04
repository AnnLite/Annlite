/** Storage contract. Production implementation must be atomic (e.g. SQL unique constraint). */
export interface IdempotencyStore {
  /** Returns true if the key was newly claimed, false if it already existed. */
  claim(key: string): Promise<boolean>;
}

export class InMemoryIdempotencyStore implements IdempotencyStore {
  private seen = new Set<string>();
  async claim(key: string): Promise<boolean> {
    if (this.seen.has(key)) return false;
    this.seen.add(key);
    return true;
  }
}

/** Runs `fn` at most once per key. Returns `{ duplicate: true }` on replays. */
export async function once<T>(
  store: IdempotencyStore,
  key: string,
  fn: () => Promise<T>,
): Promise<{ duplicate: false; value: T } | { duplicate: true }> {
  if (!(await store.claim(key))) return { duplicate: true };
  return { duplicate: false, value: await fn() };
}
