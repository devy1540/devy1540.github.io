import { useSyncExternalStore } from "react"
import { useSearchParams } from "react-router-dom"

const subscribe = () => () => {}
const emptyParams = new URLSearchParams()

export function useIsHydrated() { return useSyncExternalStore(subscribe, () => true, () => false) }

// 정적 HTML과 첫 렌더를 맞춘 뒤 URL의 필터를 적용한다.
export function useHydratedSearchParams(): ReturnType<typeof useSearchParams> {
  const hydrated = useIsHydrated()
  const [params, setParams] = useSearchParams()
  return [hydrated ? params : emptyParams, setParams]
}
