// Centralized audio and Tone.js type definitions
import * as Tone from 'tone'

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
  decay: number
  sustain: number
  release: number
  volume: number
  waveform: string
  character: string
  // Enhanced synthesis parameters
  detune: number // Pitch detune in cents
  portamento: number // Glide time between notes
  filterCutoff: number // Filter frequency
  filterResonance: number // Filter Q factor
  filterEnvAmount: number // Filter envelope amount
  lfoRate: number // LFO frequency
  lfoAmount: number // LFO modulation depth
  lfoTarget: string // LFO target: 'frequency', 'filter', 'amplitude'
  // Oscillator mixing
  oscMix: number // Mix between main and sub oscillator
  subOscType: string // Sub oscillator waveform
  noiseLevel: number // Noise generator level
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

// Interface for drum synthesizers with proper typing
export interface ToneDrumSynth {
  triggerAttackRelease: (duration: ToneDuration, time?: ToneTime) => void
  dispose?: () => void
  output?: Tone.ToneAudioNode
  connect?: (destination: Tone.InputNode) => void
  disconnect?: () => void
}

// Record type for drum synthesizers collection
export type DrumSynthCollection = Record<string, ToneDrumSynth>

// Interface for character patches (partial SynthParameters)
export interface CharacterPatch {
  waveform?: string
  attack?: number
  release?: number
  brightness?: number
  texture?: number
  volume?: number
}

// Record type for character patches collection
export type CharacterPatchCollection = Record<string, CharacterPatch | null>

// Interface for Tone.js synth voice with filter
export interface ToneSynthVoice {
  filter?: {
    frequency: {
      rampTo: (value: number, time: number) => void
    }
    Q: {
      rampTo: (value: number, time: number) => void
    }
  }
}
