import { useEffect, useState } from "react"
import { useNavigation } from "react-router-dom"
import { useT } from "@/i18n"

function PendingNavigation({ href }: { href: string }) {
  const t = useT()
  const [visible, setVisible] = useState(false)
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const visibleTimer = setTimeout(() => setVisible(true), 150)
    const slowTimer = setTimeout(() => setSlow(true), 5000)
    return () => {
      clearTimeout(visibleTimer)
      clearTimeout(slowTimer)
    }
  }, [])

  if (!visible) return null
  return (
    <>
      <div role="progressbar" aria-label={t.common.navigating} className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1 animate-pulse bg-primary motion-reduce:animate-none" />
      <span className="sr-only" role="status">{t.common.navigating}</span>
      {slow && (
        <div role="status" className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md flex-wrap items-center justify-center gap-3 rounded-lg border bg-background p-3 text-sm shadow-lg">
          <span>{t.common.navigationSlow}</span>
          <a href={href} className="font-medium text-primary underline underline-offset-4">{t.common.reloadPage}</a>
        </div>
      )}
    </>
  )
}

export function NavigationStatus() {
  const navigation = useNavigation()
  const target = navigation.location
  if (!target) return null
  return <PendingNavigation key={target.key} href={`${target.pathname}${target.search}${target.hash}`} />
}
