export type Question = {
  q: string
  options: string[] // the first option is the correct one; they are shuffled at run time
  fact: string
}

export const QUESTIONS: Question[] = [
  {
    q: 'Which house launched N°5 in 1921?',
    options: ['Chanel', 'Guerlain', 'Dior', 'Lanvin'],
    fact: 'Gabrielle Chanel picked the fifth sample she was shown — and kept the number as the name.',
  },
  {
    q: 'Who composed Chanel N°5?',
    options: ['Ernest Beaux', 'Jacques Guerlain', 'Edmond Roudnitska', 'François Coty'],
    fact: 'Beaux had been perfumer to the Russian court before settling in France.',
  },
  {
    q: 'Which family of molecules gives N°5 its famous soapy sparkle?',
    options: ['Aldehydes', 'Lactones', 'Ionones', 'Coumarins'],
    fact: 'N°5 used aliphatic aldehydes in a dose nobody had dared before.',
  },
  {
    q: 'What crowns the classic bottle of L’Air du Temps?',
    options: ['Two doves', 'A swan', 'A butterfly', 'A crown'],
    fact: 'Marc Lalique designed the twin-dove stopper in 1951 as a symbol of peace.',
  },
  {
    q: 'Who composed Terre d’Hermès?',
    options: ['Jean-Claude Ellena', 'Alberto Morillas', 'Francis Kurkdjian', 'Jacques Polge'],
    fact: 'Ellena became Hermès’ first in-house perfumer in 2004; Terre followed in 2006.',
  },
  {
    q: 'In perfumery, what is “sillage”?',
    options: ['The trail a scent leaves in the air', 'The stopper of a bottle', 'The alcohol content', 'The first ten seconds of a spray'],
    fact: 'It’s French for “wake” — like the trail a boat leaves on water.',
  },
  {
    q: 'Which of these notes comes from a root?',
    options: ['Iris (orris)', 'Jasmine', 'Bergamot', 'Neroli'],
    fact: 'Orris is the rhizome of the iris, dried for years before it smells of anything.',
  },
  {
    q: 'Bergamot, the classic top note, is a…',
    options: ['Citrus fruit', 'White flower', 'Tree resin', 'Type of moss'],
    fact: 'Almost all of it grows on a thin strip of coast in Calabria, Italy.',
  },
  {
    q: 'Which concentration holds the most perfume oil?',
    options: ['Extrait de parfum', 'Eau de parfum', 'Eau de toilette', 'Eau de cologne'],
    fact: 'Extrait (pure parfum) is the richest; eau de cologne the lightest.',
  },
  {
    q: 'Which French town is known as the perfume capital of the world?',
    options: ['Grasse', 'Lyon', 'Avignon', 'Bordeaux'],
    fact: 'Grasse’s jasmine and May rose fields have supplied perfumers for centuries.',
  },
  {
    q: 'Guerlain’s Jicky, often called the first modern perfume, dates from…',
    options: ['1889', '1921', '1853', '1947'],
    fact: 'Jicky mixed natural essences with new synthetics like vanillin and coumarin.',
  },
  {
    q: 'Ambergris, prized as a fixative, originally comes from…',
    options: ['Sperm whales', 'Fossilised tree resin', 'Honeybees', 'A desert shrub'],
    fact: 'It ages for years at sea before washing ashore; today it is almost always recreated synthetically.',
  },
  {
    q: 'Oud is the resinous heartwood of which tree?',
    options: ['Agarwood (Aquilaria)', 'Sandalwood', 'Cedar', 'Olive'],
    fact: 'The tree only produces the dark resin after being infected by a mould.',
  },
  {
    q: 'Who composed Dior’s Eau Sauvage in 1966?',
    options: ['Edmond Roudnitska', 'Ernest Beaux', 'Pierre Bourdon', 'Sophia Grojsman'],
    fact: 'It was one of the first perfumes to use hedione, an airy jasmine molecule.',
  },
  {
    q: 'Jean Paul Gaultier’s Le Male comes in a bottle shaped like…',
    options: ['A sailor’s torso', 'A gold bar', 'A lighthouse', 'An anchor'],
    fact: 'It ships inside a tin can — and was Francis Kurkdjian’s first big success.',
  },
  {
    q: 'Paco Rabanne’s 1 Million bottle is shaped like…',
    options: ['A gold ingot', 'A coin', 'A dice', 'A diamond'],
    fact: 'Launched in 2008, it became one of the best-selling men’s fragrances of its era.',
  },
  {
    q: 'Eau de Cologne is named after a city in which country?',
    options: ['Germany', 'France', 'Italy', 'Switzerland'],
    fact: 'Cologne — Köln — is where Johann Maria Farina made the citrus water famous in the 1700s.',
  },
  {
    q: 'Neroli is distilled from the blossom of the…',
    options: ['Bitter orange tree', 'Lemon tree', 'Jasmine vine', 'Linden tree'],
    fact: 'The same tree also gives petitgrain (leaves) and bitter orange oil (peel).',
  },
  {
    q: 'The chypre family is named after which island?',
    options: ['Cyprus', 'Crete', 'Corsica', 'Sicily'],
    fact: 'A chypre rests on bergamot, oakmoss and labdanum — Mitsouko is the classic example.',
  },
  {
    q: 'Guerlain’s Shalimar takes its name from…',
    options: ['Mughal gardens', 'A racehorse', 'An opera', 'A sailing ship'],
    fact: 'It was inspired by the love story of Shah Jahan and Mumtaz Mahal.',
  },
  {
    q: 'In what order do a perfume’s notes unfold?',
    options: ['Top, heart, base', 'Base, heart, top', 'Heart, top, base', 'Top, base, heart'],
    fact: 'Light molecules evaporate first; heavy woods, resins and musks stay for hours.',
  },
  {
    q: 'Which of these is a wood?',
    options: ['Sandalwood', 'Tuberose', 'Tonka bean', 'Labdanum'],
    fact: 'Tuberose is a flower, tonka a seed and labdanum a resin.',
  },
]

export function buildRound(n = 10) {
  const shuffle = <T,>(a: T[]) => {
    const b = [...a]
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[b[i], b[j]] = [b[j], b[i]]
    }
    return b
  }
  return shuffle(QUESTIONS)
    .slice(0, n)
    .map((q) => {
      const opts = shuffle(q.options)
      return { q: q.q, fact: q.fact, options: opts, answer: opts.indexOf(q.options[0]) }
    })
}

export type Round = ReturnType<typeof buildRound>
