// Filtering effects

import * as Tone from 'tone'
import type { ParameterDefinition } from '../../types/instruments'
import { ParameterType } from '../../types/instruments'
import { BaseEffect } from './BaseEffect'

// Filter effect
export class FilterEffect extends BaseEffect {
  private filter: Tone.Filter

  constructor(id: string) {
    super(id, 'Filter', 'filter')
    this.filter = new Tone.Filter({
      frequency: 1000,
      type: 'lowpass',
      Q: 1,
    })
  }

  getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        id: 'frequency',
        name: 'Frequency',
        type: ParameterType.RANGE,
        defaultValue: 1000,
        min: 20,
        max: 20000,
        step: 1,
        unit: 'Hz',
        description: 'Filter cutoff frequency',
      },
      {
        id: 'Q',
        name: 'Resonance',
        type: ParameterType.RANGE,
        defaultValue: 1,
        min: 0.1,
        max: 30,
        step: 0.1,
        description: 'Filter resonance (Q factor)',
      },
      {
        id: 'type',
        name: 'Type',
        type: ParameterType.SELECT,
        defaultValue: 'lowpass',
        options: [
          'lowpass',
          'highpass',
          'bandpass',
          'lowshelf',
          'highshelf',
          'notch',
          'allpass',
          'peaking',
        ],
        description: 'Filter type',
      },
    ]
  }

  protected updateToneParameter<T>(paramId: string, value: T): void {
    switch (paramId) {
      case 'frequency':
        this.filter.frequency.value = value as number
        break
      case 'Q':
        this.filter.Q.value = value as number
        break
      case 'type':
        this.filter.type = value as BiquadFilterType
        break
    }
  }

  getInput(): Tone.ToneAudioNode {
    return this.filter
  }

  getOutput(): Tone.ToneAudioNode {
    return this.filter
  }

  dispose(): void {
    this.filter.dispose()
  }
}
