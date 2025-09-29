// Centralized audio and Tone.js type definitions

// Tone.js duration notation types
export type ToneDuration =
  | '1n'
  | '2n'
  | '4n'
  | '8n'
  | '16n'
  | '32n'
  | '64n' // Note values
  | '1n.'
  | '2n.'
  | '4n.'
  | '8n.'
  | '16n.'
  | '32n.' // Dotted notes
  | '1t'
  | '2t'
  | '4t'
  | '8t'
  | '16t'
  | '32t' // Triplets
  | '1m'
  | '2m'
  | '4m'
  | '8m' // Measures

// Tone.js time notation types (can be duration or transport time with + prefix)
export type ToneTime =
  | ToneDuration
  | `+${ToneDuration}` // Relative time (e.g., "+16n")
  | `+${number}` // Relative seconds (e.g., "+0.5")
  | number // Absolute seconds
  | `${number}:${number}:${number}` // Bars:Beats:Sixteenths

export interface DrumKitDefinition {
  id: string
  name: string
  description: string
}

export interface DrumSound {
  name: string
  synthConfig: {
    oscillator?: {
      type: string
      frequency?: number
    }
    envelope?: {
      attack: number
      decay: number
      sustain: number
      release: number
    }
    noise?: {
      type: 'white' | 'pink' | 'brown'
      level?: number
    }
    filter?: {
      type: string
      frequency: number
      Q?: number
    }
  }
}

export interface AudioContextState {
  state: 'suspended' | 'running' | 'closed'
  sampleRate: number
  currentTime: number
}

export interface TimingEngineConfig {
  lookAhead: number
  scheduleAheadTime: number
  intervalRate: number
}

export interface ScheduledEvent {
  time: number
  step: number
  executed: boolean
}

export interface SynthParameters {
  brightness: number
  texture: number
  attack: number
  release: number
  volume: number
  waveform: string
  character: string
}

export interface EffectParameters {
  reverb: number
  delay: number
  chorus: number
  wahFilter: number
}

export interface DrumParameters {
  volume: number
  pattern: string
  selectedKit: string
}