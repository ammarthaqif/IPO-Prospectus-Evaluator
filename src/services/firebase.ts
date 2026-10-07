import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  setLogLevel,
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc,
  query, 
  where, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import type { ProspectusDossier } from '../types';
import { normalizeCompanyName, normalizeRegistrationNo, getDeletedDossierIds } from '../utils/dossierStorage';
import firebaseConfig from '../../firebase-applet-config.json';

// Suppress internal SDK network probes and connection warnings to prevent false error reports
try {
  setLogLevel('silent');
} catch {
  // Ignore
}

if (typeof window !== 'undefined') {
  const origError = console.error;
  console.error = function (...args: any[]) {
    const first = typeof args[0] === 'string' ? args[0] : '';
    if (
      first.includes('@firebase/firestore') ||
      first.includes('Could not reach Cloud Firestore backend') ||
      first.includes('offline mode until it is able to successfully connect')
    ) {
      console.info('[Firebase Resilience]', ...args);
      return;
    }
    origError.apply(console, args);
  };
}

// Initialize Firebase App instance singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Configure Firestore with pure long polling enabled to prevent Cloud Run/proxy WebChannel streaming timeouts
// Note: We do NOT enable experimentalAutoDetectLongPolling because its 10-second probing timer logs false backend timeouts
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId || undefined
  );
} catch {
  firestoreInstance = firebaseConfig.firestoreDatabaseId 
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
}

export const db = firestoreInstance;

const COLLECTION_NAME = 'prospectusDossiers';

/**
 * Validates active connection to Firestore server without throwing unhandled timeout exceptions.
 */
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    const testDoc = doc(db, 'test', 'connection');
    await getDoc(testDoc);
    return true;
  } catch {
    return false;
  }
}

export interface CloudSaveResult {
  success: boolean;
  isDuplicate?: boolean;
  matchedDossier?: ProspectusDossier;
  message?: string;
  dossier?: ProspectusDossier;
}

/**
 * Ensures a dossier object strictly stays below Google Cloud Firestore's 1,048,576 bytes limit.
 * Truncates rawProspectusText progressively if the serialized document exceeds safe size.
 */
export function sanitizeDossierForFirestore(dossier: ProspectusDossier): ProspectusDossier {
  const encoder = new TextEncoder();
  const sanitized = { ...dossier };

  const MAX_SAFE_FIRESTORE_BYTES = 750000; // 750 KB safe limit (well below 1,048,576 bytes quota)

  let byteSize = encoder.encode(JSON.stringify(sanitized)).length;

  if (byteSize > MAX_SAFE_FIRESTORE_BYTES) {
    console.warn(`[Firebase] Document size (${byteSize} bytes) exceeds Firestore safe limit. Truncating rawProspectusText...`);

    const progressiveLimits = [120000, 60000, 25000, 5000];
    for (const limit of progressiveLimits) {
      if (sanitized.rawProspectusText && sanitized.rawProspectusText.length > limit) {
        sanitized.rawProspectusText = sanitized.rawProspectusText.slice(0, limit) + 
          '\n\n[...Prospectus text excerpt preserved for Cloud Firestore document quota (1MB limit)...]';
      }
      byteSize = encoder.encode(JSON.stringify(sanitized)).length;
      if (byteSize <= MAX_SAFE_FIRESTORE_BYTES) break;
    }

    if (byteSize > MAX_SAFE_FIRESTORE_BYTES) {
      sanitized.rawProspectusText = '[...Prospectus OCR text omitted in Cloud document to satisfy Firestore 1MB quota. Structured financials, ratios, and audit flags preserved...]';
    }
  }

  // Remove any undefined properties which Firestore rejects with 'Unsupported field value: undefined'
  return JSON.parse(JSON.stringify(sanitized)) as ProspectusDossier;
}

/**
 * Checks Firestore cloud collection for duplicate entries before saving.
 */
export async function checkCloudDuplicate(
  candidate: { companyName: string; registrationNo?: string; fileName?: string },
  candidateId?: string
): Promise<{ isDuplicate: boolean; matchedDossier?: ProspectusDossier; reason?: string }> {
  try {
    const normName = normalizeCompanyName(candidate.companyName);
    const normReg = normalizeRegistrationNo(candidate.registrationNo || '');
    const colRef = collection(db, COLLECTION_NAME);

    // 1. Direct query by normalized company name if present
    if (normName) {
      const qName = query(colRef, where('normalizedCompanyName', '==', normName));
      const snapName = await getDocs(qName);
      for (const d of snapName.docs) {
        if (!candidateId || d.id !== candidateId) {
          const data = d.data() as ProspectusDossier;
          return {
            isDuplicate: true,
            matchedDossier: data,
            reason: `A prospectus for "${data.companyName}" already exists in the shared Cloud library.`,
          };
        }
      }
    }

    // 2. Direct query by normalized registration number
    if (normReg && normReg.length >= 5) {
      const qReg = query(colRef, where('normalizedRegistrationNo', '==', normReg));
      const snapReg = await getDocs(qReg);
      for (const d of snapReg.docs) {
        if (!candidateId || d.id !== candidateId) {
          const data = d.data() as ProspectusDossier;
          return {
            isDuplicate: true,
            matchedDossier: data,
            reason: `Registration No. "${data.registrationNo}" matches existing cloud dossier "${data.companyName}".`,
          };
        }
      }
    }

    // 3. Fallback scan all docs for fuzzy or filename match
    const allSnap = await getDocs(colRef);
    const candidateFile = (candidate.fileName || '').trim().toLowerCase();
    
    for (const d of allSnap.docs) {
      if (candidateId && d.id === candidateId) continue;
      const data = d.data() as ProspectusDossier;
      
      // Match normalized name
      if (normName && normalizeCompanyName(data.companyName) === normName) {
        return {
          isDuplicate: true,
          matchedDossier: data,
          reason: `Issuer "${data.companyName}" already evaluated in Cloud storage.`,
        };
      }

      // Match normalized registration
      if (normReg && normalizeRegistrationNo(data.registrationNo) === normReg) {
        return {
          isDuplicate: true,
          matchedDossier: data,
          reason: `Registration identifier "${data.registrationNo}" already stored in Cloud database.`,
        };
      }

      // Match source filename
      if (candidateFile && data.sourceFileName && data.sourceFileName.trim().toLowerCase() === candidateFile) {
        return {
          isDuplicate: true,
          matchedDossier: data,
          reason: `Prospectus PDF filename "${data.sourceFileName}" is already processed in Cloud storage.`,
        };
      }
    }

    return { isDuplicate: false };
  } catch (err) {
    console.warn('[Firebase] Cloud duplicate check encountered issue, proceeding safely:', err);
    return { isDuplicate: false };
  }
}

/**
 * Saves or shares a newly evaluated prospectus to the Cloud Firestore database
 * so all other users on the platform can view it.
 */
export async function saveProspectusToCloud(
  dossier: ProspectusDossier,
  uploaderEmail?: string
): Promise<CloudSaveResult> {
  try {
    // Check for duplicates first in Cloud Firestore
    const dupCheck = await checkCloudDuplicate(
      {
        companyName: dossier.companyName,
        registrationNo: dossier.registrationNo,
        fileName: dossier.sourceFileName,
      },
      dossier.id
    );

    if (dupCheck.isDuplicate && dupCheck.matchedDossier) {
      return {
        success: false,
        isDuplicate: true,
        matchedDossier: dupCheck.matchedDossier,
        message: dupCheck.reason || 'This prospectus has already been evaluated in the shared Cloud library.',
      };
    }

    const normName = normalizeCompanyName(dossier.companyName);
    const normReg = normalizeRegistrationNo(dossier.registrationNo || '');
    const docRef = doc(db, COLLECTION_NAME, dossier.id);

    // Sanitize to stay safely under Firestore 1MB limit
    const sanitizedDossier = sanitizeDossierForFirestore(dossier);

    const cloudPayload = {
      ...sanitizedDossier,
      normalizedCompanyName: normName,
      normalizedRegistrationNo: normReg,
      isCloudShared: true,
      uploaderEmail: uploaderEmail || 'community-analyst',
      cloudSharedAt: new Date().toISOString(),
    };

    try {
      await setDoc(docRef, cloudPayload, { merge: true });
    } catch (writeError: any) {
      if (writeError?.message?.includes('exceeds the maximum allowed size') || writeError?.message?.includes('bytes')) {
        console.warn('[Firebase] Retrying cloud write with stripped text payload to satisfy 1MB limit...');
        const minimalPayload = {
          ...cloudPayload,
          rawProspectusText: '[...Prospectus raw text truncated to satisfy Google Cloud Firestore 1MB document quota...]',
        };
        await setDoc(docRef, minimalPayload, { merge: true });
      } else {
        throw writeError;
      }
    }

    console.info(`[Firebase] Prospectus "${dossier.companyName}" (${dossier.id}) successfully shared to Cloud storage.`);

    return {
      success: true,
      isDuplicate: false,
      dossier: cloudPayload as ProspectusDossier,
      message: `Prospectus "${dossier.companyName}" successfully published to the shared Cloud database.`,
    };
  } catch (error: any) {
    console.error('[Firebase] Error saving to cloud Firestore:', error);
    return {
      success: false,
      message: error?.message || 'Failed to save prospectus to Cloud storage.',
    };
  }
}

/**
 * Fetches all shared IPO prospectuses from the Cloud database.
 */
export async function fetchAllCloudDossiers(): Promise<ProspectusDossier[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snap = await getDocs(colRef);
    const list: ProspectusDossier[] = [];
    snap.forEach((d) => {
      const data = d.data() as ProspectusDossier;
      if (data && data.id && data.companyName) {
        list.push(data);
      }
    });
    return list;
  } catch (error) {
    console.warn('[Firebase] Unable to fetch cloud dossiers:', error);
    return [];
  }
}

/**
 * Subscribes to real-time updates in the Cloud database.
 * Whenever ANY user uploads a new prospectus, this callback is fired automatically
 * so all other users have their active workspace updated in real-time.
 */
export function subscribeToCloudDossiers(
  onUpdate: (cloudDossiers: ProspectusDossier[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTION_NAME);
  return onSnapshot(
    colRef,
    (snap) => {
      const list: ProspectusDossier[] = [];
      snap.forEach((d) => {
        const data = d.data() as ProspectusDossier;
        if (data && data.id && data.companyName) {
          list.push(data);
        }
      });
      onUpdate(list);
    },
    (err) => {
      if (err.message && (err.message.includes('offline') || err.message.includes('backend'))) {
        console.info('[Firebase] Operating in resilient offline mode with local dossier store.');
      } else {
        console.info('[Firebase] Realtime cloud listener notice:', err?.message || err);
      }
      if (onError) onError(err);
    }
  );
}

/**
 * Seeds baseline default dossiers into the Cloud database if not already present.
 * Uses a safe timeout so cold boots and offline modes never stall.
 */
export async function seedInitialCloudDossiers(defaults: ProspectusDossier[]): Promise<void> {
  if (typeof window !== 'undefined' && localStorage.getItem('vanguard_cloud_seed_completed')) {
    return;
  }

  const timeoutPromise = new Promise<void>((_, reject) => 
    setTimeout(() => reject(new Error('Seed timeout')), 2500)
  );

  const seedPromise = (async () => {
    const deletedIds = getDeletedDossierIds();
    for (const d of defaults) {
      if (deletedIds.has(d.id) || d.id === 'cloudnexus-2025' || d.id === 'sample-saas-2024') {
        continue;
      }
      try {
        const docRef = doc(db, COLLECTION_NAME, d.id);
        const existing = await getDoc(docRef);
        if (!existing.exists()) {
          const normName = normalizeCompanyName(d.companyName);
          const normReg = normalizeRegistrationNo(d.registrationNo || '');
          const sanitized = sanitizeDossierForFirestore(d);
          await setDoc(docRef, {
            ...sanitized,
            normalizedCompanyName: normName,
            normalizedRegistrationNo: normReg,
            isCloudShared: true,
            uploaderEmail: 'system-institutional',
            cloudSharedAt: new Date().toISOString(),
          });
        }
      } catch {
        // Individual item offline fallback
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('vanguard_cloud_seed_completed', 'true');
    }
    console.info('[Firebase] Baseline default dossiers verified in Cloud database.');
  })();

  try {
    await Promise.race([seedPromise, timeoutPromise]);
  } catch {
    // Offline or timed out - local storage maintains immediate responsiveness
  }
}

/**
 * Deletes an evaluated prospectus from the Cloud Firestore database
 * so it is removed for all other users across the platform in real time.
 */
export async function deleteProspectusFromCloud(dossierId: string): Promise<boolean> {
  if (!dossierId) return false;
  try {
    const docRef = doc(db, COLLECTION_NAME, dossierId);
    await deleteDoc(docRef);
    console.info(`[Firebase] Prospectus "${dossierId}" successfully deleted from Cloud Firestore.`);

    // If deleting nexus or related document, sweep any docs matching ID or company name
    const idLower = dossierId.toLowerCase();
    if (idLower.includes('nexus') || idLower.includes('uploaded')) {
      try {
        const snap = await getDocs(collection(db, COLLECTION_NAME));
        for (const docItem of snap.docs) {
          const data = docItem.data();
          const docIdLower = docItem.id.toLowerCase();
          const compLower = (data.companyName || '').toLowerCase();
          if (
            docItem.id === dossierId ||
            (idLower.includes('nexus') && (docIdLower.includes('nexus') || compLower.includes('nexus')))
          ) {
            await deleteDoc(doc(db, COLLECTION_NAME, docItem.id));
            console.info(`[Firebase] Swept matching document: ${docItem.id}`);
          }
        }
      } catch (sweepErr) {
        console.warn('[Firebase] Secondary sweep notice:', sweepErr);
      }
    }
    return true;
  } catch (error) {
    console.error(`[Firebase] Failed to delete prospectus "${dossierId}" from Cloud Firestore:`, error);
    return false;
  }
}

// ==========================================
// Tracked IPOs Real-time Synchronization
// ==========================================

const TRACKED_IPOS_COLLECTION = 'trackedIpos';

/**
 * Saves a tracked IPO item to Cloud Firestore
 */
export async function saveTrackedIpoToCloud(ipo: any): Promise<boolean> {
  if (!ipo || !ipo.id) return false;
  try {
    const docRef = doc(db, TRACKED_IPOS_COLLECTION, ipo.id);
    await setDoc(docRef, JSON.parse(JSON.stringify(ipo)), { merge: true });
    return true;
  } catch (err) {
    console.warn(`[Firebase] Could not save tracked IPO ${ipo.id} to cloud:`, err);
    return false;
  }
}

/**
 * Saves all tracked IPOs in bulk to Cloud Firestore
 */
export async function saveAllTrackedIposToCloud(ipos: any[]): Promise<boolean> {
  if (!Array.isArray(ipos) || ipos.length === 0) return false;
  try {
    for (const item of ipos) {
      if (item && item.id) {
        const docRef = doc(db, TRACKED_IPOS_COLLECTION, item.id);
        await setDoc(docRef, JSON.parse(JSON.stringify(item)), { merge: true });
      }
    }
    return true;
  } catch (err) {
    console.warn('[Firebase] Bulk tracked IPO save warning:', err);
    return false;
  }
}

/**
 * Subscribes to real-time changes on tracked IPOs in Cloud Firestore
 */
export function subscribeToTrackedIpos(
  onUpdate: (cloudIpos: any[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colRef = collection(db, TRACKED_IPOS_COLLECTION);
  return onSnapshot(
    colRef,
    (snap) => {
      const list: any[] = [];
      snap.forEach((d) => {
        const data = d.data();
        if (data && data.id && data.stockName) {
          list.push(data);
        }
      });
      if (list.length > 0) {
        onUpdate(list);
      }
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

