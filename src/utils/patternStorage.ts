import type { SavedPattern, PatternMetadata } from '../types/sequencer'

const STORAGE_KEY = 'vibeloop_patterns'
const STORAGE_VERSION = '1.0.0'

interface StorageData {
  version: string
  patterns: SavedPattern[]
}

/**
 * Get all saved patterns from localStorage
 */
export function getAllPatterns(): SavedPattern[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []

    const parsed = JSON.parse(data) as StorageData

    // Version migration could go here if needed
    if (parsed.version !== STORAGE_VERSION) {
      // Version mismatch - using data as-is
    }

    return parsed.patterns || []
  } catch {
    // Failed to load patterns from localStorage
    return []
  }
}

/**
 * Get pattern metadata (without full grid data) for listing
 */
export function getPatternMetadata(): PatternMetadata[] {
  const patterns = getAllPatterns()
  return patterns.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    tempo: p.tempo,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }))
}

/**
 * Get a specific pattern by ID
 */
export function getPattern(id: string): SavedPattern | null {
  const patterns = getAllPatterns()
  return patterns.find(p => p.id === id) || null
}

/**
 * Save a new pattern or update existing one
 */
export function savePattern(pattern: SavedPattern): void {
  try {
    const patterns = getAllPatterns()
    const existingIndex = patterns.findIndex(p => p.id === pattern.id)

    if (existingIndex >= 0) {
      // Update existing pattern
      // eslint-disable-next-line security/detect-object-injection
      patterns[existingIndex] = {
        ...pattern,
        updatedAt: Date.now(),
      }
    } else {
      // Add new pattern
      patterns.push(pattern)
    }

    const data: StorageData = {
      version: STORAGE_VERSION,
      patterns,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Failed to save pattern to localStorage
    throw new Error('Failed to save pattern')
  }
}

/**
 * Delete a pattern by ID
 */
export function deletePattern(id: string): void {
  try {
    const patterns = getAllPatterns()
    const filtered = patterns.filter(p => p.id !== id)

    const data: StorageData = {
      version: STORAGE_VERSION,
      patterns: filtered,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Failed to delete pattern from localStorage
    throw new Error('Failed to delete pattern')
  }
}

/**
 * Export pattern as JSON file
 */
export function exportPattern(pattern: SavedPattern): void {
  try {
    const blob = new Blob([JSON.stringify(pattern, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${pattern.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch {
    // Failed to export pattern
    throw new Error('Failed to export pattern')
  }
}

/**
 * Import pattern from JSON file
 */
export async function importPattern(file: File): Promise<SavedPattern> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e: ProgressEvent<FileReader>): void => {
      try {
        const content = e.target?.result as string
        const pattern = JSON.parse(content) as SavedPattern

        // Validate pattern structure
        if (!pattern.id || !pattern.name || !pattern.grid) {
          throw new Error('Invalid pattern file format')
        }

        // Generate new ID and timestamps for imported pattern
        const importedPattern: SavedPattern = {
          ...pattern,
          id: `pattern_${Date.now()}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }

        resolve(importedPattern)
      } catch {
        reject(new Error('Failed to parse pattern file'))
      }
    }

    reader.onerror = (): void => {
      reject(new Error('Failed to read pattern file'))
    }

    reader.readAsText(file)
  })
}

/**
 * Clear all saved patterns (with confirmation)
 */
export function clearAllPatterns(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Failed to clear patterns from localStorage
    throw new Error('Failed to clear patterns')
  }
}
