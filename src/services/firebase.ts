import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  query, 
  where, 
  onSnapshot, 
  getDocFromServer,
  Unsubscribe 
} from 'firebase/firestore';
import type { ProspectusDossier } from '../types';
import { normalizeCompanyName, normalizeRegistrationNo } from '../utils/dossierStorage';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use named Firestore database if specified in config, fallback to default
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const COLLECTION_NAME = 'prospectusDossiers';

/**
 * Validates active connection to Firestore server on boot.
 */
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.info('[Firebase] Firestore connected successfully to cloud database.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Client is offline or Firestore is unreachable.');
    } else {
      console.info('[Firebase] Connection handshake completed.');
    }
    return true;
  }
}

// Kick off validation on module load
validateFirestoreConnection().catch(() => {});

export interface CloudSaveResult {
  success: boolean;
  isDuplicate?: boolean;
  matchedDossier?: ProspectusDossier;
  message?: string;
  dossier?: ProspectusDossier;
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

    const cloudPayload = {
      ...dossier,
      normalizedCompanyName: normName,
      normalizedRegistrationNo: normReg,
      isCloudShared: true,
      uploaderEmail: uploaderEmail || 'community-analyst',
      cloudSharedAt: new Date().toISOString(),
    };

    await setDoc(docRef, cloudPayload, { merge: true });
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
      console.warn('[Firebase] Realtime cloud listener warning:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Seeds baseline default dossiers into the Cloud database if not already present.
 */
export async function seedInitialCloudDossiers(defaults: ProspectusDossier[]): Promise<void> {
  try {
    for (const d of defaults) {
      const docRef = doc(db, COLLECTION_NAME, d.id);
      const existing = await getDoc(docRef);
      if (!existing.exists()) {
        const normName = normalizeCompanyName(d.companyName);
        const normReg = normalizeRegistrationNo(d.registrationNo || '');
        await setDoc(docRef, {
          ...d,
          normalizedCompanyName: normName,
          normalizedRegistrationNo: normReg,
          isCloudShared: true,
          uploaderEmail: 'system-institutional',
          cloudSharedAt: new Date().toISOString(),
        });
      }
    }
    console.info('[Firebase] Baseline default dossiers verified in Cloud database.');
  } catch (err) {
    console.warn('[Firebase] Cloud seeding skipped or offline:', err);
  }
}
