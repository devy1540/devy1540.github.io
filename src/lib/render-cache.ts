export class RenderCache<T> {
  private entries = new Map<string, { value: T; weight: number }>()
  private totalWeight = 0
  private maxEntries: number
  private maxWeight: number

  constructor(maxEntries = 64, maxWeight = 4 * 1024 * 1024) {
    this.maxEntries = maxEntries
    this.maxWeight = maxWeight
  }

  get(key: string): T | undefined {
    const entry = this.entries.get(key)
    if (!entry) return undefined
    this.entries.delete(key)
    this.entries.set(key, entry)
    return entry.value
  }

  set(key: string, value: T, weight: number) {
    const previous = this.entries.get(key)
    if (previous) this.totalWeight -= previous.weight
    this.entries.delete(key)
    if (weight > this.maxWeight) return
    this.entries.set(key, { value, weight })
    this.totalWeight += weight
    while (this.entries.size > this.maxEntries || this.totalWeight > this.maxWeight) {
      const oldest = this.entries.keys().next().value!
      this.totalWeight -= this.entries.get(oldest)!.weight
      this.entries.delete(oldest)
    }
  }
}
