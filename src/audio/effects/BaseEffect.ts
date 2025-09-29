// Base effect class with common functionality

import * as Tone from 'tone'
import type { EffectInterface, ParameterDefinition } from '../../types/instruments'

export abstract class BaseEffect implements EffectInterface {
  readonly id: string
  readonly name: string
  readonly type: string
  protected parameters: Map<string, unknown> = new Map()

  constructor(id: string, name: string, type: string) {
    this.id = id
    this.name = name
    this.type = type
  }

  abstract getParameterDefinitions(): ParameterDefinition[]
  abstract getInput(): Tone.ToneAudioNode
  abstract getOutput(): Tone.ToneAudioNode
  abstract dispose(): void

  setParameter<T>(paramId: string, value: T): void {
    if (this.isValidParameter(paramId)) {
      this.parameters.set(paramId, value)
      this.updateToneParameter(paramId, value)
    } else {
      throw new Error(`Invalid parameter: ${paramId}`)
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

  protected isValidParameter(paramId: string): boolean {
    return this.getParameterDefinitions().some(p => p.id === paramId)
  }

  protected abstract updateToneParameter<T>(paramId: string, value: T): void
}
