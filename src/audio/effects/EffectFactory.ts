// Factory for creating effects

import type { EffectInterface } from '../../types/instruments'
import { ReverbEffect, DelayEffect } from './TimeBasedEffects'
import { FilterEffect } from './FilteringEffects'
import { ChorusEffect, DistortionEffect } from './ModulationEffects'

export class EffectFactory {
  static createEffect(type: string, id: string): EffectInterface {
    switch (type) {
      case 'reverb':
        return new ReverbEffect(id)
      case 'delay':
        return new DelayEffect(id)
      case 'filter':
        return new FilterEffect(id)
      case 'chorus':
        return new ChorusEffect(id)
      case 'distortion':
        return new DistortionEffect(id)
      default:
        throw new Error(`Unknown effect type: ${type}`)
    }
  }

  static getAvailableEffectTypes(): string[] {
    return ['reverb', 'delay', 'filter', 'chorus', 'distortion']
  }
}
