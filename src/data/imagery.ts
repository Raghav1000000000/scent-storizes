import credits from './imageCredits.json'
import { asset } from '../asset'

/** Real photographs (Wikimedia Commons) for notes, ingredients and story chapters. */

export type Credit = { artist: string; license: string; page: string; title: string }
const C = credits as Record<string, Credit>

/** note name → /notes/<slug>.jpg */
const NOTE: Record<string, string> = {
  Aldehydes: 'organ',
  'Ylang-ylang': 'ylang',
  Neroli: 'neroli',
  Bergamot: 'bergamot',
  Lemon: 'lemon',
  'Grasse jasmine': 'jasmine',
  Jasmine: 'jasmine',
  'May rose': 'rose',
  Rose: 'rose',
  Iris: 'iris',
  'Lily of the valley': 'lily',
  Sandalwood: 'sandalwood',
  Vetiver: 'vetiver',
  Vanilla: 'vanilla',
  Amber: 'labdanum',
  Musk: 'organ-2',
  Patchouli: 'patchouli',
  Carnation: 'carnation',
  Peach: 'peach',
  Rosewood: 'rosewood',
  Gardenia: 'gardenia',
  Clove: 'clove',
  Cedar: 'cedar',
  'Atlas cedar': 'cedar',
  Benzoin: 'benzoin',
  Oakmoss: 'oakmoss',
  Orange: 'orange',
  Grapefruit: 'grapefruit',
  'Black pepper': 'pepper',
  Pepper: 'pepper',
  'Pink pepper': 'pinkpepper',
  Geranium: 'geranium',
  Flint: 'flint',
}

/** ingredient name → /notes/<slug>.jpg */
const INGREDIENT: Record<string, string> = {
  'Aliphatic aldehydes (C-10, C-11, C-12)': 'organ',
  'Jasmine absolute, Grasse': 'jasmine',
  'Rose de Mai absolute': 'rose',
  'Ylang-ylang oil': 'ylang',
  'Orris (iris root)': 'orris',
  'Sandalwood & vetiver': 'sandalwood',
  'Vanilla & musks': 'vanilla',
  'Benzyl salicylate': 'organ-grasse',
  'Eugenol / clove': 'clove',
  'Gardenia accord': 'gardenia',
  'Rose & jasmine': 'rose',
  Orris: 'orris',
  'Sandalwood & musk': 'sandalwood',
  'Bitter & sweet orange oils': 'orange',
  Grapefruit: 'grapefruit',
  'Black pepper': 'pepper',
  'Flint accord': 'flint',
  'Iso E Super': 'organ-2',
  'Haitian vetiver': 'vetiver',
  Benzoin: 'benzoin',
}

/** `${perfumeId}:${chapterIndex}` → /story/<slug>.jpg */
const CHAPTER: Record<string, { slug: string; alt: string }> = {
  'chanel-no5:0': { slug: 'beaux', alt: 'Portrait of the perfumer Ernest Beaux' },
  'chanel-no5:1': { slug: 'chanel-painting', alt: 'Portrait of Gabrielle Chanel by Marius Borgeaud' },
  'chanel-no5:2': { slug: 'organ', alt: 'A perfumer’s organ of raw materials' },
  'chanel-no5:3': { slug: 'vendome', alt: 'Place Vendôme, Paris' },
  'chanel-no5:4': { slug: 'monroe', alt: 'Marilyn Monroe on the cover of Photoplay, 1953' },
  'chanel-no5:5': { slug: 'jasmine-harvest', alt: 'Jasmine flowers being harvested by hand' },
  'lair-du-temps:0': { slug: 'ricci-dresses', alt: 'Nina Ricci couture dresses from the 1950s' },
  'lair-du-temps:1': { slug: 'carnation-old', alt: 'Botanical illustration of a carnation' },
  'lair-du-temps:2': { slug: 'chamerolles', alt: 'A Lalique crystal flacon for Nina Ricci, Château de Chamerolles perfume museum' },
  'lair-du-temps:3': { slug: 'ricci-archive', alt: 'Robert Ricci in the 1960s' },
  'terre-dhermes:0': { slug: 'hermes-store', alt: 'The Hermès house on rue du Faubourg Saint-Honoré, Paris' },
  'terre-dhermes:1': { slug: 'orange', alt: 'A sliced orange' },
  'terre-dhermes:2': { slug: 'flint', alt: 'A knapped flint nodule' },
  'terre-dhermes:4': { slug: 'vetiver', alt: 'Vetiver grass and roots' },
}

const has = (path: string) => !!C[path]

export const noteImg = (name: string) => {
  const s = NOTE[name]
  return s && has(`notes/${s}`) ? asset(`notes/${s}.webp`) : undefined
}
export const ingredientImg = (name: string) => {
  const s = INGREDIENT[name]
  return s && has(`notes/${s}`) ? asset(`notes/${s}.webp`) : undefined
}
export const chapterImg = (id: string, i: number) => {
  const c = CHAPTER[`${id}:${i}`]
  return c && has(`story/${c.slug}`) ? { src: asset(`story/${c.slug}.jpg`), alt: c.alt, credit: C[`story/${c.slug}`] } : undefined
}

/** Every credit used by one perfume page, for the footer. */
export function pageCredits(id: string, noteNames: string[], ingredientNames: string[]) {
  const keys = new Set<string>()
  noteNames.forEach((n) => NOTE[n] && keys.add(`notes/${NOTE[n]}`))
  ingredientNames.forEach((n) => INGREDIENT[n] && keys.add(`notes/${INGREDIENT[n]}`))
  Object.entries(CHAPTER).forEach(([k, v]) => k.startsWith(id + ':') && keys.add(`story/${v.slug}`))
  ;['textures/wall', 'textures/oak', 'textures/walnut', 'textures/paper'].forEach((k) => keys.add(k))
  return [...keys].filter(has).map((k) => ({ key: k, ...C[k] }))
}

export const credit = (key: string) => C[key]
