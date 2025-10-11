// Context and hook type definitions

import type {
  Cell,
  DrumPattern,
  Scale,
  Key,
  SynthParameters,
  EffectParameters,
  DrumParameters,
  DrumKitDefinition,
  PatternMetadata,
} from './index'

// Track control interface for individual track settings
export interface TrackControl {
  volume: number
  pan: number
  muted: boolean
  solo: boolean
  reverb: number
  delay: number
}

// Timing statistics interface
export interface TimingStats {
  averageLatency: number
  jitter: number
  missedEvents: number
  totalEvents: number
}

export interface SequencerContextType {
  // Grid state
  grid: Cell[][]
  isPlaying: boolean
  tempo: number
  currentStep: number

  // Grid actions
  toggleCell: (row: number, col: number, shiftKey?: boolean) => void
  togglePlayback: () => void
  setTempo: (tempo: number) => void
  clearGrid: () => void
  setPreset: (preset: string) => void

  // Synth parameters
  synthParams: SynthParameters
  updateSynthParam: (param: keyof SynthParameters, value: number | string) => void
  selectCharacter: (character: string) => void

  // Effects parameters
  effectsParams: EffectParameters
  updateEffectsParam: (param: keyof EffectParameters, value: number) => void

  // Drum parameters
  drumEnabled: boolean
  drumVolume: number
  currentDrumPattern: string
  currentDrumKit: string
  drumPatterns: DrumPattern[]
  drumKits: DrumKitDefinition[]
  toggleDrums: () => void
  setDrumVolume: (volume: number) => void
  selectDrumPattern: (patternId: string) => void
  selectDrumKit: (kitId: string) => void

  // Scale and key
  currentScale: Scale | null
  currentKey: Key | null
  setScale: (scaleId: string) => void
  setKey: (keyId: string) => void

  // Individual track controls
  trackControls: Record<string, TrackControl>
  updateTrackControl: (trackId: string, control: string, value: number | boolean) => void
  soloTrack: (trackId: string) => void
  muteTrack: (trackId: string) => void

  // Enhanced timing controls
  setSwingAmount: (amount: number) => void
  toggleMicroTiming: () => void
  getTimingStats: () => TimingStats

  // Pattern save/load functionality
  savedPatterns: PatternMetadata[]
  saveCurrentPattern: (name: string, description?: string) => void
  loadPattern: (id: string) => void
  deletePattern: (id: string) => void
  exportPattern: (id: string) => void
  importPattern: (file: File) => Promise<void>
}

export interface SequencerProviderProps {
  children: React.ReactNode
}

export type UseSequencerReturn = SequencerContextType

// Strict typing for parameter updates
export type SynthParamKey = keyof SynthParameters
export type EffectParamKey = keyof EffectParameters
export type DrumParamKey = keyof DrumParameters

// Callback types for type safety
export type CellToggleCallback = (row: number, col: number, shiftKey?: boolean) => void
export type ParameterUpdateCallback<T> = (param: keyof T, value: number | string) => void
export type SimpleCallback = () => void
export type ValueCallback<T> = (value: T) => void
