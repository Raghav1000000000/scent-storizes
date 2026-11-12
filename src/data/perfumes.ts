import photoMeta from '../photoMeta.json'
import { asset } from '../asset'

export type Note = { name: string; hue: number }
export type Chapter = { year: string; title: string; body: string }
export type ChatMsg = { user: string; text: string; ago: string; mine?: boolean }

export type Detail = {
  tagline: string
  intro: string
  chapters: Chapter[]
  facts: { label: string; value: string }[]
  notes: { top: Note[]; heart: Note[]; base: Note[] }
  ingredients: { name: string; role: string }[]
  longevity: { hours: string; score: number } // score 0..1
  sillage: { label: string; score: number }
  occasions: string[]
  seasons: { winter: number; spring: number; summer: number; autumn: number } // 0..1
  dayNight: number // 0 = day, 1 = night
  rating: { avg: number; count: number; dist: [number, number, number, number, number] } // 5★ → 1★, percentages
  chat: ChatMsg[]
  box: { body: string; lid: string; ink: string; label: string; trim?: string }
}

export type Perfume = {
  id: string
  name: string
  brand: string
  year: number
  perfumer?: string
  family: string
  accent: string // css colour used for glow / theme
  size: number // relative height on the shelf, 0..1
  keyNotes: string[]
  detail?: Detail
  img: string
  w: number
  h: number
  credit: string
  license: string
  source: string
}

type Base = Omit<Perfume, 'img' | 'w' | 'h' | 'credit' | 'license' | 'source'>

const n = (name: string, hue: number): Note => ({ name, hue })

const base: Base[] = [
  {
    id: 'chanel-no5',
    name: 'N°5',
    brand: 'Chanel',
    year: 1921,
    perfumer: 'Ernest Beaux',
    family: 'Floral Aldehyde',
    accent: '#e0a637',
    size: 0.8,
    keyNotes: ['Aldehydes', 'Jasmine', 'May rose', 'Sandalwood'],
    detail: {
      tagline: 'A perfume that smells like a woman, not like a flower.',
      intro:
        'Before N°5, respectable perfume meant a single recognisable flower. Gabrielle Chanel asked for the opposite: something composed, abstract and deliberately artificial — a dress in liquid form. A century later it is still the reference every floral is measured against.',
      chapters: [
        {
          year: '1920',
          title: 'A perfumer from the Russian court',
          body:
            'Chanel was introduced to Ernest Beaux, a Moscow-born perfumer who had made his name at Rallet, supplier to the Russian imperial court, and had resettled in the south of France after the revolution. She gave him a brief with no flower in it: a scent that was unmistakably made, the way a couture dress is made.',
        },
        {
          year: '1921',
          title: 'The fifth sample',
          body:
            'Beaux presented two series of numbered trials — 1 to 5 and 20 to 24. Chanel picked the fifth vial and kept the laboratory number as its name. She showed her collections on the fifth day of the fifth month and considered five her lucky number; a perfume called simply “N°5” was as radical as the smell.',
        },
        {
          year: '1921',
          title: 'The aldehyde overdose',
          body:
            'What made sample five unlike anything on the market was an unusually heavy dose of aliphatic aldehydes — synthetic molecules that smell waxy, soapy and sparkling, like cold air on clean skin. Laid over extravagant amounts of Grasse jasmine and May rose, they blurred the flowers into something abstract. Aldehydes had been used before; never this boldly.',
        },
        {
          year: '1924',
          title: 'A bottle like a laboratory flask',
          body:
            'In an age of ornate Lalique crystal, N°5 came in a plain, square-shouldered flask with a black-and-white label. The faceted stopper, cut like an emerald, is often said to echo the outline of Place Vendôme. In the same year Chanel partnered with Pierre and Paul Wertheimer to found Parfums Chanel and take the scent worldwide.',
        },
        {
          year: '1952',
          title: 'Five drops',
          body:
            'Asked what she wore to bed, Marilyn Monroe answered: Chanel N°5. No advertising campaign has ever matched the line. The bottle itself went on to become a design object in its own right and, in the 1980s, the subject of a series of Andy Warhol screenprints.',
        },
        {
          year: '1986',
          title: 'The Eau de Parfum',
          body:
            'Jacques Polge, Chanel’s house perfumer from 1978, created the Eau de Parfum concentration pictured here — a fuller, more vanillic reading of Beaux’s formula that became the version most people know today. Chanel still grows its own jasmine and rose in Grasse to supply it.',
        },
      ],
      facts: [
        { label: 'House', value: 'Chanel, Paris' },
        { label: 'Launched', value: '5 May 1921' },
        { label: 'Perfumer', value: 'Ernest Beaux' },
        { label: 'Family', value: 'Floral aldehyde' },
        { label: 'Pictured', value: 'Eau de Parfum (1986, Jacques Polge)' },
      ],
      notes: {
        top: [n('Aldehydes', 48), n('Ylang-ylang', 52), n('Neroli', 38), n('Bergamot', 75), n('Lemon', 58)],
        heart: [n('Grasse jasmine', 45), n('May rose', 345), n('Iris', 265), n('Lily of the valley', 130)],
        base: [n('Sandalwood', 28), n('Vetiver', 95), n('Vanilla', 40), n('Amber', 32), n('Musk', 20), n('Patchouli', 18)],
      },
      ingredients: [
        { name: 'Aliphatic aldehydes (C-10, C-11, C-12)', role: 'The famous sparkle — waxy, soapy, champagne-like lift' },
        { name: 'Jasmine absolute, Grasse', role: 'The opulent, slightly animalic floral core' },
        { name: 'Rose de Mai absolute', role: 'Honeyed, soft rose that rounds the jasmine' },
        { name: 'Ylang-ylang oil', role: 'Creamy, banana-like floral bridge to the top' },
        { name: 'Orris (iris root)', role: 'Cool, powdery, cosmetic texture' },
        { name: 'Sandalwood & vetiver', role: 'Milky and dry woods that hold the base for hours' },
        { name: 'Vanilla & musks', role: 'Warm, skin-like trail' },
      ],
      longevity: { hours: '7–9 h', score: 0.8 },
      sillage: { label: 'Moderate to strong', score: 0.7 },
      occasions: ['Evening out', 'Formal dinner', 'Opera & theatre', 'Signature scent', 'Weddings'],
      seasons: { winter: 0.9, spring: 0.6, summer: 0.3, autumn: 0.85 },
      dayNight: 0.65,
      rating: { avg: 4.3, count: 18240, dist: [58, 22, 11, 5, 4] },
      chat: [
        { user: 'maison_noor', text: 'First spray is pure soap and champagne. Give it twenty minutes — the jasmine that comes after is unreal.', ago: '2h' },
        { user: 'kabir.s', text: 'My grandmother’s dressing table in one bottle. I can’t be objective about this one.', ago: '5h' },
        { user: 'ines_r', text: 'Hot take: the EDP is easier to wear than the parfum. More vanilla, less powder.', ago: '1d' },
        { user: 'oakmoss_owl', text: 'People call it “old”. It’s not old, it’s just not sweet. Different thing.', ago: '1d' },
        { user: 'tanvi', text: 'Wore it to a wedding in December. Three compliments, one from the bride’s mother 😄', ago: '3d' },
      ],
      box: { body: '#f6f3ec', lid: '#f6f3ec', ink: '#111111', label: 'N°5', trim: '#111111' },
    },
  },
  {
    id: 'lair-du-temps',
    name: 'L’Air du Temps',
    brand: 'Nina Ricci',
    year: 1948,
    perfumer: 'Francis Fabron',
    family: 'Floral Spicy',
    accent: '#e9c46a',
    size: 0.64,
    keyNotes: ['Carnation', 'Gardenia', 'Rose', 'Sandalwood'],
    detail: {
      tagline: 'The spirit of the times, with doves on its shoulders.',
      intro:
        'Launched three years after the end of the Second World War, L’Air du Temps was built to smell like relief — soft carnation, clean florals and a warmth that never turns heavy. Its dove-crowned bottle became one of the most recognised silhouettes in perfumery.',
      chapters: [
        {
          year: '1945',
          title: 'A couture house looks for its scent',
          body:
            'Nina Ricci dressed Parisian women in graceful, feminine couture; her son Robert Ricci ran the business and believed a great house needed a great perfume. After the liberation of Paris he set out to make one that would capture the new mood — youth, peace and lightness after years of darkness.',
        },
        {
          year: '1948',
          title: 'Francis Fabron’s carnation',
          body:
            'Perfumer Francis Fabron answered with a short, remarkably simple formula. At its heart is a spicy, clove-tinged carnation wrapped in gardenia, rose and jasmine, floated on a large dose of benzyl salicylate — a material that gives the whole composition its sunlit, silky, slightly solar feel. The name means “the air of the time”: the spirit of the age.',
        },
        {
          year: '1951',
          title: 'The Lalique doves',
          body:
            'The first flacon carried a single dove. In 1951 Robert Ricci’s friend Marc Lalique redesigned it with a swirling crystal body and a frosted stopper of two doves in flight — a symbol of peace and tenderness that turned the bottle into an icon and a collector’s object.',
        },
        {
          year: '1960s–80s',
          title: 'One of the world’s best-sellers',
          body:
            'For decades L’Air du Temps sat among the best-selling perfumes on earth, a first “grown-up” fragrance handed from mothers to daughters. The oval flask pictured here, with doves moulded in relief into the glass, is one of the eau de toilette bottles from that long run.',
        },
        {
          year: '1991',
          title: 'A line in a thriller',
          body:
            'In The Silence of the Lambs, Hannibal Lecter identifies Clarice Starling’s perfume through the glass of his cell: she sometimes wears L’Air du Temps — “but not today”. A gentle scent, borrowed for one of cinema’s most unsettling moments.',
        },
      ],
      facts: [
        { label: 'House', value: 'Nina Ricci, Paris' },
        { label: 'Launched', value: '1948' },
        { label: 'Perfumer', value: 'Francis Fabron' },
        { label: 'Family', value: 'Floral spicy' },
        { label: 'Bottle', value: 'Twin-dove stopper by Marc Lalique, 1951' },
      ],
      notes: {
        top: [n('Carnation', 350), n('Bergamot', 75), n('Peach', 25), n('Rosewood', 15), n('Neroli', 38)],
        heart: [n('Gardenia', 60), n('Rose', 345), n('Jasmine', 45), n('Ylang-ylang', 52), n('Clove', 12), n('Iris', 265)],
        base: [n('Sandalwood', 28), n('Musk', 20), n('Cedar', 22), n('Benzoin', 30), n('Amber', 32), n('Oakmoss', 110)],
      },
      ingredients: [
        { name: 'Benzyl salicylate', role: 'The secret of the formula — a solar, silky floral haze' },
        { name: 'Eugenol / clove', role: 'Gives the carnation its peppery, spicy bite' },
        { name: 'Gardenia accord', role: 'Creamy white-flower body' },
        { name: 'Rose & jasmine', role: 'Classic floral heart, kept light and airy' },
        { name: 'Orris', role: 'Powdery softness' },
        { name: 'Sandalwood & musk', role: 'A warm, clean skin finish' },
      ],
      longevity: { hours: '4–6 h', score: 0.5 },
      sillage: { label: 'Soft to moderate', score: 0.4 },
      occasions: ['Daytime', 'Office', 'Spring weddings', 'Sunday brunch', 'First fragrance'],
      seasons: { winter: 0.35, spring: 0.95, summer: 0.6, autumn: 0.55 },
      dayNight: 0.25,
      rating: { avg: 4.1, count: 9630, dist: [47, 28, 15, 6, 4] },
      chat: [
        { user: 'clove.and.co', text: 'If you’ve never smelled a proper carnation perfume, start here. Spicy but so soft.', ago: '4h' },
        { user: 'rhea_m', text: 'The vintage bottles with the doves are half the reason I collect. Mine sits on the shelf empty and I still love it.', ago: '9h' },
        { user: 'jules', text: 'Smells like clean sheets drying in the sun. Not exciting, just lovely.', ago: '1d' },
        { user: 'oakmoss_owl', text: 'Current formula is thinner than the old one but the idea is intact. Fabron was a genius of short formulas.', ago: '2d' },
        { user: 'amara', text: '“…but not today.” Came for the movie reference, stayed for the perfume.', ago: '4d' },
      ],
      box: { body: '#f3d34a', lid: '#f3d34a', ink: '#6b4a00', label: 'L’Air du Temps', trim: '#ffffff' },
    },
  },
  {
    id: 'terre-dhermes',
    name: 'Terre d’Hermès',
    brand: 'Hermès',
    year: 2006,
    perfumer: 'Jean-Claude Ellena',
    family: 'Woody Mineral',
    accent: '#f08a24',
    size: 0.74,
    keyNotes: ['Orange', 'Flint', 'Pepper', 'Vetiver'],
    detail: {
      tagline: 'Feet on the ground, head in the stars.',
      intro:
        'Terre d’Hermès is a perfume about standing on the earth and looking up. Jean-Claude Ellena wrote it like a haiku — few materials, a great deal of air between them — and ended up with one of the defining men’s fragrances of the century.',
      chapters: [
        {
          year: '2004',
          title: 'Hermès hires a writer of smells',
          body:
            'Hermès named Jean-Claude Ellena its first in-house perfumer in 2004. Grasse-born and famous for stripping formulas back to essentials, Ellena compared his work to watercolour and to writing: say more with less. Un Jardin sur le Nil came first; then he turned to a masculine pillar for the house.',
        },
        {
          year: '2006',
          title: 'A vertical perfume',
          body:
            'Instead of the usual top–heart–base pyramid, Ellena imagined a vertical line running from earth to sky. Bright orange and grapefruit stand for light; pepper and a flinty, mineral note for stone; vetiver, cedar and patchouli for the ground beneath. He spoke of it as a kind of alchemy — earth, air and water in a single gesture.',
        },
        {
          year: '2006',
          title: 'The smell of struck flint',
          body:
            'Its signature is that mineral effect: the dry, sparking smell of flint on stone, set against bitter orange peel. Much of the perfume’s radiant, transparent woodiness comes from a generous use of Iso E Super, a velvety cedar-like molecule Ellena has long favoured.',
        },
        {
          year: '2006',
          title: 'An H in the glass',
          body:
            'Designer Philippe Mouquet gave the bottle a heavy glass base cut so that an orange “H” appears through it when seen from below, and a shoulder-mounted cap that twists to lock. Orange, the house colour of Hermès, runs through the whole design.',
        },
        {
          year: '2007–2009',
          title: 'A modern classic',
          body:
            'Terre d’Hermès won a FiFi Award in 2007 and quickly became the house’s best-selling men’s fragrance. A denser Parfum concentration followed in 2009, pushing the woods and benzoin forward while keeping the flint-and-orange signature.',
        },
      ],
      facts: [
        { label: 'House', value: 'Hermès, Paris' },
        { label: 'Launched', value: '2006' },
        { label: 'Perfumer', value: 'Jean-Claude Ellena' },
        { label: 'Family', value: 'Woody mineral' },
        { label: 'Bottle', value: 'Philippe Mouquet' },
      ],
      notes: {
        top: [n('Orange', 28), n('Grapefruit', 15), n('Bergamot', 75)],
        heart: [n('Black pepper', 0), n('Pink pepper', 340), n('Geranium', 120), n('Flint', 210)],
        base: [n('Vetiver', 95), n('Atlas cedar', 22), n('Patchouli', 18), n('Benzoin', 32)],
      },
      ingredients: [
        { name: 'Bitter & sweet orange oils', role: 'Juicy, peel-bright opening' },
        { name: 'Grapefruit', role: 'A bitter, slightly sulphurous edge that reads as “mineral”' },
        { name: 'Black pepper', role: 'Dry heat without sweetness' },
        { name: 'Flint accord', role: 'The signature — struck stone, hot gravel, dry earth' },
        { name: 'Iso E Super', role: 'Transparent, velvety cedar radiance' },
        { name: 'Haitian vetiver', role: 'Rooty, smoky, earthy backbone' },
        { name: 'Benzoin', role: 'A faint resinous warmth in the drydown' },
      ],
      longevity: { hours: '6–8 h', score: 0.7 },
      sillage: { label: 'Moderate', score: 0.55 },
      occasions: ['Office', 'Everyday signature', 'Dinner', 'Outdoors', 'Smart casual'],
      seasons: { winter: 0.6, spring: 0.85, summer: 0.6, autumn: 0.95 },
      dayNight: 0.4,
      rating: { avg: 4.5, count: 24910, dist: [66, 21, 8, 3, 2] },
      chat: [
        { user: 'vetiver_ved', text: 'Orange peel on a hot rock. Nothing else smells like the first ten minutes of this.', ago: '1h' },
        { user: 'lena.k', text: 'Bought it for my dad, ended up wearing it myself. It is not a “men’s” perfume, it’s just a good one.', ago: '6h' },
        { user: 'kabir.s', text: 'EDT for the office, Parfum for evenings. The Parfum is darker and lasts way longer.', ago: '14h' },
        { user: 'noseblind_nick', text: 'Careful — the Iso E makes you stop smelling it on yourself after an hour. Everyone else still can.', ago: '2d' },
        { user: 'amara', text: 'Ellena really did write a perfume with like twelve ingredients and it beat everything.', ago: '3d' },
      ],
      box: { body: '#f37021', lid: '#f37021', ink: '#3a1c05', label: 'Terre d’Hermès', trim: '#4a2a12' },
    },
  },
  { id: 'shalimar', name: 'Shalimar', brand: 'Guerlain', year: 1925, perfumer: 'Jacques Guerlain', family: 'Amber', accent: '#d99b2b', size: 0.76, keyNotes: ['Bergamot', 'Iris', 'Vanilla', 'Opoponax'] },
  { id: 'mitsouko', name: 'Mitsouko', brand: 'Guerlain', year: 1919, perfumer: 'Jacques Guerlain', family: 'Fruity Chypre', accent: '#cdbf9a', size: 0.72, keyNotes: ['Peach', 'Bergamot', 'Oakmoss', 'Spices'] },
  { id: 'lheure-bleue', name: 'L’Heure Bleue', brand: 'Guerlain', year: 1912, perfumer: 'Jacques Guerlain', family: 'Floral Amber', accent: '#8fa6d6', size: 0.74, keyNotes: ['Anise', 'Carnation', 'Heliotrope', 'Vanilla'] },
  { id: 'vetiver', name: 'Vétiver', brand: 'Guerlain', year: 1959, perfumer: 'Jean-Paul Guerlain', family: 'Woody Aromatic', accent: '#7fc79b', size: 0.8, keyNotes: ['Vetiver', 'Citrus', 'Tobacco', 'Nutmeg'] },
  { id: 'jicky', name: 'Jicky', brand: 'Guerlain', year: 1889, perfumer: 'Aimé Guerlain', family: 'Aromatic Fougère', accent: '#d8c12f', size: 0.74, keyNotes: ['Lavender', 'Bergamot', 'Vanilla', 'Tonka'] },
  { id: 'joy', name: 'Joy', brand: 'Jean Patou', year: 1930, perfumer: 'Henri Alméras', family: 'Floral', accent: '#f0b93a', size: 0.76, keyNotes: ['Jasmine', 'Rose', 'Ylang-ylang', 'Tuberose'] },
  { id: 'eau-sauvage', name: 'Eau Sauvage', brand: 'Dior', year: 1966, perfumer: 'Edmond Roudnitska', family: 'Citrus Aromatic', accent: '#d9d3b4', size: 0.72, keyNotes: ['Lemon', 'Rosemary', 'Hedione', 'Vetiver'] },
  { id: 'miss-dior-cherie', name: 'Miss Dior Chérie', brand: 'Dior', year: 2005, perfumer: 'Christine Nagel', family: 'Fruity Chypre', accent: '#f1c9a8', size: 0.7, keyNotes: ['Strawberry', 'Caramel popcorn', 'Patchouli', 'Musk'] },
  { id: 'coco-mademoiselle', name: 'Coco Mademoiselle', brand: 'Chanel', year: 2001, perfumer: 'Jacques Polge', family: 'Amber Floral', accent: '#f2a6b4', size: 0.76, keyNotes: ['Orange', 'Rose', 'Jasmine', 'Patchouli'] },
  { id: 'tresor', name: 'Trésor', brand: 'Lancôme', year: 1990, perfumer: 'Sophia Grojsman', family: 'Floral Fruity', accent: '#f08a3c', size: 0.58, keyNotes: ['Rose', 'Apricot', 'Peach', 'Iris'] },
  { id: 'acqua-di-gio', name: 'Acqua di Giò', brand: 'Giorgio Armani', year: 1996, perfumer: 'Alberto Morillas', family: 'Aquatic Aromatic', accent: '#cfe0c3', size: 0.84, keyNotes: ['Marine notes', 'Bergamot', 'Jasmine', 'Cedar'] },
  { id: 'cool-water', name: 'Cool Water', brand: 'Davidoff', year: 1988, perfumer: 'Pierre Bourdon', family: 'Aromatic Fougère', accent: '#3d8fb5', size: 0.86, keyNotes: ['Mint', 'Lavender', 'Sea notes', 'Sandalwood'] },
  { id: 'cool-water-woman', name: 'Cool Water Woman', brand: 'Davidoff', year: 1996, perfumer: 'Pierre Bourdon', family: 'Floral Aquatic', accent: '#5aa9f0', size: 0.9, keyNotes: ['Melon', 'Lotus', 'Water lily', 'Musk'] },
  { id: 'drakkar-noir', name: 'Drakkar Noir', brand: 'Guy Laroche', year: 1982, perfumer: 'Pierre Wargnye', family: 'Aromatic Fougère', accent: '#9aa0ad', size: 0.8, keyNotes: ['Lavender', 'Juniper', 'Leather', 'Oakmoss'] },
  { id: 'aramis', name: 'Aramis', brand: 'Aramis', year: 1966, perfumer: 'Bernard Chant', family: 'Leather Chypre', accent: '#d48a2c', size: 0.74, keyNotes: ['Aldehydes', 'Leather', 'Oakmoss', 'Patchouli'] },
  { id: 'polo', name: 'Polo', brand: 'Ralph Lauren', year: 1978, perfumer: 'Carlos Benaïm', family: 'Woody Chypre', accent: '#2f8f5b', size: 0.74, keyNotes: ['Pine', 'Tobacco', 'Leather', 'Oakmoss'] },
  { id: 'le-male', name: 'Le Male', brand: 'Jean Paul Gaultier', year: 1995, perfumer: 'Francis Kurkdjian', family: 'Amber Fougère', accent: '#5f9ccf', size: 0.84, keyNotes: ['Mint', 'Lavender', 'Vanilla', 'Tonka'] },
  { id: 'one-million', name: '1 Million', brand: 'Paco Rabanne', year: 2008, perfumer: 'Christophe Raynaud, Olivier Pescheux & Michel Girard', family: 'Spicy Leather', accent: '#e6b422', size: 0.8, keyNotes: ['Blood mandarin', 'Cinnamon', 'Leather', 'Amber'] },
  { id: 'eros', name: 'Eros', brand: 'Versace', year: 2012, perfumer: 'Aurélien Guichard', family: 'Aromatic Fougère', accent: '#1fa3c4', size: 0.8, keyNotes: ['Mint', 'Green apple', 'Tonka', 'Vanilla'] },
  { id: 'jardin-sur-le-nil', name: 'Un Jardin sur le Nil', brand: 'Hermès', year: 2005, perfumer: 'Jean-Claude Ellena', family: 'Green Citrus', accent: '#7fd8b0', size: 0.84, keyNotes: ['Green mango', 'Lotus', 'Grapefruit', 'Sycamore'] },
  { id: 'flower-by-kenzo', name: 'Flower by Kenzo', brand: 'Kenzo', year: 2000, perfumer: 'Alberto Morillas', family: 'Powdery Floral', accent: '#e8523f', size: 0.96, keyNotes: ['Violet', 'Bulgarian rose', 'Vanilla', 'White musk'] },
  { id: 'santal-33', name: 'Santal 33', brand: 'Le Labo', year: 2011, perfumer: 'Frank Voelkl', family: 'Woody', accent: '#d8d2c4', size: 0.64, keyNotes: ['Sandalwood', 'Cardamom', 'Papyrus', 'Leather'] },
  { id: 'silver-birch-lavender', name: 'Silver Birch & Lavender', brand: 'Jo Malone London', year: 2020, family: 'Aromatic Woody', accent: '#c9cfd6', size: 0.84, keyNotes: ['Grapefruit', 'English lavender', 'Silver birch'] },
  { id: 'orange-blossom', name: 'Orange Blossom', brand: 'Penhaligon’s', year: 1976, family: 'White Floral', accent: '#e3b52c', size: 0.84, keyNotes: ['Orange blossom', 'Neroli', 'Bergamot', 'Musk'] },
  { id: 'burberry-brit', name: 'Brit', brand: 'Burberry', year: 2003, perfumer: 'Nathalie Gracia-Cetto', family: 'Amber Fruity', accent: '#e7a590', size: 0.86, keyNotes: ['Pear', 'Lime', 'Almond', 'Vanilla'] },
  { id: 'paradoxe', name: 'Paradoxe', brand: 'Prada', year: 2022, perfumer: 'Nadège Le Garlantezec, Shyamala & Antoine Maisondieu', family: 'Floral Amber', accent: '#f3b9a0', size: 0.6, keyNotes: ['Neroli', 'Pear', 'Amber', 'White musk'] },
]

type Meta = Record<string, { w: number; h: number; credit: string; license: string; source: string }>
const meta = photoMeta as Meta

export const perfumes: Perfume[] = base
  .filter((p) => meta[p.id])
  .map((p) => ({ ...p, img: asset(`perfumes/${p.id}.webp`), ...meta[p.id] }))

export const byId = (id: string) => perfumes.find((p) => p.id === id)

/** Fuzzy-ish search: every query token must appear in name / brand / perfumer / family / notes. */
export function searchPerfumes(q: string): Perfume[] {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[’'°]/g, '')
  const tokens = norm(q).split(/\s+/).filter(Boolean)
  if (!tokens.length) return []
  return perfumes
    .map((p) => {
      const hay = norm(`${p.name} ${p.brand} ${p.perfumer ?? ''} ${p.family} ${p.keyNotes.join(' ')} ${p.year}`)
      const title = norm(`${p.name} ${p.brand}`)
      if (!tokens.every((t) => hay.includes(t))) return null
      const score = tokens.reduce((s, t) => s + (title.startsWith(t) ? 3 : title.includes(t) ? 2 : 1), 0) + (p.detail ? 0.5 : 0)
      return { p, score }
    })
    .filter((x): x is { p: Perfume; score: number } => !!x)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p)
}
