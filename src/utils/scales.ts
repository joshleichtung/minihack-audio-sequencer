/* eslint-disable security/detect-object-injection */
// Musical scales and keys utility functions

export interface Scale {
  id: string
  name: string
  intervals: number[] // Semitone intervals from root
  description: string
}

export interface Key {
  id: string
  name: string
  rootNote: string
  pitchClass: number // 0-11 (C=0, C#=1, D=2, etc.)
}

// Scale definitions with semitone intervals
export const SCALES: Scale[] = [
  {
    id: 'pentatonic',
    name: 'PENTATONIC',
    intervals: [0, 2, 4, 7, 9], // C, D, E, G, A
    description: 'Traditional 5-note scale',
  },
  {
    id: 'major',
    name: 'MAJOR',
    intervals: [0, 2, 4, 5, 7, 9, 11], // C, D, E, F, G, A, B
    description: 'Happy, bright scale',
  },
  {
    id: 'minor',
    name: 'MINOR',
    intervals: [0, 2, 3, 5, 7, 8, 10], // C, D, Eb, F, G, Ab, Bb
    description: 'Sad, dark scale',
  },
  {
    id: 'dorian',
    name: 'DORIAN',
    intervals: [0, 2, 3, 5, 7, 9, 10], // C, D, Eb, F, G, A, Bb
    description: 'Modal, jazzy scale',
  },
  {
    id: 'blues',
    name: 'BLUES',
    intervals: [0, 3, 5, 6, 7, 10], // C, Eb, F, F#, G, Bb
    description: 'Bluesy, soulful scale',
  },
  {
    id: 'chromatic',
    name: 'CHROMATIC',
    intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // All 12 notes
    description: 'All 12 semitones',
  },
]

// Key definitions
export const KEYS: Key[] = [
  { id: 'c', name: 'C', rootNote: 'C', pitchClass: 0 },
  { id: 'cs', name: 'C#', rootNote: 'C#', pitchClass: 1 },
  { id: 'd', name: 'D', rootNote: 'D', pitchClass: 2 },
  { id: 'ds', name: 'D#', rootNote: 'D#', pitchClass: 3 },
  { id: 'e', name: 'E', rootNote: 'E', pitchClass: 4 },
  { id: 'f', name: 'F', rootNote: 'F', pitchClass: 5 },
  { id: 'fs', name: 'F#', rootNote: 'F#', pitchClass: 6 },
  { id: 'g', name: 'G', rootNote: 'G', pitchClass: 7 },
  { id: 'gs', name: 'G#', rootNote: 'G#', pitchClass: 8 },
  { id: 'a', name: 'A', rootNote: 'A', pitchClass: 9 },
  { id: 'as', name: 'A#', rootNote: 'A#', pitchClass: 10 },
  { id: 'b', name: 'B', rootNote: 'B', pitchClass: 11 },
]

// Note names for each pitch class
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

/**
 * Generate note names for a given scale and key
 */
export function generateScaleNotes(scale: Scale, key: Key): string[] {
  return scale.intervals.map(interval => {
    const pitchClass = (key.pitchClass + interval) % 12
    const safeIndex = Math.max(0, Math.min(11, pitchClass))
    return NOTE_NAMES[safeIndex] || 'C'
  })
}

/**
 * Get the note name for a given row in the 16x16 grid
 */
export function getNoteForRow(rowIndex: number, scale: Scale, key: Key): string {
  const noteIndex = 15 - rowIndex // Invert row (top = high notes)
  const scaleIndex = noteIndex % scale.intervals.length

  // Calculate the actual semitone offset from C0
  const scaleRepetition = Math.floor(noteIndex / scale.intervals.length)
  const semitoneOffset = scaleRepetition * 12 + scale.intervals[scaleIndex] + key.pitchClass

  // Calculate octave based on total semitones from C0
  const octave = Math.floor(semitoneOffset / 12) + 2
  const finalPitchClass = semitoneOffset % 12

  const safeIndex = Math.max(0, Math.min(11, finalPitchClass))
  const noteName = NOTE_NAMES[safeIndex] || 'C'

  return noteName + octave
}

/**
 * Get display note name without octave for UI labels
 */
export function getDisplayNoteForRow(rowIndex: number, scale: Scale, key: Key): string {
  const noteIndex = 15 - rowIndex
  const scaleIndex = noteIndex % scale.intervals.length

  const safeScaleIndex = Math.max(0, Math.min(scale.intervals.length - 1, scaleIndex))
  const interval = scale.intervals[safeScaleIndex] || 0
  const pitchClass = (key.pitchClass + interval) % 12
  const safeIndex = Math.max(0, Math.min(11, pitchClass))
  return NOTE_NAMES[safeIndex] || 'C'
}
