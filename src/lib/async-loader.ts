export class ResourceLoadTimeoutError extends Error {
  constructor() {
    super("Resource loading timed out")
    this.name = "ResourceLoadTimeoutError"
  }
}

export function createRetryableLoader<T>(load: () => Promise<T>, timeoutMs = 30_000) {
  let pending: Promise<T> | undefined

  return function preload(): Promise<T> {
    if (pending) return pending

    let timer: ReturnType<typeof setTimeout>
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new ResourceLoadTimeoutError()), timeoutMs)
    })

    pending = Promise.race([Promise.resolve().then(load), timeout])
      .finally(() => clearTimeout(timer))
      .catch((error: unknown) => {
        pending = undefined
        throw error
      })

    return pending
  }
}
