import { useEffect, useState } from "react"
import { ResourceLoadTimeoutError } from "@/lib/async-loader"

export function useDeferredModule<T>(load: () => Promise<T>) {
  const [value, setValue] = useState<T | null>(null)
  const [error, setError] = useState<{ cause: unknown } | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    void load().then(
      (module) => { if (active) setValue(() => module) },
      (cause: unknown) => { if (active) setError({ cause }) },
    )
    return () => { active = false }
  }, [load, attempt])

  function retry() {
    // A failed module fetch stays cached for this document in Chromium.
    if (error && !(error.cause instanceof ResourceLoadTimeoutError)) {
      window.location.reload()
      return
    }
    setError(null)
    setAttempt((current) => current + 1)
  }

  return { value, error: error !== null, retry }
}
