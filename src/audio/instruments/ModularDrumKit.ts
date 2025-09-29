// Modular drum kit implementation - placeholder for compilation

import * as Tone from 'tone'
import { BaseInstrument } from './BaseInstrument'
import type { ParameterDefinition, ToneTime, ToneDuration } from '../../types/instruments'
import { InstrumentType, ParameterType } from '../../types/instruments'

export class ModularDrumKit extends BaseInstrument {
  private drumSynths: Map<number, Tone.Synth> = new Map()
  private _kitType = '808'

  get kitType(): string {
    return this._kitType
  }

  constructor(id: string, name: string) {
    super(id, name, InstrumentType.DRUM)
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    // Create basic drum synths (kick, snare, hihat, openhat)
    // MIDI note 36 = kick, 38 = snare, 42 = hihat, 46 = openhat
    this.drumSynths.set(36, this.createKickSynth())
    this.drumSynths.set(38, this.createSnareSynth())
    this.drumSynths.set(42, this.createHihatSynth())
    this.drumSynths.set(46, this.createOpenHatSynth())

    // Connect all to output
    for (const synth of this.drumSynths.values()) {
      synth.connect(this.output)
    }

    // Ensure Tone.js is ready
    await Tone.start()
    this.initialized = true
  }

  dispose(): void {
    for (const synth of this.drumSynths.values()) {
      synth.dispose()
    }
    this.drumSynths.clear()
    this.output.dispose()
  }

  triggerNote(note: string | number, velocity: number, time?: ToneTime): void {
    const midiNote = typeof note === 'string' ? this.noteNameToMidi(note) : note
    const synth = this.drumSynths.get(midiNote)
    if (synth) {
      synth.triggerAttack('C4', time, velocity)
    }
  }

  releaseNote(): void {
    // Drums don't typically have sustained notes
  }

  triggerAttackRelease(
    note: string | number,
    duration: ToneDuration,
    time?: ToneTime,
    velocity = 0.8
  ): void {
    const midiNote = typeof note === 'string' ? this.noteNameToMidi(note) : note
    const synth = this.drumSynths.get(midiNote)
    if (synth) {
      synth.triggerAttackRelease('C4', duration, time, velocity)
    }
  }

  getParameterNames(): string[] {
    return ['kitType', 'kickTune', 'snareTune', 'hihatDecay']
  }

  protected getParameterDefinitions(): ParameterDefinition[] {
    return [
      {
        id: 'kitType',
        name: 'Kit Type',
        type: ParameterType.SELECT,
        defaultValue: '808',
        options: ['808', '909', 'acoustic', 'electronic'],
        description: 'Drum kit character',
      },
      {
        id: 'kickTune',
        name: 'Kick Tune',
        type: ParameterType.RANGE,
        defaultValue: 0,
        min: -12,
        max: 12,
        step: 0.1,
        unit: 'st',
        description: 'Kick drum tuning',
      },
      {
        id: 'snareTune',
        name: 'Snare Tune',
        type: ParameterType.RANGE,
        defaultValue: 0,
        min: -12,
        max: 12,
        step: 0.1,
        unit: 'st',
        description: 'Snare drum tuning',
      },
      {
        id: 'hihatDecay',
        name: 'Hi-hat Decay',
        type: ParameterType.RANGE,
        defaultValue: 0.1,
        min: 0.01,
        max: 1,
        step: 0.01,
        unit: 's',
        description: 'Hi-hat decay time',
      },
    ]
  }

  protected updateParameter<T>(paramId: string, value: T): void {
    switch (paramId) {
      case 'kitType':
        this._kitType = value as string
        this.recreateDrumSynths()
        break
      case 'kickTune':
        this.updateDrumTuning(36, value as number)
        break
      case 'snareTune':
        this.updateDrumTuning(38, value as number)
        break
      case 'hihatDecay':
        this.updateHihatDecay(value as number)
        break
    }
  }

  private createKickSynth(): Tone.Synth {
    return new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 },
    })
  }

  private createSnareSynth(): Tone.Synth {
    return new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
    })
  }

  private createHihatSynth(): Tone.Synth {
    return new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.05, sustain: 0, release: 0.05 },
    })
  }

  private createOpenHatSynth(): Tone.Synth {
    return new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.3 },
    })
  }

  private recreateDrumSynths(): void {
    // Dispose current synths
    for (const synth of this.drumSynths.values()) {
      synth.dispose()
    }
    this.drumSynths.clear()

    // Recreate with new kit type
    // Switching to drum kit: ${this._kitType}
    void this.initialize()
  }

  private updateDrumTuning(midiNote: number, semitones: number): void {
    const synth = this.drumSynths.get(midiNote)
    if (synth) {
      const baseFreq = Tone.Frequency('C4').toFrequency()
      const newFreq = baseFreq * Math.pow(2, semitones / 12)
      synth.oscillator.frequency.value = newFreq
    }
  }

  private updateHihatDecay(decay: number): void {
    const hihat = this.drumSynths.get(42)
    const openhat = this.drumSynths.get(46)

    if (hihat) {
      hihat.envelope.decay = decay
      hihat.envelope.release = decay
    }
    if (openhat) {
      openhat.envelope.decay = decay * 3
      openhat.envelope.release = decay * 3
    }
  }

  private noteNameToMidi(noteName: string): number {
    // Simple conversion - in real implementation would use Tone.Frequency
    const noteMap = new Map([
      ['C2', 36], // kick
      ['D2', 38], // snare
      ['F#2', 42], // hihat
      ['A#2', 46], // openhat
    ])
    return noteMap.get(noteName) ?? 36
  }
}
