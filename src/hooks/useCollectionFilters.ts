import { useCallback, useMemo } from "react"
import { createSearchParams, useLocation, useNavigate, type SetURLSearchParams } from "react-router-dom"
import { useIsHydrated } from "./useHydratedSearchParams"
import { collectionFilterHash, readCollectionFilters } from "@/lib/collection-filters"

const emptyParams = new URLSearchParams()

export function useCollectionFilters(): [URLSearchParams, SetURLSearchParams, string] {
  const hydrated = useIsHydrated()
  const location = useLocation()
  const navigate = useNavigate()
  const params = useMemo(() => readCollectionFilters(location.search, location.hash), [location.search, location.hash])
  const setParams: SetURLSearchParams = useCallback((next, options) => {
    const nextParams = createSearchParams(typeof next === "function" ? next(params) : next)
    void navigate({ pathname: location.pathname, search: "", hash: collectionFilterHash(nextParams) }, options)
  }, [location.pathname, navigate, params])

  // Keep SSR and the first client render identical. Legacy query links still work
  // and retain their noindex metadata until the reader changes the filters.
  return [hydrated ? params : emptyParams, setParams, hydrated ? location.search.slice(1) : ""]
}
