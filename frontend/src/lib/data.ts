/**
 * Data fetching layer — static JSON fetch with in-memory cache.
 * Each Zustand store calls loadEntity<T>() for its entity type.
 */
const DATA_PATH = 'data'
const cache = new Map<string, unknown>()

export async function loadEntity<T>(filename: string): Promise<T> {
  if (cache.has(filename)) {
    return cache.get(filename) as T
  }
  const base = import.meta.env.BASE_URL
  const url = base && base !== '/'
    ? `${base}${DATA_PATH}/${filename}`
    : `${DATA_PATH}/${filename}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to load ${filename}: ${res.status}`)
  }
  const data: T = await res.json()
  cache.set(filename, data)
  return data
}

export function clearCache(): void {
  cache.clear()
}
