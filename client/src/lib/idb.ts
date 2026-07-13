// Minimal IndexedDB key-value store for the static build's stamp photos —
// localStorage's ~5 MB quota is too small for a passport full of pictures.
const DB_NAME = 'stampquest';
const STORE = 'photos';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const request = run(db.transaction(STORE, mode).objectStore(STORE));
        request.onsuccess = () => {
          resolve(request.result);
          db.close();
        };
        request.onerror = () => {
          reject(request.error);
          db.close();
        };
      }),
  );
}

export const idbGet = (key: string) => tx<string | undefined>('readonly', (s) => s.get(key));
export const idbSet = (key: string, value: string) =>
  tx('readwrite', (s) => s.put(value, key) as IDBRequest<unknown>);
export const idbDelete = (key: string) =>
  tx('readwrite', (s) => s.delete(key) as IDBRequest<unknown>);
export const idbKeys = () => tx<IDBValidKey[]>('readonly', (s) => s.getAllKeys());
export const idbClear = () => tx('readwrite', (s) => s.clear() as IDBRequest<unknown>);
