const DB_NAME = 'treeverse-cache'
const STORE_NAME = 'api-responses'
const DB_VERSION = 1

let db: IDBDatabase | null = null

async function pruneExpiredEntries(): Promise<void> {
  if (!db) return

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.openCursor()

    request.onerror = () => reject(request.error)
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result
      if (cursor) {
        const entry = cursor.value as CacheEntry
        if (Date.now() - entry.timestamp > CACHE_EXPIRY) {
          cursor.delete()
        }
        cursor.continue()
      } else {
        resolve()
      }
    }
  })
}

export async function initDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = async () => {
      db = request.result
      // Prune expired entries on database initialization
      await pruneExpiredEntries()
      resolve()
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'url' })
      }
    }
  })
}

interface CacheEntry {
  url: string
  data: any
  timestamp: number
}

const CACHE_EXPIRY = 5 * 60 * 1000 // 5 minutes in milliseconds

export async function getCachedResponse(url: string): Promise<any | null> {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(url)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const entry = request.result as CacheEntry | undefined
      if (!entry) {
        resolve(null)
        return
      }

      // Check if cache is expired
      if (Date.now() - entry.timestamp > CACHE_EXPIRY) {
        // Cache expired, remove it
        const deleteTransaction = db!.transaction(STORE_NAME, 'readwrite')
        const deleteStore = deleteTransaction.objectStore(STORE_NAME)
        deleteStore.delete(url)
        resolve(null)
        return
      }

      resolve(entry.data)
    }
  })
}

export async function setCachedResponse(url: string, data: any): Promise<void> {
  if (!db) await initDB()

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put({
      url,
      data,
      timestamp: Date.now(),
    })

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}
