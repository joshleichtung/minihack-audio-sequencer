// Time-based effects: Reverb and Delay

import * as Tone from 'tone'
import type { ParameterDefinition } from '../../types/instruments'
import { ParameterType } from '../../types/instruments'
import { BaseEffect } from './BaseEffect'

// Reverb effect
export class ReverbEffect extends BaseEffect {
  private reverb: Tone.Reverb

  constructor(id: string) {
    super(id, 'Reverb', 'reverb')
    this.reverb = new Tone.Reverb({
      decay: 2,
      preDelay: 0.01,
      wet: 0.5,
    })
  }

  getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        id: 'decay',
        name: 'Decay Time',
        type: ParameterType.RANGE,
        defaultValue: 2,
        min: 0.1,
        max: 10,
        step: 0.1,
        unit: 's',
        description: 'Reverb decay time',
      },
      {
        id: 'preDelay',
        name: 'Pre Delay',
        type: ParameterType.RANGE,
        defaultValue: 0.01,
        min: 0,
        max: 0.2,
        step: 0.001,
        unit: 's',
        description: 'Pre-delay before reverb',
      },
      {
        id: 'wet',
        name: 'Wet Level',
        type: ParameterType.RANGE,
        defaultValue: 0.5,
        min: 0,
        max: 1,
        step: 0.01,
        description: 'Reverb wet/dry mix',
      },
    ]
  }

  protected updateToneParameter<T>(paramId: string, value: T): void {
    switch (paramId) {
      case 'decay':
        this.reverb.decay = value as number
        break
      case 'preDelay':
        this.reverb.preDelay = value as number
        break
      case 'wet':
        this.reverb.wet.value = value as number
        break
    }
  }

  getInput(): Tone.ToneAudioNode {
    return this.reverb
  }

  getOutput(): Tone.ToneAudioNode {
    return this.reverb
  }

  dispose(): void {
    this.reverb.dispose()
  }
}

// Delay effect
export class DelayEffect extends BaseEffect {
  private delay: Tone.FeedbackDelay

  constructor(id: string) {
    super(id, 'Delay', 'delay')
    this.delay = new Tone.FeedbackDelay({
      delayTime: '8n',
      feedback: 0.3,
      wet: 0.3,
    })
  }

  getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        id: 'delayTime',
        name: 'Delay Time',
        type: ParameterType.SELECT,
        defaultValue: '8n',
        options: ['16n', '8n', '4n', '2n', '1n'],
        description: 'Delay time in note values',
      },
      {
        id: 'feedback',
        name: 'Feedback',
        type: ParameterType.RANGE,
        defaultValue: 0.3,
        min: 0,
        max: 0.95,
        step: 0.01,
        description: 'Delay feedback amount',
      },
      {
        id: 'wet',
        name: 'Wet Level',
        type: ParameterType.RANGE,
        defaultValue: 0.3,
        min: 0,
        max: 1,
        step: 0.01,
        description: 'Delay wet/dry mix',
      },
    ]
  }

  protected updateToneParameter<T>(paramId: string, value: T): void {
    switch (paramId) {
      case 'delayTime':
        this.delay.delayTime.value = value as string
        break
      case 'feedback':
        this.delay.feedback.value = value as number
        break
      case 'wet':
        this.delay.wet.value = value as number
        break
    }
  }

  getInput(): Tone.ToneAudioNode {
    return this.delay
  }

  getOutput(): Tone.ToneAudioNode {
    return this.delay
  }

  dispose(): void {
    this.delay.dispose()
  }
}
