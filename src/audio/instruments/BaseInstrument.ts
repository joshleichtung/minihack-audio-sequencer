// Base instrument implementation for modular architecture

import * as Tone from 'tone'
import type {
  InstrumentInterface,
  EffectsChain,
  ParameterDefinition,
  ToneTime,
  ToneDuration,
} from '../../types/instruments'
import { InstrumentType } from '../../types/instruments'

export abstract class BaseInstrument implements InstrumentInterface {
  readonly id: string
  readonly name: string
  readonly type: InstrumentType
  readonly version: string

  protected output: Tone.Gain
  protected effectsChain: EffectsChain | null = null
  protected parameters: Map<string, unknown> = new Map()
  protected initialized = false

  private _volume = 0.8
  private _muted = false

  constructor(id: string, name: string, type: InstrumentType, version = '1.0.0') {
    this.id = id
    this.name = name
    this.type = type
    this.version = version

    // Create output gain node
    this.output = new Tone.Gain(this._volume)
  }

  abstract initialize(): Promise<void>
  abstract dispose(): void

  abstract triggerNote(
    note: string | number,
    velocity: number,
    time?: ToneTime,
    duration?: ToneDuration
  ): void
  abstract releaseNote(note: string | number, time?: ToneTime): void
  abstract triggerAttackRelease(
    note: string | number,
    duration: ToneDuration,
    time?: ToneTime,
    velocity?: number
  ): void

  abstract getParameterNames(): string[]
  protected abstract getParameterDefinitions(): ParameterDefinition[]

  isInitialized(): boolean {
    return this.initialized
  }

  setParameter<T>(paramId: string, value: T): void {
    if (this.isValidParameter(paramId)) {
      this.parameters.set(paramId, value)
      this.updateParameter(paramId, value)
    } else {
      throw new Error(`Invalid parameter: ${paramId} for instrument ${this.name}`)
    }
  }

  getParameter<T>(paramId: string): T {
    if (!this.parameters.has(paramId)) {
      // Return default value if not set
      const paramDef = this.getParameterDefinitions().find(p => p.id === paramId)
      if (paramDef) {
        return paramDef.defaultValue as T
      }
      throw new Error(`Parameter not found: ${paramId}`)
    }
    return this.parameters.get(paramId) as T
  }

  connectToEffectsChain(effectsChain: EffectsChain): void {
    if (this.effectsChain) {
      this.disconnectFromEffectsChain()
    }

    this.effectsChain = effectsChain
    // Note: Actual audio routing is handled by the mixer track
  }

  disconnectFromEffectsChain(): void {
    this.effectsChain = null
  }

  setVolume(volume: number): void {
    this._volume = Math.max(0, Math.min(1, volume))
    this.output.gain.value = this._muted ? 0 : this._volume
  }

  getVolume(): number {
    return this._volume
  }

  mute(): void {
    this._muted = true
    this.output.gain.value = 0
  }

  unmute(): void {
    this._muted = false
    this.output.gain.value = this._volume
  }

  isMuted(): boolean {
    return this._muted
  }

  getOutput(): Tone.ToneAudioNode {
    return this.output
  }

  // Protected helper methods
  protected isValidParameter(paramId: string): boolean {
    return this.getParameterNames().includes(paramId)
  }

  protected abstract updateParameter<T>(paramId: string, value: T): void

  protected createParameterDefinition(
    id: string,
    name: string,
    type: ParameterDefinition['type'],
    defaultValue: number | string | boolean,
    options?: Partial<ParameterDefinition>
  ): ParameterDefinition {
    return {
      id,
      name,
      type,
      defaultValue,
      ...options,
    }
  }

  // Helper method to convert various note formats to frequency
  protected noteToFrequency(note: string | number): number {
    if (typeof note === 'number') {
      return note
    }

    try {
      return Tone.Frequency(note).toFrequency()
    } catch {
      // Fallback for invalid note strings
      return 440 // A4
    }
  }

  // Helper method to validate and clamp parameter values
  protected clampParameterValue(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
  }
}
