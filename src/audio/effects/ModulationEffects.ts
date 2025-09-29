// Modulation and distortion effects

import * as Tone from 'tone'
import type { ParameterDefinition } from '../../types/instruments'
import { ParameterType } from '../../types/instruments'
import { BaseEffect } from './BaseEffect'

// Chorus effect
export class ChorusEffect extends BaseEffect {
  private chorus: Tone.Chorus

  constructor(id: string) {
    super(id, 'Chorus', 'chorus')
    this.chorus = new Tone.Chorus({
      frequency: 4,
      delayTime: 2.5,
      depth: 0.7,
      spread: 180,
      wet: 0.5,
    })
    this.chorus.start()
  }

  getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        id: 'frequency',
        name: 'Rate',
        type: ParameterType.RANGE,
        defaultValue: 4,
        min: 0.1,
        max: 20,
        step: 0.1,
        unit: 'Hz',
        description: 'Chorus modulation rate',
      },
      {
        id: 'depth',
        name: 'Depth',
        type: ParameterType.RANGE,
        defaultValue: 0.7,
        min: 0,
        max: 1,
        step: 0.01,
        description: 'Chorus modulation depth',
      },
      {
        id: 'wet',
        name: 'Wet Level',
        type: ParameterType.RANGE,
        defaultValue: 0.5,
        min: 0,
        max: 1,
        step: 0.01,
        description: 'Chorus wet/dry mix',
      },
    ]
  }

  protected updateToneParameter<T>(paramId: string, value: T): void {
    switch (paramId) {
      case 'frequency':
        this.chorus.frequency.value = value as number
        break
      case 'depth':
        this.chorus.depth = value as number
        break
      case 'wet':
        this.chorus.wet.value = value as number
        break
    }
  }

  getInput(): Tone.ToneAudioNode {
    return this.chorus
  }

  getOutput(): Tone.ToneAudioNode {
    return this.chorus
  }

  dispose(): void {
    this.chorus.dispose()
  }
}

// Distortion effect
export class DistortionEffect extends BaseEffect {
  private distortion: Tone.Distortion

  constructor(id: string) {
    super(id, 'Distortion', 'distortion')
    this.distortion = new Tone.Distortion({
      distortion: 0.4,
      wet: 0.5,
    })
  }

  getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        id: 'distortion',
        name: 'Drive',
        type: ParameterType.RANGE,
        defaultValue: 0.4,
        min: 0,
        max: 1,
        step: 0.01,
        description: 'Distortion amount',
      },
      {
        id: 'wet',
        name: 'Wet Level',
        type: ParameterType.RANGE,
        defaultValue: 0.5,
        min: 0,
        max: 1,
        step: 0.01,
        description: 'Distortion wet/dry mix',
      },
    ]
  }

  protected updateToneParameter<T>(paramId: string, value: T): void {
    switch (paramId) {
      case 'distortion':
        this.distortion.distortion = value as number
        break
      case 'wet':
        this.distortion.wet.value = value as number
        break
    }
  }

  getInput(): Tone.ToneAudioNode {
    return this.distortion
  }

  getOutput(): Tone.ToneAudioNode {
    return this.distortion
  }

  dispose(): void {
    this.distortion.dispose()
  }
}
