import data from './data/quran.json';
import layout from './data/layout.json';
import lineWidths from './data/lineWidths.json';

// Each ayah: [sura, aya, page, juz, text]
export const AYAHS = data.ayahs;
export const SURAS = data.suras;
export const JUZ = data.juz;
export const TOTAL_PAGES = 604;
export const FIRST_PAGE = 2; // page 1 of the print is the title page

// Pages with a word-exact 15-line layout (currently Al-Fatiha and Al-Baqara).
export const LAYOUT = {};
// Widest line of each layout page (sum of word widths at 100px), measured in the browser.
export const LINE_WIDTH = lineWidths;
layout.pages.forEach((pg) => {
  LAYOUT[pg.p] = pg.lines;
  // The print numbers ayat by the Kufi count; keep its totals for the sura banners.
  pg.lines.forEach((l) => {
    if (!l.w) return;
    l.w.forEach(([, idx, n]) => {
      if (!n || idx < 0) return;
      const s = SURAS[AYAHS[idx][0] - 1];
      s.printCount = Math.max(s.printCount || 0, n);
    });
  });
});
Object.entries(layout.ayahPage).forEach(([i, p]) => { AYAHS[+i][2] = p; });
AYAHS.forEach((a) => { if (a[2] < FIRST_PAGE) a[2] = FIRST_PAGE; });
SURAS.forEach((s) => { s.page = AYAHS.find((a) => a[0] === s.n)[2]; });
JUZ.forEach((j) => { j.page = AYAHS.find((a) => a[0] === j.sura && a[1] === j.aya)[2]; });
export const BASMALA = 'بِسْمِ اِ۬للَّهِ اِ۬لرَّحْمَٰنِ اِ۬لرَّحِيمِ';

const pageIndex = Array.from({ length: TOTAL_PAGES + 1 }, () => []);
AYAHS.forEach((a, i) => pageIndex[a[2]].push(i));

export const pageAyahs = (p) => pageIndex[p] || [];
export const suraByNumber = (n) => SURAS[n - 1];

export function pageInfo(p) {
  const list = pageIndex[p];
  const first = AYAHS[list[0]];
  return { sura: suraByNumber(first[0]), juz: first[3] };
}

export function findAyah(sura, aya) {
  return AYAHS.find((a) => a[0] === sura && a[1] === aya);
}

const DIGITS = '٠١٢٣٤٥٦٧٨٩';
export const ar = (n) => String(n).replace(/\d/g, (d) => DIGITS[d]);

// Loose normalisation so that a plain typed word matches the fully vowelled
// Qalun text (diacritics, hamza seats and alef spellings are ignored).
export function normalize(s) {
  return s
    .replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ‏]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ىےئ]/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ة/g, 'ه')
    .replace(/[اء]/g, '')
    .replace(/[٠-٩0-9]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

let searchIndex = null;
export function search(query, limit = 300) {
  const q = normalize(query);
  if (q.length < 2) return [];
  if (!searchIndex) searchIndex = AYAHS.map((a) => normalize(a[4]));
  const out = [];
  for (let i = 0; i < searchIndex.length && out.length < limit; i++) {
    if (searchIndex[i].includes(q)) out.push(i);
  }
  return out;
}
