import { TrackedIpoItem } from '../types';
import { DEFAULT_TRACKED_IPOS, RESEARCH_HOUSES } from '../data/defaultTrackedIpos';

const STORAGE_KEY = 'vanguard_tracked_ipos_v1';
const LAST_CRAWL_KEY = 'vanguard_tracked_ipos_last_crawl';

/**
 * Loads tracked IPOs from localStorage, falling back to default IPOs from spreadsheet
 */
export function loadStoredTrackedIpos(): TrackedIpoItem[] {
  if (typeof window === 'undefined') return DEFAULT_TRACKED_IPOS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveStoredTrackedIpos(DEFAULT_TRACKED_IPOS);
      return DEFAULT_TRACKED_IPOS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge any missing fields or new research house keys
      return parsed.map(item => {
        const defaultMatch = DEFAULT_TRACKED_IPOS.find(d => d.id === item.id);
        return {
          ...defaultMatch,
          ...item,
          fairValues: {
            ...(defaultMatch?.fairValues || {}),
            ...(item.fairValues || {}),
          },
          fairValueNotes: {
            ...(defaultMatch?.fairValueNotes || {}),
            ...(item.fairValueNotes || {}),
          },
        };
      });
    }
  } catch (err) {
    console.warn('[IpoStorage] Error reading stored IPOs:', err);
  }
  return DEFAULT_TRACKED_IPOS;
}

/**
 * Saves tracked IPOs to localStorage
 */
export function saveStoredTrackedIpos(ipos: TrackedIpoItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ipos));
  } catch (err) {
    console.warn('[IpoStorage] Error writing stored IPOs:', err);
  }
}

/**
 * Resets tracked IPOs back to default baseline spreadsheet
 */
export function resetTrackedIposToDefault(): TrackedIpoItem[] {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LAST_CRAWL_KEY);
  }
  return DEFAULT_TRACKED_IPOS;
}

/**
 * Calculates consensus statistics for an IPO across all covered research houses
 */
export function calculateIpoConsensus(ipo: TrackedIpoItem) {
  const values = Object.entries(ipo.fairValues)
    .filter(([_, val]) => typeof val === 'number' && !isNaN(val) && val > 0)
    .map(([house, val]) => ({ house, val: val as number }));

  if (values.length === 0) {
    return {
      count: 0,
      average: null,
      median: null,
      highest: null,
      lowest: null,
      highestHouse: null,
      lowestHouse: null,
      upsidePct: null,
      premiumCount: 0,
      discountCount: 0,
      consensusVerdict: 'NO_COVERAGE' as const,
    };
  }

  const rawVals = values.map(v => v.val).sort((a, b) => a - b);
  const sum = rawVals.reduce((acc, curr) => acc + curr, 0);
  const average = Number((sum / rawVals.length).toFixed(3));
  
  const mid = Math.floor(rawVals.length / 2);
  const median = rawVals.length % 2 === 0 
    ? Number(((rawVals[mid - 1] + rawVals[mid]) / 2).toFixed(3))
    : rawVals[mid];

  const highestObj = [...values].sort((a, b) => b.val - a.val)[0];
  const lowestObj = [...values].sort((a, b) => a.val - b.val)[0];

  const upsidePct = ipo.price > 0 ? Number((((average - ipo.price) / ipo.price) * 100).toFixed(1)) : 0;

  const premiumCount = values.filter(v => v.val > ipo.price).length;
  const discountCount = values.filter(v => v.val < ipo.price).length;

  let consensusVerdict: 'STRONG_BUY' | 'MODERATE_BUY' | 'NEUTRAL' | 'AVOID' | 'NO_COVERAGE' = 'NEUTRAL';
  if (upsidePct >= 25) consensusVerdict = 'STRONG_BUY';
  else if (upsidePct > 5) consensusVerdict = 'MODERATE_BUY';
  else if (upsidePct < -5) consensusVerdict = 'AVOID';

  return {
    count: values.length,
    average,
    median,
    highest: highestObj.val,
    lowest: lowestObj.val,
    highestHouse: RESEARCH_HOUSES.find(h => h.key === highestObj.house)?.shortName || highestObj.house,
    lowestHouse: RESEARCH_HOUSES.find(h => h.key === lowestObj.house)?.shortName || lowestObj.house,
    upsidePct,
    premiumCount,
    discountCount,
    consensusVerdict,
  };
}
