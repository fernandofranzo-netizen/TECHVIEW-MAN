import { TechnicalDocument } from '../types';

const DB_NAME = 'techview_offline_db';
const DB_VERSION = 1;
const STORE_DOCUMENTS = 'documents';
const STORE_SETTINGS = 'settings';

export class OfflineStorageService {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  public static async getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_DOCUMENTS)) {
            db.createObjectStore(STORE_DOCUMENTS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
            db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    }
    return this.dbPromise;
  }

  public static async saveDocument(doc: TechnicalDocument): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_DOCUMENTS, 'readwrite');
      const store = tx.objectStore(STORE_DOCUMENTS);
      const updatedDoc = { ...doc, isOfflineCached: true };
      store.put(updatedDoc);
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Erro ao salvar no IndexedDB, usando fallback LocalStorage:', err);
      localStorage.setItem(`doc_${doc.id}`, JSON.stringify({ ...doc, isOfflineCached: true }));
    }
  }

  public static async removeDocument(docId: string): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_DOCUMENTS, 'readwrite');
      const store = tx.objectStore(STORE_DOCUMENTS);
      store.delete(docId);
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      localStorage.removeItem(`doc_${docId}`);
    }
  }

  public static async getOfflineDocuments(): Promise<TechnicalDocument[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_DOCUMENTS, 'readonly');
      const store = tx.objectStore(STORE_DOCUMENTS);
      const request = store.getAll();
      return new Promise<TechnicalDocument[]>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      const docs: TechnicalDocument[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('doc_')) {
          try {
            const item = localStorage.getItem(key);
            if (item) docs.push(JSON.parse(item));
          } catch {}
        }
      }
      return docs;
    }
  }

  public static async getDocumentById(id: string): Promise<TechnicalDocument | null> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_DOCUMENTS, 'readonly');
      const store = tx.objectStore(STORE_DOCUMENTS);
      const request = store.get(id);
      return new Promise<TechnicalDocument | null>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch {
      const item = localStorage.getItem(`doc_${id}`);
      return item ? JSON.parse(item) : null;
    }
  }

  public static async saveSetting(key: string, value: any): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_SETTINGS, 'readwrite');
      tx.objectStore(STORE_SETTINGS).put({ key, value });
    } catch {
      localStorage.setItem(`setting_${key}`, JSON.stringify(value));
    }
  }

  public static async getSetting(key: string, defaultValue: any): Promise<any> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_SETTINGS, 'readonly');
      const request = tx.objectStore(STORE_SETTINGS).get(key);
      return new Promise<any>((resolve) => {
        request.onsuccess = () => {
          resolve(request.result ? request.result.value : defaultValue);
        };
        request.onerror = () => resolve(defaultValue);
      });
    } catch {
      const item = localStorage.getItem(`setting_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    }
  }
}
