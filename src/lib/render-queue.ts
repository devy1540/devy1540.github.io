import { RenderCache } from "./render-cache.ts"

export class RenderCancelledError extends Error {
  constructor() { super("Render request cancelled"); this.name = "RenderCancelledError" }
}

interface Waiter { resolve: (value: string) => void; reject: (error: unknown) => void }
interface Job<T> { key: string; input: T; started: boolean; waiters: Set<Waiter> }

// 한 번에 한 작업만 실행하고 작업 사이에 브라우저가 입력과 페인트를 처리하게 한다.
export function createRenderQueue<T>(render: (input: T) => Promise<string>) {
  const cache = new RenderCache<string>()
  const pending = new Map<string, Job<T>>()
  const queue: Job<T>[] = []
  let running = false

  async function flush() {
    while (queue.length) {
      const job = queue.shift()!
      if (!job.waiters.size) continue
      job.started = true
      try {
        const value = await render(job.input)
        cache.set(job.key, value, (job.key.length + value.length) * 2)
        for (const waiter of job.waiters) waiter.resolve(value)
      } catch (error) {
        for (const waiter of job.waiters) waiter.reject(error)
      } finally {
        if (pending.get(job.key) === job) pending.delete(job.key)
        job.waiters.clear()
      }
      await new Promise<void>(resolve => setTimeout(resolve, 0))
    }
    running = false
  }

  return function request(key: string, input: T) {
    const saved = cache.get(key)
    if (saved !== undefined) return { promise: Promise.resolve(saved), cancel: () => {} }
    let job = pending.get(key)
    if (!job) {
      job = { key, input, started: false, waiters: new Set() }
      pending.set(key, job)
      queue.push(job)
    }
    const current = job
    let waiter: Waiter
    const promise = new Promise<string>((resolve, reject) => {
      waiter = { resolve, reject }
      current.waiters.add(waiter)
    })
    if (!running) { running = true; setTimeout(() => { void flush() }, 16) }
    return {
      promise,
      cancel() {
        if (!current.waiters.delete(waiter!)) return
        waiter!.reject(new RenderCancelledError())
        if (!current.started && !current.waiters.size && pending.get(key) === current) pending.delete(key)
      },
    }
  }
}
