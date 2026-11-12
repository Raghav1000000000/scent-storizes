import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { byId, perfumes } from '../data/perfumes'
import type { ChatMsg, Detail, Perfume } from '../data/perfumes'
import { chapterImg, noteImg, pageCredits } from '../data/imagery'
import '../styles/perfume.css'
import '../styles/story.css'
import { asset } from '../asset'

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function useLocal<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage unavailable — keep it in memory */
    }
  }, [key, value])
  return [value, setValue] as const
}

/** Adds `.in` to children marked `.reveal` when they scroll into view. */
function useReveal(dep: unknown) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))),
      { threshold: 0.12 },
    )
    root.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [dep])
  return ref
}

function Stars({ value, size = 18 }: { value: number; size?: number }) {
  return (
    <span className="stars" style={{ fontSize: size }} aria-label={`${value.toFixed(1)} out of 5`}>
      <span className="off">★★★★★</span>
      <span className="on" style={{ width: `${(value / 5) * 100}%` }}>
        ★★★★★
      </span>
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* the unboxing                                                        */
/* ------------------------------------------------------------------ */

/** Faithful, minimal carton typography per house. */
function BoxFront({ p }: { p: Perfume }) {
  if (p.id === 'chanel-no5')
    return (
      <div className="carton-face no5">
        <span className="no5-num">N°5</span>
        <span className="no5-house">CHANEL</span>
        <span className="no5-city">PARIS</span>
        <span className="no5-conc">EAU DE PARFUM</span>
      </div>
    )
  if (p.id === 'terre-dhermes')
    return (
      <div className="carton-face terre">
        <span className="terre-name">
          TERRE
          <br />
          D’HERMÈS
        </span>
        <span className="terre-conc">Eau de toilette</span>
      </div>
    )
  if (p.id === 'lair-du-temps')
    return (
      <div className="carton-face lair">
        <span className="lair-name">L’Air du Temps</span>
        <span className="lair-house">NINA RICCI</span>
        <span className="lair-conc">Eau de toilette</span>
      </div>
    )
  return (
    <div className="carton-face plain">
      <span className="plain-house">{p.brand}</span>
      <span className="plain-name">{p.name}</span>
    </div>
  )
}

function Unboxing({ p }: { p: Perfume }) {
  const [stage, setStage] = useState(0) // 0 hidden · 1 box set down · 2 lid opens · 3 bottle lifted · 4 on the ledge
  const [run, setRun] = useState(0)

  useEffect(() => {
    setStage(0)
    const t = [
      setTimeout(() => setStage(1), 80),
      setTimeout(() => setStage(2), 1000),
      setTimeout(() => setStage(3), 1700),
      setTimeout(() => setStage(4), 2950),
    ]
    return () => t.forEach(clearTimeout)
  }, [p.id, run])

  const ratio = p.w / p.h
  let bh = 240
  let bw = bh * ratio
  if (bw > 190) {
    bw = 190
    bh = bw / ratio
  }
  const boxW = Math.round(bw + 40)
  const boxH = Math.round(bh + 30)
  const boxD = Math.round(Math.min(140, Math.max(90, boxW * 0.6)))
  const finalScale = Math.min(1.75, 400 / bh, 300 / bw)
  const box = p.detail?.box ?? { body: '#ece3d3', lid: '#ece3d3', ink: '#3a2414', label: p.name, trim: '#3a2414' }

  const vars = {
    '--bw': `${boxW}px`,
    '--bh': `${boxH}px`,
    '--bd': `${boxD}px`,
    '--btl-h': `${bh}px`,
    '--final': finalScale,
    '--box': box.body,
    '--lid': box.lid,
    '--box-ink': box.ink,
    '--trim': box.trim ?? box.ink,
  } as CSSProperties

  return (
    <div className={`unbox s${stage}`} style={vars}>
      <div className="shelf" aria-hidden>
        <div className="shelf-top" />
        <div className="shelf-front" />
      </div>
      <div className="scene">
        <div className="contact" />
        <div className="box">
          <div className="face back" />
          <div className="face left" />
          <div className="face right" />
          <div className="btl">
            <img src={p.img} alt={`${p.name} by ${p.brand}`} draggable={false} />
          </div>
          <div className="face front">
            <BoxFront p={p} />
          </div>
          <div className="lid" />
        </div>
      </div>
      <button className="replay" onClick={() => setRun((r) => r + 1)}>
        ↺ Unbox again
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* I. the story — one chapter at a time                                */
/* ------------------------------------------------------------------ */

function Story({ p, d }: { p: Perfume; d: Detail }) {
  const [i, setI] = useState(0)
  const n = d.chapters.length
  const c = d.chapters[i]
  const img = chapterImg(p.id, i) ?? { src: asset(`photos/${p.id}.jpg`), alt: `${p.name}, the bottle` }

  return (
    <section id="story" className="section">
      <header className="section-head reveal">
        <span className="num">I.</span>
        <div>
          <p className="eyebrow">The story</p>
          <h2>{d.tagline}</h2>
        </div>
      </header>
      <p className="lead reveal">{d.intro}</p>

      <div className="chapters reveal">
        <nav className="years" aria-label="Chapters">
          {d.chapters.map((ch, k) => (
            <button key={k} className={k === i ? 'on' : ''} onClick={() => setI(k)} aria-current={k === i}>
              {ch.year}
            </button>
          ))}
          <i className="progress" style={{ width: `${((i + 1) / n) * 100}%` }} />
        </nav>
        <article className="chapter" key={i}>
          <div className="chapter-text">
            <span className="chapter-n">
              Chapter {i + 1} of {n}
            </span>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
            <div className="turn">
              <button onClick={() => setI((i - 1 + n) % n)} aria-label="Previous chapter">
                ←
              </button>
              <button onClick={() => setI((i + 1) % n)} aria-label="Next chapter">
                Next chapter →
              </button>
            </div>
          </div>
          <figure className="plate">
            <img src={img.src} alt={img.alt} />
            <figcaption>{img.alt}</figcaption>
          </figure>
        </article>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* II. the composition — specimens on a ledge                          */
/* ------------------------------------------------------------------ */

const TIERS = [
  { key: 'top', label: 'Top', when: 'The first fifteen minutes' },
  { key: 'heart', label: 'Heart', when: 'The hours after' },
  { key: 'base', label: 'Base', when: 'What stays until morning' },
] as const

function seasonWords(s: Detail['seasons']) {
  const all = Object.entries(s).sort((a, b) => b[1] - a[1])
  const best = all.filter(([, v]) => v >= all[0][1] - 0.12).map(([k]) => k[0].toUpperCase() + k.slice(1))
  return best.join(' & ')
}

function Composition({ d }: { d: Detail }) {
  const [tier, setTier] = useState<(typeof TIERS)[number]['key']>('top')
  const notes = d.notes[tier]
  const hour = d.dayNight < 0.35 ? 'Daytime' : d.dayNight > 0.6 ? 'Evening' : 'Day into evening'

  return (
    <section id="composition" className="section">
      <header className="section-head reveal">
        <span className="num">II.</span>
        <div>
          <p className="eyebrow">The composition</p>
          <h2>What it’s made of</h2>
        </div>
      </header>

      <div className="specimens reveal">
        <div className="tiers" role="tablist">
          {TIERS.map((t) => (
            <button key={t.key} role="tab" aria-selected={tier === t.key} className={tier === t.key ? 'on' : ''} onClick={() => setTier(t.key)}>
              <b>{t.label}</b>
              <small>{t.when}</small>
            </button>
          ))}
        </div>
        <ul className="tray" key={tier}>
          {notes.map((nt, k) => {
            const src = noteImg(nt.name)
            return (
              <li key={nt.name} style={{ animationDelay: `${k * 70}ms` }}>
                <span className="specimen">{src && <img src={src} alt="" loading="lazy" />}</span>
                <span className="name">{nt.name}</span>
              </li>
            )
          })}
        </ul>
      </div>

      <dl className="wear reveal">
        <div>
          <dt>Lasts</dt>
          <dd>{d.longevity.hours.replace('h', 'hours')}</dd>
        </div>
        <div>
          <dt>Trail</dt>
          <dd>{d.sillage.label}</dd>
        </div>
        <div>
          <dt>Best in</dt>
          <dd>{seasonWords(d.seasons)}</dd>
        </div>
        <div>
          <dt>Wear it</dt>
          <dd>
            {hour} — {d.occasions.slice(0, 2).join(', ').toLowerCase()}
          </dd>
        </div>
      </dl>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* III. the register — score, your mark, the conversation              */
/* ------------------------------------------------------------------ */

const hueOf = (s: string) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 360, 7)

function Register({ p, d }: { p: Perfume; d: Detail }) {
  const [mine, setMine] = useLocal<number>(`ss:rating:${p.id}`, 0)
  const [hover, setHover] = useState(0)
  const [notes, setNotes] = useLocal<ChatMsg[]>(`ss:chat:${p.id}`, [])
  const [text, setText] = useState('')
  const listRef = useRef<HTMLUListElement>(null)
  const count = d.rating.count + (mine ? 1 : 0)
  const avg = mine ? (d.rating.avg * d.rating.count + mine) / count : d.rating.avg
  const all = useMemo(() => [...d.chat].reverse().concat(notes), [d.chat, notes])

  const send = (e: FormEvent) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    setNotes([...notes, { user: 'you', text: t.slice(0, 400), ago: 'now', mine: true }])
    setText('')
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }))
  }

  return (
    <section id="register" className="section">
      <header className="section-head reveal">
        <span className="num">III.</span>
        <div>
          <p className="eyebrow">The register</p>
          <h2>What readers say</h2>
        </div>
      </header>
      <div className="register reveal">
        <aside className="score">
          <b>{avg.toFixed(1)}</b>
          <Stars value={avg} size={16} />
          <span>{count.toLocaleString()} readers</span>
          <div className="yours" onMouseLeave={() => setHover(0)}>
            <small>Your mark</small>
            <div className="pick">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  className={(hover || mine) >= s ? 'on' : ''}
                  onMouseEnter={() => setHover(s)}
                  onClick={() => setMine(mine === s ? 0 : s)}
                  aria-label={`Rate ${s} star${s > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        </aside>
        <div className="book">
          <ul ref={listRef}>
            {all.map((m, k) => (
              <li key={k} className={m.mine ? 'mine' : ''}>
                <span className="avatar" style={{ '--h': hueOf(m.user) } as CSSProperties}>
                  {m.user[0].toUpperCase()}
                </span>
                <div>
                  <header>
                    <b>{m.mine ? 'You' : m.user}</b>
                    <time>{m.ago}</time>
                  </header>
                  <p>{m.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <form onSubmit={send}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Add your line about ${p.name}…`} maxLength={400} aria-label="Your note" />
            <button disabled={!text.trim()}>Sign</button>
          </form>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* page                                                                */
/* ------------------------------------------------------------------ */

export default function PerfumePage() {
  const { id = '' } = useParams()
  const p = byId(id)
  const ref = useReveal(id)

  useEffect(() => {
    if (p) document.title = `${p.name} — ${p.brand} · Scent Storizes`
    return () => {
      document.title = 'Scent Storizes — the perfume library'
    }
  }, [p])

  if (!p) {
    return (
      <div className="perfume missing">
        <h1>That bottle isn’t on our shelves.</h1>
        <Link to="/" className="pill">
          ← Back to the library
        </Link>
      </div>
    )
  }

  const d = p.detail
  const storied = perfumes.filter((x) => x.detail)
  const others = storied.filter((x) => x.id !== p.id)
  const next = d ? storied[(storied.findIndex((x) => x.id === p.id) + 1) % storied.length] : storied[0]
  const credits = d
    ? pageCredits(
        p.id,
        [...d.notes.top, ...d.notes.heart, ...d.notes.base, ...p.keyNotes.map((name) => ({ name }))].map((x) => x.name),
        [],
      )
    : []

  return (
    <div className={`perfume${d ? ' storied' : ''}`} ref={ref} key={p.id}>
      <nav className="topbar">
        <Link to="/" className="back">
          <span>←</span> The library
        </Link>
        <Link to="/" className="wordmark">
          Scent <i>Storizes</i>
        </Link>
        {d ? (
          <div className="jump">
            <a href="#story">I. Story</a>
            <a href="#composition">II. Composition</a>
            <a href="#register">III. Register</a>
          </div>
        ) : (
          <Link to="/quiz" className="jump">
            Play the quiz →
          </Link>
        )}
      </nav>

      <section className="hero">
        <div className="hero-text">
          <p className="eyebrow">
            {p.brand} · {p.year}
          </p>
          <h1>{p.name}</h1>
          <p className="tagline">{d ? d.tagline : `${p.family} · ${p.keyNotes.join(', ')}`}</p>
          <dl className="quick">
            <div>
              <dt>Family</dt>
              <dd>{p.family}</dd>
            </div>
            {p.perfumer && (
              <div>
                <dt>Perfumer</dt>
                <dd>{p.perfumer}</dd>
              </div>
            )}
            {d && (
              <div>
                <dt>Rating</dt>
                <dd>
                  <Stars value={d.rating.avg} size={14} /> {d.rating.avg.toFixed(1)}
                </dd>
              </div>
            )}
          </dl>
          <ul className="key-notes">
            {p.keyNotes.map((k) => {
              const src = d ? noteImg(k) ?? noteImg(k.replace(/^May /, '')) : undefined
              return (
                <li key={k}>
                  {src && <img src={src} alt="" />}
                  {k}
                </li>
              )
            })}
          </ul>
          {d && (
            <a href="#story" className="begin">
              Begin the story <span>↓</span>
            </a>
          )}
        </div>
        <Unboxing p={p} />
      </section>

      {d ? (
        <>
          <Story p={p} d={d} />
          <Composition d={d} />
          <Register p={p} d={d} />
        </>
      ) : (
        <section className="section unwritten reveal">
          <p className="eyebrow">Still on the writing desk</p>
          <h2>This story hasn’t been written yet.</h2>
          <p>We’re adding full histories shelf by shelf. Three are ready to read right now:</p>
          <div className="more">
            {others.map((s) => (
              <Link key={s.id} to={`/perfume/${s.id}`}>
                <img src={s.img} alt="" />
                <span>
                  <b>{s.name}</b>
                  <small>
                    {s.brand} · {s.year}
                  </small>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="page-foot">
        <div className="foot-actions">
          <Link to="/" className="pill">
            ← Back to the shelves
          </Link>
          {d && next.id !== p.id && (
            <Link to={`/perfume/${next.id}`} className="pill">
              Next story: {next.name} →
            </Link>
          )}
          <Link to="/quiz" className="pill">
            The reading room →
          </Link>
        </div>
        <details className="credits">
          <summary>Photo credits</summary>
          <ul>
            <li>
              Bottle: {p.credit},{' '}
              <a href={p.source} target="_blank" rel="noreferrer">
                {p.license}
              </a>{' '}
              (background removed)
            </li>
            {credits.map((c) => (
              <li key={c.key}>
                {c.title.replace(/\.[a-z]+$/i, '')}: {c.artist || 'unknown'},{' '}
                <a href={c.page} target="_blank" rel="noreferrer">
                  {c.license}
                </a>
              </li>
            ))}
          </ul>
          <p>All images via Wikimedia Commons; ingredient photos have their backgrounds removed.</p>
        </details>
        <p className="disclaimer">
          Ratings and conversation are sample data for this demo. Scent Storizes is an independent fan project and is not affiliated with {p.brand}.
        </p>
      </footer>
    </div>
  )
}
