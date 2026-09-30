import { ProspectusDossier } from '../types';
import { stratusGlobalProspectus, scaSolutionsProspectus, sampleSaaSProspectus } from '../data/defaultProspectus';

const DOSSIERS_STORAGE_KEY = 'ipo_evaluator_dossiers_v2';
const ACTIVE_ID_STORAGE_KEY = 'ipo_evaluator_active_dossier_id_v2';

export const DEFAULT_DOSSIERS: ProspectusDossier[] = [
  stratusGlobalProspectus,
  scaSolutionsProspectus,
  sampleSaaSProspectus,
];

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
  try {
    const raw = localStorage.getItem(DOSSIERS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_DOSSIERS;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_DOSSIERS;
    }

    // Ensure all default sample dossiers exist in the list
    const defaultIds = new Set(DEFAULT_DOSSIERS.map(d => d.id));
    const customDossiers = parsed.filter(d => !defaultIds.has(d.id));

    // Combine custom dossiers followed by default dossiers
    const merged = [...customDossiers, ...DEFAULT_DOSSIERS];
    return merged;
  } catch (err) {
    console.warn('[DossierStorage] Failed to read from localStorage, using defaults:', err);
    return DEFAULT_DOSSIERS;
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
 * Deletes a custom dossier by ID from localStorage.
 */
export function deleteStoredDossier(id: string, currentList: ProspectusDossier[]): ProspectusDossier[] {
  // Prevent deleting default baseline dossiers
  const defaultIds = new Set(DEFAULT_DOSSIERS.map(d => d.id));
  if (defaultIds.has(id)) {
    return currentList;
  }

  const updated = currentList.filter(d => d.id !== id);
  saveStoredDossiers(updated);
  return updated;
}

/**
 * Clears custom dossiers and resets back to system defaults.
 */
export function resetDossiersToDefaults(): ProspectusDossier[] {
  try {
    localStorage.removeItem(DOSSIERS_STORAGE_KEY);
  } catch {
    // Ignore
  }
  return DEFAULT_DOSSIERS;
}
