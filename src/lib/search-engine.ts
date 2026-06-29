// Fuzzy Search 2.0 — multi-keyword, synoniemen, vibe/categorie/buurt/sfeer
// Tokenizes query, matches against name/vibe/type/tags/neighborhood/mood with synonym expansion + fuzzy matching.

import type { Place } from "./types";
import { places } from "./places-data";

// Synonymen → genormaliseerd concept
const SYNONYMS: Record<string, string> = {
  // sfeer / vibe
  rustig: "chill",
  relax: "chill",
  relaxed: "chill",
  chill: "chill",
  rust: "chill",
  kalm: "chill",
  druk: "social",
  gezellig: "social",
  feest: "social",
  uitgaan: "social",
  nightlife: "social",
  luxueus: "luxury",
  duur: "luxury",
  fancy: "luxury",
  chique: "luxury",
  natuur: "nature",
  groen: "nature",
  wild: "nature",
  // tijd
  zonsondergang: "sunset",
  sunset: "sunset",
  avond: "sunset",
  ochtend: "morning",
  morgen: "morning",
  nacht: "night",
  // type
  strand: "beach",
  zee: "beach",
  water: "beach",
  food: "food",
  eten: "food",
  restaurant: "food",
  cafe: "food",
  koffie: "food",
  markt: "food",
  uitzicht: "viewpoint",
  viewpoint: "viewpoint",
  uitkijk: "viewpoint",
  klif: "viewpoint",
  event: "event",
  evenement: "event",
  festival: "event",
  park: "chill",
  tuin: "chill",
  museum: "museum",
  kunst: "museum",
  surf: "active",
  hike: "active",
  wandel: "active",
  wandelen: "active",
  fiets: "active",
  shop: "shopping",
  winkel: "shopping",
  winkelen: "shopping",
  // tags
  verborgen: "hidden",
  geheim: "hidden",
  hidden: "hidden",
  tip: "hidden",
  populair: "trending",
  hot: "trending",
  trending: "trending",
  nieuw: "new",
  // buurt
  centrum: "cascais centrum",
  center: "cascais centrum",
  estoril: "estoril",
  guincho: "guincho",
  sintra: "sintra",
  carcavelos: "carcavelos",
  // mood
  romantisch: "romantic",
  romantische: "romantic",
  actief: "active",
  familie: "familie",
  vrienden: "social",
};

// normaliseer een woord: lowercase, accents eraf, meervoud→enkelvoud simpele heuristiek
function normalize(w: string): string {
  let s = w.toLowerCase().trim();
  s = s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  s = s.replace(/[^a-z0-9]/g, "");
  // simpele meervoud
  if (s.length > 4 && s.endsWith("en")) s = s.slice(0, -2);
  if (s.length > 3 && s.endsWith("s")) s = s.slice(0, -1);
  return s;
}

// Levenshtein voor fuzzy typo tolerantie
function lev(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

// fuzzy match: woord komt overeen met target als exact, prefix, of levenshtein <= 1 (voor korte) / 2 (lang)
function fuzzyIncludes(word: string, target: string): boolean {
  if (!word || !target) return false;
  if (target.includes(word)) return true;
  if (word.includes(target)) return true;
  // typo tolerantie
  const d = lev(word, target);
  const maxD = target.length <= 4 ? 1 : 2;
  return d <= maxD && d / Math.max(word.length, target.length) < 0.4;
}

// bouw doorzoekbare tekst per place
function placeText(p: Place): { text: string; concepts: string[] } {
  const concepts = new Set<string>();
  const parts: string[] = [p.name, p.shortName, p.vibe, p.type, p.neighborhood, p.vibeLine, ...p.moodTags.map((m) => m.toLowerCase())];
  for (const t of p.tags) {
    const low = t.toLowerCase();
    parts.push(low);
    concepts.add(low);
  }
  // map tags naar concepten via synoniemen
  for (const key of [p.vibe.toLowerCase(), p.type.toLowerCase(), p.neighborhood.toLowerCase(), p.besteTijd.toLowerCase(), ...p.moodTags.map((m) => m.toLowerCase())]) {
    concepts.add(key);
    const syn = SYNONYMS[key];
    if (syn) concepts.add(syn);
  }
  // tag→concept
  for (const t of p.tags) {
    const low = t.toLowerCase();
    const syn = SYNONYMS[low];
    if (syn) concepts.add(syn);
  }
  return { text: parts.join(" ").toLowerCase(), concepts: [...concepts] };
}

const PLACE_INDEX = places.map((p) => ({ place: p, ...placeText(p) }));

export interface SearchResult {
  place: Place;
  score: number;
  matched: string[];
}

export function search(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const rawTokens = q.split(/\s+/).filter(Boolean);
  // normaliseer + expandeer synoniemen
  const expandedTokens: { raw: string; norm: string; concept: string | null }[] = rawTokens.map((t) => {
    const norm = normalize(t);
    const concept = SYNONYMS[norm] ?? SYNONYMS[t] ?? null;
    return { raw: t, norm, concept };
  });

  const results: SearchResult[] = [];

  for (const entry of PLACE_INDEX) {
    const { place, text, concepts } = entry;
    let score = 0;
    const matched: string[] = [];

    for (const tok of expandedTokens) {
      const { norm, concept } = tok;
      let tokenScore = 0;

      // 1) concept match (synoniemen)
      if (concept && concepts.includes(concept)) {
        tokenScore += 5;
        if (!matched.includes(concept)) matched.push(concept);
      }

      // 2) naam exact / prefix (hoog gewicht)
      const nameNorm = normalize(place.name);
      const shortNorm = normalize(place.shortName);
      if (nameNorm === norm || shortNorm === norm) {
        tokenScore += 6;
      } else if (nameNorm.includes(norm) || shortNorm.includes(norm)) {
        tokenScore += 4;
      } else if (fuzzyIncludes(norm, nameNorm) || fuzzyIncludes(norm, shortNorm)) {
        tokenScore += 3;
      }

      // 3) full-text fuzzy over alle tekst
      if (text.includes(norm)) {
        tokenScore += 2;
      } else {
        // probeer fuzzy tegen elk concept
        for (const c of concepts) {
          if (fuzzyIncludes(norm, c)) {
            tokenScore += 1.5;
            break;
          }
        }
      }

      score += tokenScore;
    }

    // boost: trending / hoge rating
    if (score > 0) {
      if (place.trending) score += 0.5;
      score += place.rating * 0.1;
    }

    if (score > 0) {
      results.push({ place, score, matched });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

// suggesties voor lege query / populaire zoekacties
export const POPULAR_SEARCHES = [
  "strand zonsondergang",
  "rustig hidden",
  "food markt",
  "uitgaan nacht",
  "uitzicht klif",
  "café ochtend",
  "surf actief",
  "romantisch luxe",
];
