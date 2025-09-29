// Context and hook type definitions

import type {
  Cell,
  DrumPattern,
  Scale,
  Key,
  SynthParameters,
  EffectParameters,
  DrumParameters,
  DrumKitDefinition
} from './index'

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