import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as RPointerEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { perfumes, searchPerfumes } from '../data/perfumes'
import type { Perfume } from '../data/perfumes'
import '../styles/library.css'

// World-space size of one shelf slot.
const CW = 190
const CH = 270
const ZMIN = 0.38
const ZMAX = 1.9

const N = perfumes.length
const mod = (a: number, b: number) => ((a % b) + b) % b
// Step through the catalogue so neighbours in a row / column are never the same bottle.
const STEP = [7, 5, 3, 2, 1].find((s) => N % s !== 0) ?? 1
const cellPerfume = (r: number, c: number): Perfume => perfumes[mod(c * STEP + r * 11 + ((r * r) % 3), N)]

type Cam = { x: number; y: number; z: number }
/** The landing: walk up close to the wall, then step back and settle in the middle. */
const INTRO = { from: 0.62, peak: 1.3, inMs: 1700, outMs: 1900 }
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
let savedCam: Cam | null = null // remembered between visits to the wall

type Tip = { p: Perfume; x: number; y: number } | null

export default function Library() {
  const navigate = useNavigate()
  const wallRef = useRef<HTMLDivElement>(null)
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight })
  const homeZ = vp.w < 700 ? 0.62 : 0.95

  const [cam, setCam] = useState<Cam>(() => savedCam ?? { x: CW * 0.5, y: CH * 0.5, z: homeZ * INTRO.from })
  const target = useRef<Cam>(savedCam ?? { x: CW * 0.5, y: CH * 0.5, z: homeZ })
  const camRef = useRef(cam)
  camRef.current = cam
  const raf = useRef(0)

  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [focused, setFocused] = useState(false)
  const [touched, setTouched] = useState(!!savedCam)
  const [tip, setTip] = useState<Tip>(null)
  const [leaving, setLeaving] = useState(false)

  const results = useMemo(() => searchPerfumes(query), [query])
  const hitIds = useMemo(() => new Set(results.map((p) => p.id)), [results])

  // ---- camera animation -------------------------------------------------
  const kick = useCallback(() => {
    if (raf.current) return
    let last = performance.now()
    const tick = (now: number) => {
      const c = camRef.current
      const t = target.current
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const k = 1 - Math.exp(-dt * 9) // the same glide at any frame rate
      const nx = c.x + (t.x - c.x) * k
      const ny = c.y + (t.y - c.y) * k
      const nz = c.z + (t.z - c.z) * k
      const done = Math.abs(t.x - nx) < 0.05 && Math.abs(t.y - ny) < 0.05 && Math.abs(t.z - nz) < 0.0005
      const next = done ? { ...t } : { x: nx, y: ny, z: nz }
      camRef.current = next
      savedCam = { ...t }
      setCam(next)
      raf.current = done ? 0 : requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }, [])

  const intro = useRef<{ cancel: boolean } | null>(null)
  const stopIntro = useCallback(() => {
    if (intro.current) {
      intro.current.cancel = true
      intro.current = null
    }
  }, [])

  useEffect(() => {
    if (savedCam) {
      kick()
    } else {
      // zoom in towards the shelves, then ease back out and come to rest
      const state = { cancel: false }
      intro.current = state
      const zA = homeZ * INTRO.from
      const zB = homeZ * INTRO.peak
      const t0 = performance.now()
      const step = (now: number) => {
        if (state.cancel) return
        const t = now - t0
        const z =
          t < INTRO.inMs
            ? zA + (zB - zA) * easeInOut(t / INTRO.inMs)
            : t < INTRO.inMs + INTRO.outMs
              ? zB + (homeZ - zB) * easeInOut((t - INTRO.inMs) / INTRO.outMs)
              : homeZ
        const c = { x: CW * 0.5, y: CH * 0.5, z }
        camRef.current = c
        target.current = { ...c }
        setCam(c)
        if (t < INTRO.inMs + INTRO.outMs) requestAnimationFrame(step)
        else {
          intro.current = null
          savedCam = { ...c }
        }
      }
      requestAnimationFrame(step)
    }
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      stopIntro()
      cancelAnimationFrame(raf.current)
      raf.current = 0
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kick])

  const zoomAt = useCallback(
    (factor: number, sx = vp.w / 2, sy = vp.h / 2) => {
      stopIntro()
      const t = target.current
      const z = Math.min(ZMAX, Math.max(ZMIN, t.z * factor))
      const dx = sx - vp.w / 2
      const dy = sy - vp.h / 2
      // keep the world point under the cursor fixed
      target.current = { x: t.x + dx / t.z - dx / z, y: t.y + dy / t.z - dy / z, z }
      setTouched(true)
      kick()
    },
    [vp.w, vp.h, kick, stopIntro],
  )

  // wheel = zoom (needs a non-passive listener to stop the page from scrolling / pinch-zooming)
  useEffect(() => {
    const el = wallRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0016)), e.clientX, e.clientY)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  // ---- drag to pan / pinch to zoom ---------------------------------------
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const drag = useRef({ moved: 0, pinch: 0 })

  const onPointerDown = (e: RPointerEvent) => {
    if ((e.target as HTMLElement).closest('.hud')) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    drag.current.moved = 0
    drag.current.pinch = 0
  }
  const onPointerMove = (e: RPointerEvent) => {
    const el = wallRef.current
    const prev = pointers.current.get(e.pointerId)
    if (!prev) return
    const dx = e.clientX - prev.x
    const dy = e.clientY - prev.y
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pts = [...pointers.current.values()]
    if (pts.length === 2) {
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      if (drag.current.pinch) zoomAt(d / drag.current.pinch, (pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2)
      drag.current.pinch = d
      drag.current.moved += 10
      return
    }
    drag.current.moved += Math.abs(dx) + Math.abs(dy)
    if (drag.current.moved < 6) return
    stopIntro()
    if (!el?.hasPointerCapture(e.pointerId)) el?.setPointerCapture(e.pointerId)
    const z = camRef.current.z
    const t = target.current
    target.current = { x: t.x - dx / z, y: t.y - dy / z, z: t.z }
    const c = camRef.current
    camRef.current = { x: c.x - dx / z, y: c.y - dy / z, z: c.z }
    setCam(camRef.current)
    setTip(null)
    setTouched(true)
    kick()
  }
  const onPointerUp = (e: RPointerEvent) => {
    pointers.current.delete(e.pointerId)
    drag.current.pinch = 0
  }

  // ---- opening a perfume --------------------------------------------------
  const open = useCallback(
    (p: Perfume, cell?: { r: number; c: number }) => {
      if (leaving) return
      setLeaving(true)
      setTip(null)
      if (cell) {
        target.current = { x: (cell.c + 0.5) * CW, y: (cell.r + 0.45) * CH, z: 2.6 }
        kick()
      }
      window.setTimeout(() => {
        if (cell) savedCam = { x: (cell.c + 0.5) * CW, y: (cell.r + 0.5) * CH, z: homeZ }
        navigate(`/perfume/${p.id}`)
      }, 520)
    },
    [leaving, kick, navigate, homeZ],
  )

  const onWallClick = (e: React.MouseEvent) => {
    if (drag.current.moved >= 6) return
    const slot = (e.target as HTMLElement).closest<HTMLElement>('.slot')
    if (!slot) return
    const r = Number(slot.dataset.r)
    const c = Number(slot.dataset.c)
    open(cellPerfume(r, c), { r, c })
  }

  const onWallOver = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || pointers.current.size) return
    const slot = (e.target as HTMLElement).closest<HTMLElement>('.slot')
    if (!slot) return setTip(null)
    const img = slot.querySelector('img')
    const rect = (img ?? slot).getBoundingClientRect()
    const p = cellPerfume(Number(slot.dataset.r), Number(slot.dataset.c))
    setTip({ p, x: rect.left + rect.width / 2, y: rect.top })
  }

  // ---- which slots are on screen -----------------------------------------
  const halfW = vp.w / 2 / cam.z
  const halfH = vp.h / 2 / cam.z
  const c0 = Math.floor((cam.x - halfW) / CW)
  const c1 = Math.floor((cam.x + halfW) / CW)
  const r0 = Math.floor((cam.y - halfH) / CH)
  const r1 = Math.floor((cam.y + halfH) / CH)
  const searching = query.trim().length > 0

  const slots = useMemo(() => {
    const out: JSX.Element[] = []
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const p = cellPerfume(r, c)
        const hit = hitIds.has(p.id)
        out.push(
          <div
            key={`${r}:${c}`}
            className={`slot${mod(c, 5) === 0 ? ' post' : ''}${hit ? ' hit' : ''}${p.detail ? ' storied' : ''}`}
            data-r={r}
            data-c={c}
            style={{ left: c * CW, top: r * CH, '--accent': p.accent, '--sway': `${(mod(r * 13 + c * 7, 9) - 4) * 0.35}deg` } as CSSProperties}
          >
            <div className="niche" />
            <img
              className="bottle"
              src={p.img}
              alt=""
              draggable={false}
              loading="lazy"
              style={{ height: p.size * (CH - 78), animationDelay: `${mod(r * 5 + c * 3, 12) * 60}ms` }}
            />
          </div>,
        )
      }
    }
    return out
  }, [r0, r1, c0, c1, hitIds])

  // ---- search keyboard handling ------------------------------------------
  const onSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, Math.max(results.length - 1, 0)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter' && results[active]) {
      open(results[active])
    } else if (e.key === 'Escape') {
      setQuery('')
      ;(e.target as HTMLInputElement).blur()
    }
  }

  return (
    <div
      ref={wallRef}
      className={`wall${cam.z < 0.72 ? ' far' : ''}${searching ? ' searching' : ''}${leaving ? ' leaving' : ''}${touched ? ' touched' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={() => setTip(null)}
      onClick={onWallClick}
      onPointerOver={onWallOver}
    >
      <div
        className="world"
        style={{
          transform: `translate3d(${vp.w / 2 - cam.x * cam.z}px, ${vp.h / 2 - cam.y * cam.z}px, 0) scale(${cam.z})`,
        }}
      >
        {slots}
      </div>
      <div className="torch" />

      {tip && !leaving && (
        <div className="tip" key={tip.p.id + tip.x} style={{ left: Math.min(vp.w - 80, Math.max(80, tip.x)), top: Math.max(70, tip.y) }}>
          {tip.p.name}
        </div>
      )}

      {/* ---------- heads-up display ---------- */}
      <header className="hud top">
        <Link to="/" className="wordmark">
          Scent <i>Storizes</i>
        </Link>
        <span className="hint">Scroll to zoom · drag to wander · click a bottle</span>
      </header>

      <div className={`hud center${focused || searching ? ' on' : ''}`}>
        <div className="intro">
          <p className="eyebrow">The perfume library</p>
          <h1>
            Every bottle has a <i>story</i>.
          </h1>
        </div>
        <div className="search">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={onSearchKey}
            placeholder="Search a perfume, house or note…"
            aria-label="Search perfumes"
            spellCheck={false}
          />
          {query && (
            <button className="clear" onClick={() => setQuery('')} aria-label="Clear search">
              ×
            </button>
          )}
        </div>
        {searching && (
          <ul className="results" role="listbox">
            {results.slice(0, 6).map((p, i) => (
              <li key={p.id} role="option" aria-selected={i === active}>
                <button className={i === active ? 'active' : ''} onMouseEnter={() => setActive(i)} onClick={() => open(p)}>
                  <span className="thumb">
                    <img src={p.img} alt="" />
                  </span>
                  <span className="meta">
                    <b>{p.name}</b>
                    <small>
                      {p.brand} · {p.year} · {p.family}
                    </small>
                  </span>
                  {p.detail && <span className="tag">Story</span>}
                </button>
              </li>
            ))}
            {!results.length && <li className="empty">Nothing on the shelves by that name yet.</li>}
          </ul>
        )}
      </div>

      <footer className="hud bottom">
        <Link to="/quiz" className="reading-room">
          <small>The reading room</small>
          <span>
            The Balancing Act <i>→</i>
          </span>
        </Link>
      </footer>
    </div>
  )
}
