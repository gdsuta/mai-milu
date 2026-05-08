/**
 * __tests__/rideMatching.test.ts
 *
 * Unit tests for the ride matching algorithm functions.
 * These are pure functions so no mocking needed.
 *
 * Run: npm test -- --testPathPattern=rideMatching
 */

// ─── Inline the functions under test ────────────────────────────────────────
// We copy them here so this test file has zero import side-effects from
// the heavy Next.js / Supabase client tree in RideList.tsx.
// If you refactor the algorithm into lib/rideMatching.ts, update this import.

function tokenize(text: string): Set<string> {
  return new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2)
  )
}

function routeScore(origin: string, destination: string, userAddress: string): number {
  if (!userAddress) return 0
  const addrTokens = tokenize(userAddress)
  const origTokens = tokenize(origin)
  const destTokens = tokenize(destination)
  let originHits = 0, destHits = 0
  for (const t of addrTokens) {
    if (origTokens.has(t)) originHits++
    if (destTokens.has(t)) destHits++
  }
  return Math.min(100, originHits * 25 + destHits * 10)
}

function timeScore(departureTime: string): number {
  const hoursAway = (new Date(departureTime).getTime() - Date.now()) / 3600000
  if (hoursAway < 0)   return 0
  if (hoursAway <= 2)  return 40
  if (hoursAway <= 6)  return 30
  if (hoursAway <= 24) return 20
  if (hoursAway <= 72) return 10
  return 5
}

function hoursFromNow(h: number): string {
  return new Date(Date.now() + h * 3600000).toISOString()
}

// ─── tokenize ────────────────────────────────────────────────────────────────
describe('tokenize()', () => {
  it('lowercases and splits on whitespace', () => {
    expect(tokenize('Sangsit Buleleng')).toEqual(new Set(['sangsit', 'buleleng']))
  })

  it('filters out short words (≤2 chars)', () => {
    const result = tokenize('Jl No 5 Denpasar')
    expect(result.has('jl')).toBe(false)
    expect(result.has('no')).toBe(false)
    expect(result.has('denpasar')).toBe(true)
  })

  it('strips punctuation', () => {
    expect(tokenize('Bali, Indonesia!')).toEqual(new Set(['bali', 'indonesia']))
  })

  it('returns empty set for empty string', () => {
    expect(tokenize('')).toEqual(new Set())
  })

  it('deduplicates repeated words', () => {
    const result = tokenize('sangsit sangsit buleleng')
    expect(result.size).toBe(2)
  })
})

// ─── routeScore ─────────────────────────────────────────────────────────────
describe('routeScore()', () => {
  it('returns 0 when userAddress is empty', () => {
    expect(routeScore('Sangsit', 'Denpasar', '')).toBe(0)
  })

  it('scores high when user address matches origin exactly', () => {
    // "Sangsit" appears in address and in origin → +25
    const score = routeScore('Sangsit', 'Denpasar', 'Perumahan Sangsit Buleleng')
    expect(score).toBeGreaterThanOrEqual(25)
  })

  it('scores lower when user address matches destination only', () => {
    // "Denpasar" in address matches destination → +10
    const score = routeScore('Singaraja', 'Denpasar', 'Jl Kuta Denpasar')
    expect(score).toBe(10)
  })

  it('scores higher for origin match than destination match', () => {
    const originMatchScore = routeScore('Sangsit', 'Gianyar', 'Desa Sangsit')
    const destMatchScore   = routeScore('Gianyar', 'Sangsit', 'Desa Sangsit')
    expect(originMatchScore).toBeGreaterThan(destMatchScore)
  })

  it('accumulates score for multiple matching words', () => {
    const score = routeScore('Sangsit Buleleng', 'Denpasar', 'Sangsit Buleleng Bali')
    // "sangsit" +25, "buleleng" +25 = 50
    expect(score).toBe(50)
  })

  it('caps at 100', () => {
    const longAddress = 'sangsit buleleng singaraja bali kuta ubud seminyak canggu'
    const score = routeScore('sangsit buleleng singaraja', 'kuta ubud', longAddress)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('is case-insensitive', () => {
    const s1 = routeScore('SANGSIT', 'Denpasar', 'sangsit buleleng')
    const s2 = routeScore('sangsit', 'Denpasar', 'SANGSIT BULELENG')
    expect(s1).toBe(s2)
  })
})

// ─── timeScore ───────────────────────────────────────────────────────────────
describe('timeScore()', () => {
  it('returns 40 for rides departing in under 2 hours', () => {
    expect(timeScore(hoursFromNow(1))).toBe(40)
    expect(timeScore(hoursFromNow(1.9))).toBe(40)
  })

  it('returns 30 for rides departing within 6 hours', () => {
    expect(timeScore(hoursFromNow(3))).toBe(30)
    expect(timeScore(hoursFromNow(5.9))).toBe(30)
  })

  it('returns 20 for rides departing within 24 hours', () => {
    expect(timeScore(hoursFromNow(8))).toBe(20)
    expect(timeScore(hoursFromNow(23))).toBe(20)
  })

  it('returns 10 for rides departing within 72 hours', () => {
    expect(timeScore(hoursFromNow(25))).toBe(10)
    expect(timeScore(hoursFromNow(71))).toBe(10)
  })

  it('returns 5 for rides departing further than 72 hours away', () => {
    expect(timeScore(hoursFromNow(100))).toBe(5)
  })

  it('returns 0 for rides that have already departed', () => {
    expect(timeScore(hoursFromNow(-1))).toBe(0)
    expect(timeScore(hoursFromNow(-24))).toBe(0)
  })
})

// ─── formatBytes ─────────────────────────────────────────────────────────────
describe('formatBytes()', () => {
  // Inline the function (same reason as above)
  function formatBytes(bytes: number | null): string {
    if (!bytes) return '0 B'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  it('returns "0 B" for null', () => {
    expect(formatBytes(null)).toBe('0 B')
  })

  it('formats bytes below 1 KB', () => {
    expect(formatBytes(512)).toBe('512 B')
  })

  it('formats kilobytes', () => {
    expect(formatBytes(2048)).toBe('2 KB')
    expect(formatBytes(150000)).toBe('146 KB')
  })

  it('formats megabytes to one decimal', () => {
    expect(formatBytes(1048576)).toBe('1.0 MB')
    expect(formatBytes(2621440)).toBe('2.5 MB')
  })
})
