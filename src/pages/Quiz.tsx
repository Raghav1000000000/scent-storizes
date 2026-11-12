import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { buildRound } from '../data/quiz'
import type { Round } from '../data/quiz'
import assets from '../data/gameAssets.json'
import { credit } from '../data/imagery'
import { perfumes } from '../data/perfumes'
import '../styles/quiz.css'
import { asset } from '../asset'

/* ------------------------------------------------------------------ */
/* constants — scene geometry comes from the real photographs          */
/* ------------------------------------------------------------------ */

type Img = { src: string; w: number; h: number }
const A = assets as {
  bottle: Img & { footX: number; footY: number; nozzleX: number; nozzleY: number; innerTop: number; innerBottom: number; mask: string }
}

const FLOOR = 400 // the table top, in scene units
const TABLE = { cx: 200, rx: 150, ry: 20, edge: 12, legTop: 432, legBottom: 586, baseRx: 64 }
const BOTTLE_H = 300
const kBottle = BOTTLE_H / A.bottle.h
const PIVOT = { x: 200, y: FLOOR } // where the bottle's foot meets the table
const BOTTLE = { x: -A.bottle.footX * kBottle, y: -A.bottle.footY * kBottle, w: A.bottle.w * kBottle, h: BOTTLE_H }
const NOZ = { x: (A.bottle.nozzleX - A.bottle.footX) * kBottle, y: (A.bottle.nozzleY - A.bottle.footY) * kBottle }
const INNER_BOTTOM = (A.bottle.innerBottom - A.bottle.footY) * kBottle
const INNER_TOP = (A.bottle.innerTop - A.bottle.footY) * kBottle
const VBX = 20
const VBY = PIVOT.y + BOTTLE.y - 30
const VBW = 360
const VBH = TABLE.legBottom + 22 - VBY
const LIMIT = 0.62 // rad — beyond this the bottle is gone
const TIME = 10 // seconds per question
const LIVES = 3

type Phase = 'intro' | 'play' | 'spray' | 'reveal' | 'fall' | 'broken' | 'over'
type Outcome = null | 'right' | 'wrong' | 'fell' | 'timeout'

type UI = {
  phase: Phase
  round: Round
  qi: number
  lives: number
  score: number
  streak: number
  correct: number
  chosen: number | null
  outcome: Outcome
  gained: number
  best: number
}

type Particle = {
  kind: 'mist' | 'shard' | 'drop' | 'pool'
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
  rot: number
  vr: number
  hue: number
  pts?: number[]
  sx?: number // where in the bottle photo this shard was cut from
  sy?: number
}

const readBest = () => {
  try {
    return Number(localStorage.getItem('ss:quiz:best')) || 0
  } catch {
    return 0
  }
}

/* ------------------------------------------------------------------ */
/* the scene: a photographed glass atomiser on a stack of old books    */
/* ------------------------------------------------------------------ */

function Scene({
  svgRef,
  bottleRef,
  liquidRef,
  shadowRef,
}: {
  svgRef: React.RefObject<SVGSVGElement>
  bottleRef: React.RefObject<SVGGElement>
  liquidRef: React.RefObject<SVGGElement>
  shadowRef: React.RefObject<SVGEllipseElement>
}) {
  const t = TABLE
  return (
    <svg ref={svgRef} className="scene-svg" viewBox={`${VBX} ${VBY} ${VBW} ${VBH}`} role="img" aria-label="A glass perfume flask standing on a small oak table">
      <defs>
        <linearGradient id="q-liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3cf86" />
          <stop offset=".55" stopColor="#e0a552" />
          <stop offset="1" stopColor="#c58232" />
        </linearGradient>
        <radialGradient id="q-top" cx=".42" cy=".35" r=".75">
          <stop offset="0" stopColor="#e6d0b0" />
          <stop offset=".7" stopColor="#d2b48c" />
          <stop offset="1" stopColor="#bf9c72" />
        </radialGradient>
        <linearGradient id="q-edge" x1="0" x2="1">
          <stop offset="0" stopColor="#9c7650" />
          <stop offset=".4" stopColor="#c19a6e" />
          <stop offset="1" stopColor="#8e6a46" />
        </linearGradient>
        <linearGradient id="q-leg" x1="0" x2="1">
          <stop offset="0" stopColor="#94704b" />
          <stop offset=".35" stopColor="#d3b48c" />
          <stop offset=".6" stopColor="#b68f64" />
          <stop offset="1" stopColor="#86633f" />
        </linearGradient>
        <mask id="q-inner" maskUnits="userSpaceOnUse" x={BOTTLE.x} y={BOTTLE.y} width={BOTTLE.w} height={BOTTLE.h}>
          <image href={asset(A.bottle.mask)} x={BOTTLE.x} y={BOTTLE.y} width={BOTTLE.w} height={BOTTLE.h} preserveAspectRatio="none" />
        </mask>
        <filter id="q-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* the table: a softly finished oak pedestal table */}
      <ellipse cx={t.cx} cy={t.legBottom + 8} rx={t.baseRx * 1.5} ry="9" fill="#4a3018" opacity=".22" filter="url(#q-soft)" />
      <path
        d={`M${t.cx - 11} ${t.legTop} C${t.cx - 9} ${t.legTop + 50} ${t.cx - 22} ${t.legBottom - 40} ${t.cx - 16} ${t.legBottom - 12} L${t.cx + 16} ${t.legBottom - 12} C${t.cx + 22} ${t.legBottom - 40} ${t.cx + 9} ${t.legTop + 50} ${t.cx + 11} ${t.legTop} Z`}
        fill="url(#q-leg)"
      />
      <ellipse cx={t.cx} cy={t.legBottom - 6} rx={t.baseRx} ry="11" fill="url(#q-edge)" />
      <ellipse cx={t.cx} cy={t.legBottom - 10} rx={t.baseRx - 4} ry="8" fill="#c9a679" />
      <ellipse cx={t.cx} cy={FLOOR + 30} rx="40" ry="7" fill="#5a3a1c" opacity=".35" filter="url(#q-soft)" />
      <path d={`M${t.cx - t.rx} ${FLOOR} A${t.rx} ${t.ry} 0 0 0 ${t.cx + t.rx} ${FLOOR} L${t.cx + t.rx} ${FLOOR + t.edge} A${t.rx} ${t.ry} 0 0 1 ${t.cx - t.rx} ${FLOOR + t.edge} Z`} fill="url(#q-edge)" />
      <ellipse cx={t.cx} cy={FLOOR} rx={t.rx} ry={t.ry} fill="url(#q-top)" />
      <ellipse cx={t.cx - 30} cy={FLOOR - 4} rx={t.rx * 0.55} ry={t.ry * 0.4} fill="#fff6e6" opacity=".22" filter="url(#q-soft)" />
      <ellipse ref={shadowRef} cx={PIVOT.x + 10} cy={PIVOT.y + 2} rx="46" ry="6" fill="#3a2410" opacity=".3" filter="url(#q-soft)" />

      {/* the bottle: perfume first, then the transparent glass photographed around it */}
      <g ref={bottleRef} className="q-bottle" transform={`translate(${PIVOT.x} ${PIVOT.y})`}>
        <g mask="url(#q-inner)">
          <g ref={liquidRef}>
            <rect x="-300" y="0" width="600" height="600" fill="url(#q-liquid)" opacity=".9" />
            <rect x="-300" y="0" width="600" height="1.8" fill="#fff4d8" opacity=".7" />
          </g>
        </g>
        <image href={asset(A.bottle.src)} x={BOTTLE.x} y={BOTTLE.y} width={BOTTLE.w} height={BOTTLE.h} preserveAspectRatio="none" />
      </g>
    </svg>
  )
}

/** The library wall from the home page, out of focus behind the table. */
function BackWall() {
  const rows = [0, 1, 2]
  return (
    <div className="backwall" aria-hidden>
      {rows.map((r) => (
        <div className="bw-shelf" key={r}>
          <div className="bw-row">
            {perfumes.slice(r * 9, r * 9 + 9).map((p) => (
              <img key={p.id} src={p.img} alt="" style={{ height: 70 + p.size * 60 }} />
            ))}
          </div>
          <div className="bw-plank" />
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* the game                                                            */
/* ------------------------------------------------------------------ */

export default function Quiz() {
  const [ui, setUi] = useState<UI>(() => ({
    phase: 'intro',
    round: buildRound(),
    qi: 0,
    lives: LIVES,
    score: 0,
    streak: 0,
    correct: 0,
    chosen: null,
    outcome: null,
    gained: 0,
    best: readBest(),
  }))
  const uiRef = useRef(ui)
  const update = useCallback((patch: Partial<UI>) => {
    uiRef.current = { ...uiRef.current, ...patch }
    setUi(uiRef.current)
  }, [])

  const arenaRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const bottleRef = useRef<SVGGElement>(null)
  const liquidRef = useRef<SVGGElement>(null)
  const shadowRef = useRef<SVGEllipseElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timerRef = useRef<HTMLElement>(null)
  const secsRef = useRef<HTMLSpanElement>(null)
  const dangerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([])

  const sim = useRef({
    th: 0,
    om: 0,
    gust: 0,
    t: 0,
    level: 1,
    slosh: 0,
    sloshV: 0,
    fx: 0,
    fy: 0,
    vy: 0,
    left: false,
    right: false,
    timeUp: false,
    lean: 1,
    spray: null as null | { until: number; tx: number; ty: number },
    clock: 0,
  })
  const parts = useRef<Particle[]>([])
  const timeouts = useRef<number[]>([])
  const later = useCallback((fn: () => void, ms: number) => {
    timeouts.current.push(window.setTimeout(fn, ms))
  }, [])

  /** SVG user space → arena pixels */
  const toArena = useCallback((x: number, y: number) => {
    if (!svgRef.current || !arenaRef.current) return { x: 0, y: 0, k: 1 }
    const s = svgRef.current.getBoundingClientRect()
    const a = arenaRef.current.getBoundingClientRect()
    const k = Math.min(s.width / VBW, s.height / VBH)
    return { x: s.left - a.left + (s.width - VBW * k) / 2 + (x - VBX) * k, y: s.top - a.top + (s.height - VBH * k) / 2 + (y - VBY) * k, k }
  }, [])

  /* ---------- flow ---------- */
  const resetBottle = useCallback(() => {
    const s = sim.current
    s.th = (Math.random() < 0.5 ? -1 : 1) * (0.012 + Math.random() * 0.02)
    s.om = 0
    s.gust = 0
    s.t = 0
    s.fx = s.fy = s.vy = 0
    s.timeUp = false
    s.spray = null
    s.lean = Math.random() < 0.5 ? -1 : 1
  }, [])

  const start = useCallback(() => {
    timeouts.current.forEach(clearTimeout)
    timeouts.current = []
    parts.current = []
    resetBottle()
    sim.current.level = 1
    update({ phase: 'play', round: buildRound(), qi: 0, lives: LIVES, score: 0, streak: 0, correct: 0, chosen: null, outcome: null, gained: 0 })
  }, [resetBottle, update])

  const finish = useCallback(() => {
    const u = uiRef.current
    const best = Math.max(u.best, u.score)
    try {
      localStorage.setItem('ss:quiz:best', String(best))
    } catch {
      /* ignore */
    }
    update({ phase: 'over', best })
  }, [update])

  const next = useCallback(() => {
    const u = uiRef.current
    if (u.lives <= 0 || u.qi + 1 >= u.round.length) return finish()
    resetBottle()
    update({ phase: 'play', qi: u.qi + 1, chosen: null, outcome: null, gained: 0 })
  }, [finish, resetBottle, update])

  const answer = useCallback(
    (i: number) => {
      const u = uiRef.current
      if (u.phase !== 'play' || sim.current.timeUp) return
      const card = cardRefs.current[i]
      const a = arenaRef.current
      if (card && a) {
        const r = card.getBoundingClientRect()
        const ar = a.getBoundingClientRect()
        sim.current.spray = { until: sim.current.clock + 0.55, tx: r.left - ar.left + r.width / 2, ty: r.top - ar.top + r.height / 2 }
      }
      update({ phase: 'spray', chosen: i })
      later(() => {
        const cur = uiRef.current
        const q = cur.round[cur.qi]
        if (i === q.answer) {
          const left = Math.max(0, TIME - sim.current.t)
          const gained = 100 + Math.round(left * 5) + cur.streak * 20
          update({ phase: 'reveal', outcome: 'right', score: cur.score + gained, gained, streak: cur.streak + 1, correct: cur.correct + 1 })
        } else {
          update({ phase: 'reveal', outcome: 'wrong', lives: cur.lives - 1, streak: 0 })
        }
        later(next, 2100)
      }, 620)
    },
    [later, next, update],
  )

  const shatter = useCallback(() => {
    const s = sim.current
    const u = uiRef.current
    const dir = Math.sign(s.th) || 1
    const impact = toArena(PIVOT.x + dir * BOTTLE_H * 0.42, FLOOR)
    const k = impact.k
    const cx = impact.x
    const cy = impact.y - 4 * k
    for (let i = 0; i < 46; i++) {
      const a = -Math.PI * (0.08 + Math.random() * 0.84)
      const sp = (120 + Math.random() * 380) * k
      const sz = (6 + Math.random() * 16) * k
      const n = 3 + Math.floor(Math.random() * 3)
      const pts: number[] = []
      for (let j = 0; j < n; j++) {
        const ang = (j / n) * Math.PI * 2 + Math.random() * 0.7
        const rr = sz * (0.45 + Math.random() * 0.7)
        pts.push(Math.cos(ang) * rr, Math.sin(ang) * rr)
      }
      parts.current.push({
        kind: 'shard',
        x: cx + (Math.random() - 0.5) * BOTTLE_H * 0.7 * k,
        y: cy - Math.random() * 30 * k,
        vx: Math.cos(a) * sp + dir * 70,
        vy: Math.sin(a) * sp,
        life: 0,
        max: 2.2 + Math.random() * 0.8,
        size: sz,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 16,
        hue: 0,
        pts,
        sx: A.bottle.w * (0.2 + Math.random() * 0.6),
        sy: A.bottle.h * (0.25 + Math.random() * 0.7),
      })
    }
    const drops = 14 + Math.round(u.lives * 16)
    for (let i = 0; i < drops; i++) {
      const a = -Math.PI * (0.1 + Math.random() * 0.8)
      const sp = (60 + Math.random() * 300) * k
      parts.current.push({ kind: 'drop', x: cx + (Math.random() - 0.5) * 80 * k, y: cy, vx: Math.cos(a) * sp + dir * 40, vy: Math.sin(a) * sp, life: 0, max: 1 + Math.random() * 0.7, size: (1.5 + Math.random() * 3.5) * k, rot: 0, vr: 0, hue: 36 })
    }
    if (u.lives > 0) parts.current.push({ kind: 'pool', x: cx, y: cy + 3 * k, vx: 0, vy: 0, life: 0, max: 2.6, size: (40 + u.lives * 22) * k, rot: 0, vr: 0, hue: 36 })
        update({ phase: 'broken', lives: u.lives - 1, streak: 0 })
    later(next, 2600)
  }, [later, next, toArena, update])

  /* ---------- keyboard ---------- */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const s = sim.current
      const ph = uiRef.current.phase
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        s.left = true
        e.preventDefault()
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        s.right = true
        e.preventDefault()
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        answer(Number(e.key) - 1)
      } else if ((e.key === 'Enter' || e.key === ' ') && (ph === 'intro' || ph === 'over')) {
        e.preventDefault()
        start()
      }
    }
    const up = (e: KeyboardEvent) => {
      const s = sim.current
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') s.left = false
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') s.right = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [answer, start])

  /* ---------- the loop ---------- */
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    const glass = new Image()
    glass.src = asset(A.bottle.src)
    const fit = () => {
      const a = arenaRef.current!.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(a.width * dpr)
      canvas.height = Math.round(a.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    fit()
    requestAnimationFrame(fit)
    window.addEventListener('resize', fit)

    const frame = (now: number) => {
      const dt = Math.min(0.034, (now - last) / 1000)
      last = now
      const s = sim.current
      const u = uiRef.current
      s.clock += dt

      // --- physics per phase
      if (u.phase === 'play') {
        s.t += dt
        const prog = Math.min(1, s.t / TIME)
        if (s.t >= TIME && !s.timeUp) {
          s.timeUp = true // time's up: nothing can save it now
          s.om += (Math.sign(s.th) || (Math.random() < 0.5 ? -1 : 1)) * 0.9
          update({ outcome: 'timeout' })
        }
        const grace = Math.min(1, s.t / 1.0)
        const instab = s.timeUp ? 16 : (0.3 + 1.8 * prog * prog + u.qi * 0.06) * (0.3 + 0.7 * grace)
        const restore = s.timeUp ? 0 : 9 * Math.pow(1 - prog, 0.9) // steady at first, giving way as the clock runs out
        s.gust += (-s.gust * 1.6 + (Math.random() - 0.5) * (16 + 48 * prog)) * dt
        // the bottle slowly gives way as the clock runs down: keep pressing against the lean
        let acc = instab * Math.sin(s.th) - restore * s.th + s.gust * grace + s.lean * (0.06 + 2.6 * Math.pow(prog, 3)) * grace
        if (!s.timeUp) acc += ((s.right ? 1 : 0) - (s.left ? 1 : 0)) * 6.2
        s.om += acc * dt
        s.om *= 1 - 1.2 * dt
        s.th += s.om * dt
        if (Math.abs(s.th) > LIMIT) update({ phase: 'fall', outcome: u.outcome === 'timeout' ? 'timeout' : 'fell' })
      } else if (u.phase === 'spray' || u.phase === 'reveal') {
        // a steady hand while it sprays
        s.om += (-s.th * 22 - s.om * 8) * dt
        s.th += s.om * dt
      } else if (u.phase === 'fall') {
        // tips over its edge and lands on the tabletop
        const dir = Math.sign(s.th) || 1
        s.om += 15 * Math.sin(Math.min(Math.abs(s.th), 1.5)) * dir * dt
        s.th += s.om * dt
        if (Math.abs(s.th) >= 1.42) shatter()
      } else if (u.phase === 'intro' || u.phase === 'over') {
        s.th = 0.13 * Math.sin(s.clock * 1.25) + 0.03 * Math.sin(s.clock * 3.1)
        s.om = 0.16 * Math.cos(s.clock * 1.25)
        s.fx = s.fy = 0
      }

      // --- liquid: level follows lives, surface stays level and sloshes
      const wantLevel = Math.max(0, u.lives) / LIVES
      s.level += (wantLevel - s.level) * Math.min(1, dt * 2.2)
      s.sloshV += ((-s.om * 0.16 - s.slosh) * 46 - s.sloshV * 5) * dt
      s.slosh += s.sloshV * dt
      const surf = INNER_BOTTOM - (INNER_BOTTOM - INNER_TOP) * (0.06 + 0.84 * s.level) + (s.level < 0.02 ? 30 : 0)
      // a nervous shiver on top of the lean, growing as the clock runs down
      const shiver = u.phase === 'play' ? Math.pow(Math.min(1, s.t / TIME), 1.4) * (0.7 * Math.sin(s.clock * 31) + 0.35 * Math.sin(s.clock * 53 + 1.3)) : 0
      const deg = (s.th * 180) / Math.PI + shiver
      const hidden = u.phase === 'broken'
      if (bottleRef.current) {
        bottleRef.current.setAttribute('transform', `translate(${PIVOT.x + s.fx} ${PIVOT.y + s.fy}) rotate(${deg})`)
        bottleRef.current.style.opacity = hidden ? '0' : '1'
      }
      liquidRef.current?.setAttribute('transform', `translate(0 ${surf}) rotate(${-deg + (s.slosh * 180) / Math.PI})`)
      if (shadowRef.current) {
        shadowRef.current.setAttribute('cx', String(PIVOT.x + 10 + Math.sin(s.th) * 60))
        shadowRef.current.setAttribute('rx', String(46 * (1 - Math.min(0.5, Math.abs(s.th) * 0.6))))
        shadowRef.current.style.opacity = hidden ? '0' : '0.3'
      }
      if (dangerRef.current) {
        const d = u.phase === 'play' || u.phase === 'fall' ? Math.min(1, Math.pow(Math.abs(s.th) / LIMIT, 2.2)) : 0
        dangerRef.current.style.opacity = String(d)
      }
      if (timerRef.current) {
        const left = Math.max(0, 1 - s.t / TIME)
        timerRef.current.style.transform = `scaleX(${left})`
        timerRef.current.style.background = left < 0.3 ? '#b8452f' : left < 0.6 ? '#b07a2e' : '#8a5a32'
      }
      if (secsRef.current) {
        const txt = String(Math.max(0, Math.ceil(TIME - s.t)))
        if (secsRef.current.textContent !== txt) secsRef.current.textContent = txt
      }

      // --- spray
      if (s.spray && s.clock < s.spray.until && svgRef.current) {
        const c = Math.cos(s.th),
          sn = Math.sin(s.th)
        const n = toArena(PIVOT.x + NOZ.x * c - NOZ.y * sn, PIVOT.y + NOZ.x * sn + NOZ.y * c)
        const dx = s.spray.tx - n.x
        const dy = s.spray.ty - n.y
        const dist = Math.hypot(dx, dy) || 1
        for (let i = 0; i < 9; i++) {
          const spread = (Math.random() - 0.5) * 0.36
          const ang = Math.atan2(dy, dx) + spread
          const sp = dist * (2.3 + Math.random() * 1.3)
          parts.current.push({ kind: 'mist', x: n.x, y: n.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 0, max: 0.55 + Math.random() * 0.5, size: 3 + Math.random() * 5, rot: 0, vr: 0, hue: 36 + Math.random() * 14 })
        }
      }

      // --- particles
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)
      const top = svgRef.current ? toArena(TABLE.cx - TABLE.rx, FLOOR) : null
      const top2 = svgRef.current ? toArena(TABLE.cx + TABLE.rx, FLOOR) : null
      const arr = parts.current
      arr.sort((a, b) => (b.kind === 'pool' ? 1 : 0) - (a.kind === 'pool' ? 1 : 0))
      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i]
        p.life += dt
        if (p.life >= p.max) {
          arr.splice(i, 1)
          continue
        }
        const k = p.life / p.max
        if (p.kind === 'mist') {
          p.vx *= 1 - 3.2 * dt
          p.vy *= 1 - 3.2 * dt
          p.vy -= 14 * dt
          p.x += p.vx * dt
          p.y += p.vy * dt
          const r = p.size * (1 + k * 4.5)
          ctx.globalCompositeOperation = 'source-over'
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r)
          g.addColorStop(0, `hsla(${p.hue},70%,62%,${0.22 * (1 - k)})`)
          g.addColorStop(0.5, `hsla(${p.hue},60%,75%,${0.1 * (1 - k)})`)
          g.addColorStop(1, `hsla(${p.hue},60%,80%,0)`)
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(p.x, p.y, r, 0, 6.283)
          ctx.fill()
        } else if (p.kind === 'pool') {
          // spilled perfume spreading on the oak, then soaking in
          const grow = 1 - Math.pow(1 - Math.min(1, k * 3), 3)
          const r = p.size * (0.35 + 0.65 * grow)
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.scale(1, 0.18)
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
          const a = 0.5 * (1 - Math.max(0, (k - 0.55) / 0.45))
          g.addColorStop(0, `rgba(178,108,34,${a})`)
          g.addColorStop(0.8, `rgba(196,128,48,${a * 0.8})`)
          g.addColorStop(1, 'rgba(196,128,48,0)')
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(0, 0, r, 0, 6.283)
          ctx.fill()
          ctx.restore()
        } else {
          p.vy += 1500 * dt
          p.x += p.vx * dt
          p.y += p.vy * dt
          p.rot += p.vr * dt
          const onTable = top && top2 && p.x > top.x && p.x < top2.x
          const floorY = onTable ? top!.y - 2 : h + 60
          if (p.y > floorY && p.y < floorY + 30) {
            p.y = floorY
            p.vy *= -0.28
            p.vx *= 0.55
            p.vr *= 0.4
          }
          const alpha = Math.min(1, (1 - k) * 2.4)
          if (p.kind === 'shard' && p.pts) {
            ctx.save()
            ctx.translate(p.x, p.y)
            ctx.rotate(p.rot)
            ctx.beginPath()
            for (let j = 0; j < p.pts.length; j += 2) (j ? ctx.lineTo : ctx.moveTo).call(ctx, p.pts[j], p.pts[j + 1])
            ctx.closePath()
            ctx.globalAlpha = alpha
            if (glass.complete && glass.naturalWidth) {
              // each shard shows a fragment of the real bottle photograph
              ctx.save()
              ctx.clip()
              const cut = p.size * 1.6
              const src = cut / (toArena(0, 0).k * kBottle)
              ctx.drawImage(glass, p.sx! - src / 2, p.sy! - src / 2, src, src, -cut / 2, -cut / 2, cut, cut)
              ctx.restore()
            }
            ctx.fillStyle = 'rgba(220,232,236,0.22)'
            ctx.fill()
            ctx.strokeStyle = 'rgba(255,255,255,0.9)'
            ctx.lineWidth = 1
            ctx.stroke()
            ctx.strokeStyle = 'rgba(70,80,86,0.35)'
            ctx.lineWidth = 0.6
            ctx.stroke()
            ctx.globalAlpha = 1
            ctx.restore()
          } else {
            ctx.fillStyle = `rgba(196,128,48,${alpha * 0.85})`
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size, 0, 6.283)
            ctx.fill()
          }
        }
      }
      ctx.globalCompositeOperation = 'source-over'

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', fit)
      timeouts.current.forEach(clearTimeout)
    }
  }, [shatter, toArena, update])

  /* ---------- render ---------- */
  const q = ui.round[ui.qi]
  const revealed = ui.phase === 'reveal' || ui.phase === 'broken'
  const playing = ui.phase !== 'intro' && ui.phase !== 'over'
  const won = ui.phase === 'over' && ui.lives > 0
  const rank = ui.correct >= 9 ? 'Master Perfumer' : ui.correct >= 6 ? 'Perfumer' : ui.correct >= 3 ? 'Apprentice Nose' : 'Curious Nose'

  const hold = (side: 'left' | 'right', v: boolean) => () => {
    sim.current[side] = v
  }

  let status = ''
  if (ui.outcome === 'right') status = `Correct  +${ui.gained}`
  else if (ui.outcome === 'wrong') status = 'Wrong — a third of the bottle is gone'
  else if (ui.outcome === 'timeout') status = ui.phase === 'broken' ? 'Out of time — it shattered' : 'Out of time!'
  else if (ui.outcome === 'fell') status = ui.phase === 'broken' ? 'It fell — and took a third of the perfume with it' : 'It’s going…'

  return (
    <div className={`quiz ph-${ui.phase}`}>
      <header className="quiz-top">
        <Link to="/" className="back">
          ← The library
        </Link>
        <span className="wordmark">
          The Balancing <i>Act</i>
        </span>
        <div className="stats">
          <span>
            Score <b>{ui.score}</b>
          </span>
          <span className="left-in-bottle">{['Empty', 'A third left', 'Two thirds left', 'Full bottle'][Math.max(0, ui.lives)]}</span>
        </div>
      </header>

      <BackWall />
      <div className="arena" ref={arenaRef}>

        <div className={`question${playing ? ' show' : ''}`} key={ui.qi + ':' + (playing ? 1 : 0)}>
          <p className="eyebrow">
            Question {ui.qi + 1} of {ui.round.length}
            {ui.streak > 1 && <em> · {ui.streak} in a row</em>}
          </p>
          <h1>{q.q}</h1>
          <div className="timer">
            <div className="track">
              <i ref={timerRef} />
            </div>
            <span ref={secsRef}>{TIME}</span>
          </div>
        </div>

        <div className="stage">
          <Scene svgRef={svgRef} bottleRef={bottleRef} liquidRef={liquidRef} shadowRef={shadowRef} />
        </div>

        <div className={`cards${playing ? ' show' : ''}`}>
          {q.options.map((opt, i) => {
            let cls = ''
            if (ui.chosen === i && ui.phase === 'spray') cls = 'sprayed'
            if (revealed) cls = i === q.answer ? 'right' : ui.chosen === i ? 'wrong' : 'dim'
            return (
              <button
                key={ui.qi + ':' + i}
                ref={(el) => (cardRefs.current[i] = el)}
                className={`card-opt strip c${i} ${cls}`}
                style={{ animationDelay: `${i * 90}ms` }}
                onClick={() => answer(i)}
                disabled={ui.phase !== 'play'}
              >
                <span className="num">{['I', 'II', 'III', 'IV'][i]}</span>
                <span className="txt">{opt}</span>
                <span className="stain" aria-hidden />
                <span className="verdict" aria-hidden>
                  {cls === 'right' ? 'Correct' : cls === 'wrong' ? 'Not this one' : ''}
                </span>
              </button>
            )
          })}
        </div>

        <div className={`status ${ui.outcome ?? ''}${status ? ' show' : ''}`}>
          <b>{status}</b>
          {revealed && <span>{q.fact}</span>}
        </div>

        <canvas ref={canvasRef} className="fx" />

        <div className={`controls${ui.phase === 'play' ? ' show' : ''}`}>
          <button onPointerDown={hold('left', true)} onPointerUp={hold('left', false)} onPointerLeave={hold('left', false)} onPointerCancel={hold('left', false)} aria-label="Lean left">
            ←
          </button>
          <span>Hold the arrow keys against the lean · press 1–4 to mist an answer</span>
          <button onPointerDown={hold('right', true)} onPointerUp={hold('right', false)} onPointerLeave={hold('right', false)} onPointerCancel={hold('right', false)} aria-label="Lean right">
            →
          </button>
        </div>

        {ui.phase === 'intro' && (
          <div className="overlay">
            <p className="eyebrow">A perfume quiz with a nervous bottle</p>
            <h2>
              The Balancing <i>Act</i>
            </h2>
            <ul className="how">
              <li>
                <span className="keys">
                  <kbd>←</kbd>
                  <kbd>→</kbd>
                </span>
                <div>
                  <b>Keep it steady.</b> The flask stands on a small oak table, and starts to lean as the clock runs. Hold against the lean before it tips over.
                </div>
              </li>
              <li>
                <span className="keys">
                  <kbd>1</kbd>
                  <kbd>4</kbd>
                </span>
                <div>
                  <b>Spray your answer.</b> Press 1–4 (or tap a blotter) and the bottle mists the strip you choose.
                </div>
              </li>
              <li>
                <span className="keys drop" />
                <div>
                  <b>The perfume is your life.</b> A wrong answer, a fall, or running out of time costs a third of the bottle. Empty bottle, game over.
                </div>
              </li>
            </ul>
            <button className="pill gold big" onClick={start}>
              Start — 10 questions
            </button>
            {ui.best > 0 && <p className="best">Your best: {ui.best}</p>}
            <p className="photo-credits">
              Photos via Wikimedia Commons:{' '}
              {(['game/bottle', 'textures/wall'] as const).map((k, i) => {
                const c = credit(k)
                if (!c) return null
                return (
                  <span key={k}>
                    {i > 0 && ' · '}
                    <a href={c.page} target="_blank" rel="noreferrer">
                      {c.title.replace(/\.[a-z]+$/i, '')}
                    </a>{' '}
                    ({c.artist}, {c.license})
                  </span>
                )
              })}
            </p>
          </div>
        )}

        {ui.phase === 'over' && (
          <div className="overlay">
            <p className="eyebrow">{won ? 'The bottle survived' : 'Not a drop left'}</p>
            <h2>
              {won ? (
                <>
                  You are a <i>{rank}</i>
                </>
              ) : (
                <>
                  The bottle is <i>empty</i>
                </>
              )}
            </h2>
            <div className="result">
              <div>
                <b>{ui.score}</b>
                <span>Score</span>
              </div>
              <div>
                <b>
                  {ui.correct}/{ui.round.length}
                </b>
                <span>Correct</span>
              </div>
              <div>
                <b>{ui.best}</b>
                <span>Best</span>
              </div>
            </div>
            <div className="row">
              <button className="pill gold big" onClick={start}>
                Play again
              </button>
              <Link to="/" className="pill">
                Back to the library
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
