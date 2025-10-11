// Centralized sequencer-related type definitions

export interface Cell {
  active: boolean
  velocity: number
}

export type CellData = Cell

export interface DrumPattern {
  id: string
  name: string
  genre: string
  pattern: number[][]
  kit: string
}

export interface GridState {
  cells: Cell[][]
  currentStep?: number
  isPlaying: boolean
  bpm: number
}

export interface TransportState {
  isPlaying: boolean
  currentStep: number
  bpm: number
  swing: number
}

export interface VelocityLevel {
  value: number
  label: string
  color: string
}

export const VELOCITY_LEVELS: VelocityLevel[] = [
  { value: 0.3, label: 'QUIET', color: 'bg-lcars-blue' },
  { value: 0.7, label: 'NORMAL', color: 'bg-lcars-orange' },
  { value: 1.0, label: 'EMPHASIS', color: 'bg-red-500' },
]

// Pattern save/load types
export interface SavedPattern {
  id: string
  name: string
  description?: string
  grid: Cell[][]
  tempo: number
  scaleId: string | null
  keyId: string | null
  drumEnabled: boolean
  drumPatternId: string
  drumKitId: string
  createdAt: number
  updatedAt: number
}

export interface PatternMetadata {
  id: string
  name: string
  description?: string
  tempo: number
  createdAt: number
  updatedAt: number
}
