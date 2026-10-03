import { ProspectusDossier, ListingPerformance } from '../types';
import { 
  goldLiProspectus,
  stratusGlobalProspectus, 
  scaSolutionsProspectus 
} from '../data/defaultProspectus';
import { 
  ensureIpoValuationAndShariah, 
  computeListingMetrics 
} from './ipoPricingAndShariah';

const DOSSIERS_STORAGE_KEY = 'ipo_evaluator_dossiers_v2';
const ACTIVE_ID_STORAGE_KEY = 'ipo_evaluator_active_dossier_id_v2';
const DELETED_IDS_STORAGE_KEY = 'ipo_evaluator_deleted_dossier_ids_v2';

// Core verified Malaysian IPO prospectus dossiers
export const DEFAULT_DOSSIERS: ProspectusDossier[] = [
  goldLiProspectus,
  stratusGlobalProspectus,
  scaSolutionsProspectus,
];

export const BASELINE_DOSSIER_IDS = new Set(DEFAULT_DOSSIERS.map(d => d.id));

/**
 * Retrieves the set of permanently deleted dossier IDs from localStorage
 * to prevent background cloud/server sync from resurrecting deleted dossiers.
 */
export function getDeletedDossierIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_IDS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const set = new Set<string>(Array.isArray(parsed) ? parsed : []);
    // Always treat legacy test mockup as deleted
    set.add('cloudnexus-2025');
    set.add('sample-saas-2024');
    return set;
  } catch {
    return new Set(['cloudnexus-2025', 'sample-saas-2024']);
  }
}

/**
 * Permanently registers a dossier ID as deleted.
 */
export function addDeletedDossierId(id: string): void {
  try {
    const set = getDeletedDossierIds();
    set.add(id);
    localStorage.setItem(DELETED_IDS_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.warn('[DossierStorage] Failed to persist deleted dossier ID:', err);
  }
}

/**
 * Clears the tombstone deleted list when user explicitly resets to defaults.
 */
export function clearDeletedDossierIds(): void {
  try {
    localStorage.removeItem(DELETED_IDS_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Normalizes a company name for fuzzy duplicate comparison:
 * Removes corporate legal suffixes (Sdn Bhd, Berhad, Corp, Inc, Ltd, etc.),
 * punctuation, and excessive whitespace.
 */
export function normalizeCompanyName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\b(sdn\s+bhd|bhd|berhad|incorporated|inc|corporation|corp|limited|ltd|llc|plc|group|holdings|holding|co|company)\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Normalizes a registration number or ticker symbol:
 * Removes hyphens, spaces, and punctuation.
 */
export function normalizeRegistrationNo(reg: string): string {
  if (!reg) return '';
  return reg.toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchedDossier?: ProspectusDossier;
  reason?: string;
  field?: 'name' | 'registration' | 'filename' | 'content';
}

/**
 * Audits a candidate prospectus against existing dossiers to prevent duplicate evaluations.
 */
export function checkDuplicateProspectus(
  candidate: {
    companyName?: string;
    registrationNo?: string;
    fileName?: string;
    textSnippet?: string;
  },
  existingDossiers: ProspectusDossier[]
): DuplicateCheckResult {
  if (!existingDossiers || existingDossiers.length === 0) {
    return { isDuplicate: false };
  }

  const candNormName = normalizeCompanyName(candidate.companyName || '');
  const candNormReg = normalizeRegistrationNo(candidate.registrationNo || '');
  const candFile = (candidate.fileName || '').toLowerCase().trim();
  const textLower = (candidate.textSnippet || '').toLowerCase();

  for (const existing of existingDossiers) {
    const existNormName = normalizeCompanyName(existing.companyName);
    const existNormReg = normalizeRegistrationNo(existing.registrationNo);

    // 1. Check exact normalized company name match
    if (candNormName && existNormName && candNormName === existNormName) {
      return {
        isDuplicate: true,
        matchedDossier: existing,
        field: 'name',
        reason: `Company name "${existing.companyName}" is already evaluated and registered in the system.`,
      };
    }

    // 2. Check substantial substring match for company names (e.g. "Stratus Global" vs "Stratus Global Holdings")
    if (
      candNormName.length >= 6 &&
      existNormName.length >= 6 &&
      (candNormName.includes(existNormName) || existNormName.includes(candNormName))
    ) {
      return {
        isDuplicate: true,
        matchedDossier: existing,
        field: 'name',
        reason: `Company name matches existing prospectus dossier "${existing.companyName}".`,
      };
    }

    // 3. Check registration number match if available and meaningful (avoid generic placeholder strings)
    if (
      candNormReg &&
      existNormReg &&
      candNormReg.length >= 5 &&
      existNormReg !== 'SEC/BURSA' &&
      candNormReg === existNormReg
    ) {
      return {
        isDuplicate: true,
        matchedDossier: existing,
        field: 'registration',
        reason: `Registration No. / Ticker "${existing.registrationNo}" matches existing dossier for "${existing.companyName}".`,
      };
    }

    // 4. Check filename match (if user uploads the exact same file)
    if (candFile && candFile.endsWith('.pdf')) {
      const existCleanId = existing.id.toLowerCase().replace(/[-_]/g, '');
      const candCleanFile = candFile.replace(/\.pdf$/, '').replace(/[-_]/g, '');
      if (candCleanFile.length > 5 && existCleanId.includes(candCleanFile)) {
        return {
          isDuplicate: true,
          matchedDossier: existing,
          field: 'filename',
          reason: `Document filename matches previously evaluated prospectus for "${existing.companyName}".`,
        };
      }
    }

    // 5. Check text content for existing registration numbers or unique entity identifiers
    if (textLower.length > 50 && existNormReg.length >= 6) {
      const regPattern = existing.registrationNo.toLowerCase().replace(/[-_]/g, '');
      const textClean = textLower.replace(/[-_\s]/g, '');
      if (textClean.includes(regPattern) && regPattern.length >= 6) {
        return {
          isDuplicate: true,
          matchedDossier: existing,
          field: 'content',
          reason: `Document content contains Registration No. "${existing.registrationNo}" of existing dossier "${existing.companyName}".`,
        };
      }
    }
  }

  return { isDuplicate: false };
}

/**
 * Loads all dossiers from localStorage, merging with defaults.
 * Survives page reloads and Vercel serverless page refreshes.
 */
export function loadStoredDossiers(): ProspectusDossier[] {
  const deletedIds = getDeletedDossierIds();

  try {
    const raw = localStorage.getItem(DOSSIERS_STORAGE_KEY);
    const activeDefaults = DEFAULT_DOSSIERS.filter(d => !deletedIds.has(d.id));

    if (!raw) {
      return activeDefaults.length > 0 ? activeDefaults : DEFAULT_DOSSIERS;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return activeDefaults.length > 0 ? activeDefaults : DEFAULT_DOSSIERS;
    }

    // Ensure baseline defaults exist unless deleted
    const defaultIds = new Set(DEFAULT_DOSSIERS.map(d => d.id));
    const customDossiers = parsed.filter(d => !defaultIds.has(d.id) && !deletedIds.has(d.id));

    // Combine custom dossiers followed by non-deleted defaults
    const merged = [...customDossiers, ...activeDefaults];
    const normalized = (merged.length > 0 ? merged : [stratusGlobalProspectus]).map(ensureIpoValuationAndShariah);
    return normalized;
  } catch (err) {
    console.warn('[DossierStorage] Failed to read from localStorage, using defaults:', err);
    return DEFAULT_DOSSIERS.map(ensureIpoValuationAndShariah);
  }
}

/**
 * Saves dossiers to localStorage with quota protection and error handling.
 */
export function saveStoredDossiers(dossiers: ProspectusDossier[]): boolean {
  try {
    // Sanitize large rawProspectusText if necessary to respect browser storage quotas (5MB)
    const sanitized = dossiers.map(d => {
      if (d.rawProspectusText && d.rawProspectusText.length > 100000) {
        return {
          ...d,
          rawProspectusText: d.rawProspectusText.slice(0, 100000) + '\n\n[...Text truncated for local persistence cache...]',
        };
      }
      return d;
    });

    localStorage.setItem(DOSSIERS_STORAGE_KEY, JSON.stringify(sanitized));
    return true;
  } catch (err) {
    console.warn('[DossierStorage] Failed to save to localStorage:', err);
    // Attempt fallback with stripped text
    try {
      const ultraCompact = dossiers.map(d => ({
        ...d,
        rawProspectusText: d.rawProspectusText ? d.rawProspectusText.slice(0, 20000) : '',
      }));
      localStorage.setItem(DOSSIERS_STORAGE_KEY, JSON.stringify(ultraCompact));
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Retrieves the last active dossier ID from localStorage.
 */
export function loadActiveDossierId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_ID_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Stores the active dossier ID to localStorage.
 */
export function saveActiveDossierId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_ID_STORAGE_KEY, id);
  } catch {
    // Ignore quota issues for single small string
  }
}

/**
 * Deletes a dossier by ID from localStorage and records it as deleted.
 */
export function deleteStoredDossier(id: string, currentList: ProspectusDossier[]): ProspectusDossier[] {
  if (!id) return currentList;

  // Record into tombstone registry so it is never re-added by background sync
  addDeletedDossierId(id);

  const updated = currentList.filter(d => d.id !== id);
  // Ensure at least one dossier remains
  const finalized = updated.length > 0 ? updated : [stratusGlobalProspectus];
  saveStoredDossiers(finalized);
  return finalized;
}

/**
 * Clears custom dossiers and resets back to system defaults.
 */
export function resetDossiersToDefaults(): ProspectusDossier[] {
  try {
    localStorage.removeItem(DOSSIERS_STORAGE_KEY);
    clearDeletedDossierIds();
  } catch {
    // Ignore
  }
  return DEFAULT_DOSSIERS.map(ensureIpoValuationAndShariah);
}

/**
 * Updates the IPO issue price, listing date, open, close, and intraday prices for a specific dossier.
 * Recomputes gain metrics and persists to localStorage.
 */
export function updateStoredDossierListingPerformance(
  id: string,
  updates: Partial<ListingPerformance>,
  currentList: ProspectusDossier[]
): { updatedList: ProspectusDossier[]; updatedDossier: ProspectusDossier | null } {
  let target: ProspectusDossier | null = null;

  const updatedList = currentList.map((d) => {
    if (d.id !== id) return d;

    const currentPerf = d.listingPerformance || {
      listingStatus: 'UPCOMING',
      ipoPrice: updates.ipoPrice || d.ipoPrice || 0.35,
    };

    const newStatus = updates.listingStatus || currentPerf.listingStatus || 'UPCOMING';
    const isUpcoming = newStatus === 'UPCOMING';

    const newIpoPrice = updates.ipoPrice !== undefined ? updates.ipoPrice : currentPerf.ipoPrice;
    const newOpen = isUpcoming ? undefined : (updates.openingPrice !== undefined ? updates.openingPrice : currentPerf.openingPrice);
    const newClose = isUpcoming ? undefined : (updates.closingPrice !== undefined ? updates.closingPrice : currentPerf.closingPrice);
    const newHigh = isUpcoming ? undefined : (updates.day1High !== undefined ? updates.day1High : currentPerf.day1High);
    const newLow = isUpcoming ? undefined : (updates.day1Low !== undefined ? updates.day1Low : currentPerf.day1Low);
    const newVolume = isUpcoming ? undefined : (updates.day1Volume !== undefined ? updates.day1Volume : currentPerf.day1Volume);

    const deltas = isUpcoming ? {} : computeListingMetrics(newIpoPrice, newOpen, newClose, newHigh, newLow);

    let finalListingDate = updates.listingDate || currentPerf.listingDate;
    if (isUpcoming) {
      if (!finalListingDate || finalListingDate.trim() === '' || finalListingDate === '28 March 2026') {
        finalListingDate = 'Not Yet Listed (Pre-Listing Phase)';
      } else if (!finalListingDate.toLowerCase().includes('not yet') && !finalListingDate.toLowerCase().includes('target') && !finalListingDate.toLowerCase().includes('pending')) {
        finalListingDate = `Not Yet Listed (Target: ${finalListingDate})`;
      }
    }

    const mergedPerf: ListingPerformance = {
      ...currentPerf,
      ...updates,
      listingStatus: newStatus,
      listingDate: finalListingDate,
      ipoPrice: newIpoPrice,
      openingPrice: newOpen,
      closingPrice: newClose,
      day1High: newHigh,
      day1Low: newLow,
      day1Volume: newVolume,
      firstDayGainPct: deltas.firstDayGainPct,
      firstDayOpeningGainPct: deltas.firstDayOpeningGainPct,
      intradaySpreadPct: deltas.intradaySpreadPct,
      updatedAt: new Date().toISOString(),
    };

    const updatedDossier: ProspectusDossier = {
      ...d,
      ipoPrice: newIpoPrice,
      listingPerformance: mergedPerf,
    };

    target = updatedDossier;
    return updatedDossier;
  });

  saveStoredDossiers(updatedList);
  return { updatedList, updatedDossier: target };
}

