import { TrackedIpoItem } from '../types';
import { DEFAULT_TRACKED_IPOS, RESEARCH_HOUSES } from '../data/defaultTrackedIpos';

const STORAGE_KEY = 'vanguard_tracked_ipos_v1';
const LAST_CRAWL_KEY = 'vanguard_tracked_ipos_last_crawl';

/**
 * Strictly verifies that an IPO candidate belongs to a company in Malaysia
 * to be listed or scheduled on Bursa Malaysia.
 * Any non-Malaysian company or foreign exchange listing is strictly disqualified.
 */
export function isMalaysianIpo(item: Partial<TrackedIpoItem>): boolean {
  if (!item) return false;
  const stockName = (item.stockName || '').trim();
  const fullName = (item.fullName || '').trim();
  const notes = (item.notes || '').trim();
  const combined = `${stockName} ${fullName} ${notes}`.toLowerCase();
  
  // 1. Foreign Exchanges & Foreign Jurisdiction Indicators (strictly rejected)
  const foreignMarkets = [
    'nasdaq', 'nyse', 'sgx', 'hkex', 'asx', 'idx', 'london stock exchange', 'lse',
    'singapore stock', 'singapore ipo', 'us ipo', 'hong kong ipo', 'china ipo',
    'indonesia ipo', 'idx ipo', 'asx ipo', 'wall street', 'tokyo stock', 'tse',
    'frankfurt', 'euronext', 'taiwan stock', 'twse', 'bombay', 'bse ipo', 'nse ipo',
    'sec.gov', 'delaware', 'cayman islands', 'british virgin islands'
  ];
  for (const fm of foreignMarkets) {
    if (combined.includes(fm)) return false;
  }

  // 2. Foreign mega-caps and non-Malaysian corporate entities
  const foreignEntities = [
    'aapl', 'apple inc', 'tsla', 'tesla', 'msft', 'microsoft', 'amzn', 'amazon',
    'googl', 'google', 'alphabet', 'nvda', 'nvidia', 'meta platforms', 'facebook',
    'arm holdings', 'reddit', 'shein', 'temu', 'bytedance', 'tiktok', 'grab holdings'
  ];
  for (const fe of foreignEntities) {
    if (combined.includes(fe)) return false;
  }

  // 3. Positive Malaysian Corporate Affirmation:
  // Must satisfy at least one affirmative indicator of Malaysian incorporation / Bursa listing:
  const hasBerhad = /\b(berhad|bhd)\b/i.test(fullName) || /\b(berhad|bhd)\b/i.test(stockName);
  const hasBursaReference = /\b(bursa|ace market|main market|leap market|miti|bumiputera|suruhanjaya sekuriti|sc exposure|malaysia)\b/i.test(combined);
  const isDefault = DEFAULT_TRACKED_IPOS.some(d => d.id === item.id || d.stockName.toLowerCase() === stockName.toLowerCase());
  const hasMalaysianIdentifiers = (item.mitiRn !== undefined && item.mitiRn !== null) ||
                                  (item.maybankPublicRn !== undefined && item.maybankPublicRn !== null) ||
                                  (typeof item.mitiShareM === 'number' && item.mitiShareM > 0);

  return hasBerhad || hasBursaReference || isDefault || hasMalaysianIdentifiers;
}

/**
 * Loads tracked IPOs from localStorage, strictly removing any non-Malaysian company,
 * and falling back to default IPOs from spreadsheet.
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
      // Strictly remove any IPO that is not a Malaysian company to be listed on Bursa Malaysia
      const malaysianOnly = parsed.filter(item => isMalaysianIpo(item));
      const processed = malaysianOnly.map(item => {
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

      // If non-Malaysian items were purged, immediately persist the clean list
      if (processed.length !== parsed.length) {
        saveStoredTrackedIpos(processed);
      }

      return processed.length > 0 ? processed : DEFAULT_TRACKED_IPOS;
    }
  } catch (err) {
    console.warn('[IpoStorage] Error reading stored IPOs:', err);
  }
  return DEFAULT_TRACKED_IPOS;
}

/**
 * Saves tracked IPOs to localStorage, strictly enforcing Malaysian companies only
 */
export function saveStoredTrackedIpos(ipos: TrackedIpoItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const malaysianOnly = ipos.filter(item => isMalaysianIpo(item));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(malaysianOnly));
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
