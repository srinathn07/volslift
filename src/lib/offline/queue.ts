/**
 * IndexedDB offline queue for set writes.
 *
 * When the network is unavailable, sets are stored here and drained on reconnect.
 * The client_uuid on each record is also the unique constraint in the DB,
 * so a re-submitted write is idempotent.
 */

export interface QueuedSet {
  client_uuid:       string;   // IDB key
  session_id:        string;
  exercise_id:       string;
  equipment_unit_id: string | null;
  set_index:         number;
  weight:            number;
  reps:              number;
  is_warmup:         boolean;
  logged_at:         string;   // ISO 8601
}

const DB_NAME    = 'volslift';
const DB_VERSION = 1;
const STORE      = 'set_queue';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: 'client_uuid' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

export async function enqueueSet(item: QueuedSet): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
}

export async function getPendingSets(): Promise<QueuedSet[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as QueuedSet[]);
    req.onerror   = () => reject(req.error);
  });
}

export async function removeSyncedSet(clientUuid: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(clientUuid);
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
}
