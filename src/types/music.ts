// Centralized music theory type definitions

export interface Scale {
  id: string
  name: string
  intervals: number[]
  description: string
}

export interface Key {
  id: string
  name: string
  rootNote: string
  pitchClass: number
}

export interface Note {
  name: string
  octave: number
  frequency: number
  pitchClass: number
}

export interface AudioSettings {
  masterVolume: number
  synthVolume: number
  drumVolume: number
  effectsEnabled: boolean
}

export interface SynthConfig {
  waveform: 'sine' | 'square' | 'sawtooth' | 'triangle'
  attack: number
  decay: number
  sustain: number
  release: number
  filterFreq: number
  filterQ: number
}

export interface EffectConfig {
  reverb: {
    enabled: boolean
    roomSize: number
    decay: number
  }
  delay: {
    enabled: boolean
    time: number
    feedback: number
  }
  filter: {
    enabled: boolean
    frequency: number
    type: 'lowpass' | 'highpass' | 'bandpass'
  }
}

export type DrumKit = 'tr808' | 'acoustic' | 'electronic'
export type WaveformType = 'sine' | 'square' | 'sawtooth' | 'triangle'