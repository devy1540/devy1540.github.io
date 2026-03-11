import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rotation: number
  rotationSpeed: number
  opacity: number
}

const COLORS = [
  "#ff577f", "#ff884b", "#ffd384", "#fff9b0",
  "#3ec1d3", "#7c83fd", "#a66cff", "#59ce8f",
]

const PARTICLES_PER_BURST = 100
const GRAVITY = 0.12
const DURATION = 3500
const BURST_ORIGINS = [0.25, 0.5, 0.75]
const BURST_DELAYS = [0, 300, 600]
const SECRET_SEQUENCE = ["KeyP", "KeyA", "KeyR", "KeyT", "KeyY"]
const SEQUENCE_TIMEOUT = 2000

export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bufferRef = useRef("")
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return

      clearTimeout(timerRef.current)
      bufferRef.current += e.code + ","

      if (bufferRef.current.split(",").filter(Boolean).slice(-SECRET_SEQUENCE.length).join(",") === SECRET_SEQUENCE.join(",")) {
        bufferRef.current = ""
        fireConfetti()
        return
      }

      timerRef.current = setTimeout(() => {
        bufferRef.current = ""
      }, SEQUENCE_TIMEOUT)
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      clearTimeout(timerRef.current)
    }
  }, [])

  function fireConfetti() {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    canvas.style.display = "block"

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    interface Burst { particles: Particle[]; startTime: number }
    const bursts: Burst[] = []
    const globalStart = performance.now()

    function spawnBurst(originX: number) {
      const particles: Particle[] = Array.from({ length: PARTICLES_PER_BURST }, () => ({
        x: originX,
        y: window.innerHeight * 0.55,
        vx: (Math.random() - 0.5) * 16,
        vy: Math.random() * -14 - 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
        size: Math.random() * 8 + 4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        opacity: 1,
      }))
      bursts.push({ particles, startTime: performance.now() })
    }

    BURST_ORIGINS.forEach((ratio, i) => {
      setTimeout(() => spawnBurst(window.innerWidth * ratio), BURST_DELAYS[i])
    })

    function animate(now: number) {
      const globalElapsed = now - globalStart
      const totalDuration = DURATION + BURST_DELAYS[BURST_DELAYS.length - 1]!
      if (globalElapsed > totalDuration) {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
        canvas!.style.display = "none"
        return
      }

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)

      for (const burst of bursts) {
        const elapsed = now - burst.startTime
        const fadeStart = DURATION * 0.6
        for (const p of burst.particles) {
          p.x += p.vx
          p.vy += GRAVITY
          p.y += p.vy
          p.vx *= 0.99
          p.rotation += p.rotationSpeed

          if (elapsed > fadeStart) {
            p.opacity = Math.max(0, 1 - (elapsed - fadeStart) / (DURATION - fadeStart))
          }

          ctx!.save()
          ctx!.translate(p.x, p.y)
          ctx!.rotate(p.rotation)
          ctx!.globalAlpha = p.opacity
          ctx!.fillStyle = p.color
          ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
          ctx!.restore()
        }
      }

      requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ display: "none" }}
    />
  )
}
