// Modular instrument architecture type definitions

import type * as Tone from 'tone'
import type { ToneDuration, ToneTime } from './audio'

// Re-export for easier access
export type { ToneDuration, ToneTime } from './audio'

// Core instrument interface that all instruments must implement
export interface InstrumentInterface {
  // Identification
  readonly id: string
  readonly name: string
  readonly type: InstrumentType
  readonly version: string

  // Lifecycle
  initialize(): Promise<void>
  dispose(): void
  isInitialized(): boolean

  // Audio processing
  triggerNote(
    note: string | number,
    velocity: number,
    time?: ToneTime,
    duration?: ToneDuration
  ): void
  releaseNote(note: string | number, time?: ToneTime): void
  triggerAttackRelease(
    note: string | number,
    duration: ToneDuration,
    time?: ToneTime,
    velocity?: number
  ): void

  // Parameter control
  setParameter<T>(paramId: string, value: T): void
  getParameter<T>(paramId: string): T
  getParameterNames(): string[]

  // Effects chain connection
  connectToEffectsChain(effectsChain: EffectsChain): void
  disconnectFromEffectsChain(): void

  // Output control
  setVolume(volume: number): void
  getVolume(): number
  mute(): void
  unmute(): void
  isMuted(): boolean

  // Audio output (for connecting to mixer)
  getOutput(): Tone.ToneAudioNode
}

// Instrument types for categorization and specialized behavior
export const InstrumentType = {
  SYNTH: 'synth',
  DRUM: 'drum',
  SAMPLE: 'sample',
  EFFECT: 'effect',
  SEQUENCER: 'sequencer',
} as const

export type InstrumentType = (typeof InstrumentType)[keyof typeof InstrumentType]

// Parameter definition for dynamic UI generation
export interface ParameterDefinition {
  id: string
  name: string
  type: ParameterType
  defaultValue: number | string | boolean
  min?: number
  max?: number
  step?: number
  options?: string[] // For enumerated parameters
  unit?: string
  description?: string
}

export const ParameterType = {
  RANGE: 'range',
  BOOLEAN: 'boolean',
  SELECT: 'select',
  TEXT: 'text',
} as const

export type ParameterType = (typeof ParameterType)[keyof typeof ParameterType]

// Effects chain interface
export interface EffectsChain {
  readonly id: string
  addEffect(effect: EffectInterface): void
  removeEffect(effectId: string): void
  getEffects(): EffectInterface[]
  connect(input: Tone.ToneAudioNode): void
  getOutput(): Tone.ToneAudioNode
  dispose(): void
}

// Effect interface
export interface EffectInterface {
  readonly id: string
  readonly name: string
  readonly type: string

  getParameterDefinitions(): ParameterDefinition[]
  setParameter<T>(paramId: string, value: T): void
  getParameter<T>(paramId: string): T

  getInput(): Tone.ToneAudioNode
  getOutput(): Tone.ToneAudioNode

  dispose(): void
}

// Instrument factory for creating instruments
export interface InstrumentFactory {
  create(config: InstrumentConfig): Promise<InstrumentInterface>
  getAvailableTypes(): InstrumentTypeInfo[]
  canCreate(type: string): boolean
}

// Configuration for creating instruments
export interface InstrumentConfig {
  type: string
  id?: string
  name?: string
  parameters?: Record<string, unknown>
  effectsChainId?: string
}

// Information about available instrument types
export interface InstrumentTypeInfo {
  type: string
  name: string
  description: string
  parameterDefinitions: ParameterDefinition[]
  supportsPolyphony: boolean
  supportsSustain: boolean
  category: InstrumentType
}

// Mixer track interface
export interface MixerTrack {
  readonly id: string
  readonly name: string

  // Audio routing
  setInstrument(instrument: InstrumentInterface): void
  getInstrument(): InstrumentInterface | null

  // Track controls
  setVolume(volume: number): void
  getVolume(): number
  setPan(pan: number): void
  getPan(): number
  mute(): void
  unmute(): void
  isMuted(): boolean
  solo(): void
  unsolo(): void
  isSoloed(): boolean

  // Effects
  getEffectsChain(): EffectsChain

  // Output
  getOutput(): Tone.ToneAudioNode

  // Cleanup
  dispose(): void
}

// Mixer interface
export interface MixerInterface {
  // Track management
  createTrack(id: string, name: string): MixerTrack
  getTrack(id: string): MixerTrack | null
  getAllTracks(): MixerTrack[]
  removeTrack(id: string): void

  // Master controls
  setMasterVolume(volume: number): void
  getMasterVolume(): number

  // Solo/mute logic
  hasAnyTrackSoloed(): boolean
  getActiveTrackOutput(): Tone.ToneAudioNode[]

  // Master output
  getMasterOutput(): Tone.ToneAudioNode

  // Cleanup
  dispose(): void
}

// Grid sequencer interface for multiple instruments
export interface SequencerGrid {
  // Grid management
  getGrid(instrumentId: string): Cell[][]
  setGrid(instrumentId: string, grid: Cell[][]): void
  clearGrid(instrumentId: string): void

  // Cell manipulation
  toggleCell(instrumentId: string, row: number, col: number, velocity?: number): void
  setCell(instrumentId: string, row: number, col: number, active: boolean, velocity?: number): void

  // Playback
  getCurrentStep(): number
  isPlaying(): boolean

  // Grid registration
  registerInstrument(instrumentId: string, rows: number, cols: number): void
  unregisterInstrument(instrumentId: string): void
}

// Cell interface (extending existing)
export interface Cell {
  active: boolean
  velocity: number
  note?: string | number // Optional note override
}

// Preset system for saving/loading configurations
export interface PresetInterface {
  readonly id: string
  readonly name: string
  readonly description?: string
  readonly version: string
  readonly timestamp: Date

  // Configuration data
  instruments: InstrumentConfig[]
  mixer: MixerConfig
  sequencer: SequencerConfig
  effects: EffectConfig[]
}

export interface MixerConfig {
  masterVolume: number
  tracks: TrackConfig[]
}

export interface TrackConfig {
  id: string
  name: string
  volume: number
  pan: number
  muted: boolean
  soloed: boolean
  instrumentId: string
  effectsChainId: string
}

export interface SequencerConfig {
  tempo: number
  swing: number
  grids: Record<string, Cell[][]>
}

export interface EffectConfig {
  id: string
  type: string
  parameters: Record<string, unknown>
}
