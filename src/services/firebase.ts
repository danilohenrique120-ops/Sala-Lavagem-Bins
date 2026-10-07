import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  getDocFromServer,
  Firestore
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/* CRITICAL: The app will break without this line specifying firestoreDatabaseId */
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: true,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'room_layouts', 'connection_test'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline. Check network or configuration.');
      return false;
    }
    // If permission or not found, it still proves reachability
    return true;
  }
}

export interface StoredTransform {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export interface PersistedRoomLayout {
  id: string;
  name: string;
  transforms: Record<string, StoredTransform>;
  visibility: Record<string, boolean>;
  doorOpen: boolean;
  cipActive: boolean;
  marbleTone?: string;
  floorColor?: string;
  steelFinish?: string;
  updatedAt: string;
  updatedBy: string;
}

const DEFAULT_LAYOUT_ID = 'main_cleanroom_layout';

// Persistent client identifier
export function getClientId(): string {
  try {
    let id = localStorage.getItem('cleanroom_client_id');
    if (!id) {
      id = 'Eng_' + Math.random().toString(36).substring(2, 6).toUpperCase();
      localStorage.setItem('cleanroom_client_id', id);
    }
    return id;
  } catch {
    return 'WebUser';
  }
}

/**
 * Real-time subscription to room layout changes.
 * Calls onUpdate whenever this or any other connected user changes the room in the cloud.
 */
export function subscribeToRoomLayout(
  onUpdate: (layout: PersistedRoomLayout) => void,
  onError?: (err: unknown) => void,
  layoutId = DEFAULT_LAYOUT_ID
): () => void {
  const path = `room_layouts/${layoutId}`;
  const docRef = doc(db, 'room_layouts', layoutId);

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as PersistedRoomLayout;
        onUpdate(data);
      }
    },
    (error) => {
      console.error('Real-time sync snapshot error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );

  return unsubscribe;
}

/**
 * Saves current room layout to Firestore for all users to see in real time.
 */
export async function saveRoomLayoutToCloud(
  layoutData: Omit<PersistedRoomLayout, 'id' | 'updatedAt' | 'updatedBy'>,
  layoutId = DEFAULT_LAYOUT_ID
): Promise<void> {
  const path = `room_layouts/${layoutId}`;
  try {
    const payload: PersistedRoomLayout = {
      id: layoutId,
      name: 'Layout Oficial Sala Limpa',
      transforms: layoutData.transforms || {},
      visibility: layoutData.visibility || {},
      doorOpen: !!layoutData.doorOpen,
      cipActive: !!layoutData.cipActive,
      ...(layoutData.marbleTone ? { marbleTone: layoutData.marbleTone } : {}),
      ...(layoutData.floorColor ? { floorColor: layoutData.floorColor } : {}),
      ...(layoutData.steelFinish ? { steelFinish: layoutData.steelFinish } : {}),
      updatedAt: new Date().toISOString(),
      updatedBy: getClientId(),
    };

    await setDoc(doc(db, 'room_layouts', layoutId), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
