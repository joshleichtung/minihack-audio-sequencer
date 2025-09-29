// Effects chain implementation for modular architecture

import * as Tone from 'tone'
import type { EffectsChain, EffectInterface } from '../../types/instruments'

export class StandardEffectsChain implements EffectsChain {
  readonly id: string
  private effects: EffectInterface[] = []
  private inputGain: Tone.Gain
  private outputGain: Tone.Gain
  private isConnected = false

  constructor(id: string) {
    this.id = id
    this.inputGain = new Tone.Gain(1)
    this.outputGain = new Tone.Gain(1)

    // Initially connect input directly to output
    this.inputGain.connect(this.outputGain)
  }

  addEffect(effect: EffectInterface): void {
    this.effects.push(effect)
    this.reconnectChain()
  }

  removeEffect(effectId: string): void {
    const index = this.effects.findIndex(effect => effect.id === effectId)
    if (index < 0 || index >= this.effects.length) return
    const effect = this.effects.at(index)
    if (effect) {
      effect.dispose()
      this.effects.splice(index, 1)
      this.reconnectChain()
    }
  }

  getEffects(): EffectInterface[] {
    return [...this.effects]
  }

  connect(input: Tone.ToneAudioNode): void {
    if (this.isConnected) {
      throw new Error('EffectsChain is already connected')
    }

    input.connect(this.inputGain)
    this.isConnected = true
  }

  getOutput(): Tone.ToneAudioNode {
    return this.outputGain
  }

  private reconnectChain(): void {
    // Disconnect all current connections
    this.inputGain.disconnect()
    this.effects.forEach(effect => {
      effect.getOutput().disconnect()
    })

    if (this.effects.length === 0) {
      // No effects, connect input directly to output
      this.inputGain.connect(this.outputGain)
    } else {
      // Connect through effect chain
      const firstEffect = this.effects[0]
      if (firstEffect) {
        this.inputGain.connect(firstEffect.getInput())
      }

      for (let i = 0; i < this.effects.length - 1; i++) {
        const currentEffect = this.effects.at(i)
        const nextEffect = this.effects.at(i + 1)
        if (currentEffect && nextEffect) {
          currentEffect.getOutput().connect(nextEffect.getInput())
        }
      }

      const lastEffect = this.effects[this.effects.length - 1]
      if (lastEffect) {
        lastEffect.getOutput().connect(this.outputGain)
      }
    }
  }

  dispose(): void {
    this.effects.forEach(effect => effect.dispose())
    this.effects = []
    this.inputGain.dispose()
    this.outputGain.dispose()
  }
}
