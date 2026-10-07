import { TrackedIpoItem } from '../types';
import { calculateIpoConsensus } from '../services/ipoStorage';

export interface SectorDefinition {
  id: string;
  name: string;
  shortName: string;
  color: string;
  accentBg: string;
  borderColor: string;
  benchmarkPE: number;
  description: string;
}

export const BURSA_SECTORS: Record<string, SectorDefinition> = {
  technology: {
    id: 'technology',
    name: 'Technology & Semiconductors',
    shortName: 'Technology',
    color: '#6366f1', // Indigo
    accentBg: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    benchmarkPE: 24.5,
    description: 'Semiconductors, enterprise cloud software, cybersecurity & digital platforms',
  },
  renewable: {
    id: 'renewable',
    name: 'Renewable Energy & Cleantech',
    shortName: 'Renewable Energy',
    color: '#10b981', // Emerald
    accentBg: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    benchmarkPE: 18.0,
    description: 'Solar EPCC, environmental waste engineering & green infrastructure',
  },
  industrial: {
    id: 'industrial',
    name: 'Industrial Products & Engineering',
    shortName: 'Industrial',
    color: '#0284c7', // Sky
    accentBg: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    benchmarkPE: 14.5,
    description: 'Precision engineering, security seals, industrial equipment & water piping',
  },
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare & Medical Devices',
    shortName: 'Healthcare',
    color: '#ec4899', // Pink
    accentBg: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    benchmarkPE: 21.0,
    description: 'Medical diagnostics, single-use consumables & clinical technologies',
  },
  consumer: {
    id: 'consumer',
    name: 'Consumer Products & Food Export',
    shortName: 'Consumer',
    color: '#f59e0b', // Amber
    accentBg: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    benchmarkPE: 16.0,
    description: 'Halal frozen food, bakery ingredients, jewelry retail & FMCG distribution',
  },
  logistics: {
    id: 'logistics',
    name: 'Transportation & Logistics',
    shortName: 'Logistics',
    color: '#0d9488', // Teal
    accentBg: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30',
    benchmarkPE: 15.0,
    description: 'Bonded container terminals, freight forwarding & multi-modal supply chains',
  },
  construction: {
    id: 'construction',
    name: 'Construction & Infrastructure',
    shortName: 'Construction',
    color: '#8b5cf6', // Violet
    accentBg: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    benchmarkPE: 13.5,
    description: 'Highway corridors, bridges, civil engineering & earthworks',
  },
  agrotech: {
    id: 'agrotech',
    name: 'Agrotech & Sustainable Biomass',
    shortName: 'Agrotech',
    color: '#84cc16', // Lime
    accentBg: 'bg-lime-500/10',
    borderColor: 'border-lime-500/30',
    benchmarkPE: 12.0,
    description: 'Circular economy bio-fertilizers, palm biomass tech & precision agriculture',
  },
};

/**
 * Intelligent mapper from IPO record to canonical Bursa Malaysia sector
 */
export function getIpoSector(ipo: TrackedIpoItem): SectorDefinition {
  if (ipo.sector && BURSA_SECTORS[ipo.sector.toLowerCase()]) {
    return BURSA_SECTORS[ipo.sector.toLowerCase()];
  }

  const name = (ipo.stockName + ' ' + (ipo.fullName || '') + ' ' + (ipo.notes || '')).toLowerCase();

  if (name.includes('solar') || name.includes('cleantech') || name.includes('ecosys') || name.includes('egh') || name.includes('pioneer') || name.includes('green energy')) {
    return BURSA_SECTORS.renewable;
  }
  if (name.includes('medical') || name.includes('health') || name.includes('innomed') || name.includes('diagnostic') || name.includes('pharma') || name.includes('lifecare')) {
    return BURSA_SECTORS.healthcare;
  }
  if (name.includes('logistic') || name.includes('freight') || name.includes('alphalog') || name.includes('port') || name.includes('transport') || name.includes('shipping')) {
    return BURSA_SECTORS.logistics;
  }
  if (name.includes('food') || name.includes('bakery') || name.includes('butterfield') || name.includes('apexfood') || name.includes('gold li') || name.includes('supreme') || name.includes('consumer') || name.includes('fmcg') || name.includes('beverage')) {
    return BURSA_SECTORS.consumer;
  }
  if (name.includes('construct') || name.includes('azam') || name.includes('highway') || name.includes('infrastructure') || name.includes('builder') || name.includes('civil')) {
    return BURSA_SECTORS.construction;
  }
  if (name.includes('agro') || name.includes('biogreen') || name.includes('biomass') || name.includes('fertilizer') || name.includes('plantation')) {
    return BURSA_SECTORS.agrotech;
  }
  if (name.includes('cloud') || name.includes('tech') || name.includes('software') || name.includes('semi') || name.includes('crest') || name.includes('vortex') || name.includes('cyber') || name.includes('evocom') || name.includes('redplanet') || name.includes('daythree') || name.includes('stratus') || name.includes('saas') || name.includes('digital') || name.includes('data')) {
    return BURSA_SECTORS.technology;
  }

  // Industrial fallback
  return BURSA_SECTORS.industrial;
}

/**
 * Calculates standardized valuation metrics for an IPO
 */
export function getIpoEnrichedMetrics(ipo: TrackedIpoItem) {
  const sector = getIpoSector(ipo);
  const consensus = calculateIpoConsensus(ipo);

  // Derive estimated or realistic P/E multiple based on valuation notes or sector averages
  let pe = ipo.peMultiple;
  if (!pe) {
    if (ipo.notes) {
      const match = ipo.notes.match(/([0-9]+(?:\.[0-9]+)?)\s*x\s*(?:pe|p\/e|earnings)/i);
      if (match) pe = parseFloat(match[1]);
    }
    if (!pe) {
      // Check research house basis notes
      if (ipo.fairValueNotes) {
        for (const note of Object.values(ipo.fairValueNotes)) {
          const match = (note?.citation || '' + (note?.basis || '')).match(/([0-9]+(?:\.[0-9]+)?)\s*x\s*(?:pe|p\/e|forward|eps)/i);
          if (match) {
            pe = parseFloat(match[1]);
            break;
          }
        }
      }
    }
  }

  if (!pe) {
    // Sector-aligned baseline with slight variation per offer price
    const base = sector.benchmarkPE;
    const variation = ((ipo.price * 10) % 5) - 2;
    pe = Number((base + variation).toFixed(1));
  }

  // Issue size: public issue shares * offer price
  const issueSizeRM = Math.round(ipo.publicShareM * ipo.price);

  return {
    sector,
    consensus,
    peMultiple: pe,
    issueSizeRM,
    marketCapRM: ipo.marketCapRMJuta,
    upsidePct: consensus.upsidePct ?? 0,
    hasConsensus: consensus.upsidePct !== null,
  };
}
