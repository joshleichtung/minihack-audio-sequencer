/* eslint-disable max-lines */
import * as Tone from 'tone'
import type { ToneDuration, ToneTime, DrumKitDefinition } from '../types'

// Re-export for backward compatibility
export type { ToneDuration, ToneTime } from '../types'

export interface DrumSynth {
  triggerAttackRelease: (duration: ToneDuration, time?: ToneTime) => void
  dispose: () => void
}

interface DrumComponents {
  envelopes: Tone.Envelope[]
  oscillators: Tone.Oscillator[]
  effects: (Tone.Filter | Tone.Distortion | Tone.Compressor | Tone.Gain)[]
  noiseGenerators: Tone.Noise[]
}

export const DRUM_KITS: DrumKitDefinition[] = [
  { id: '808', name: 'TR-808', description: 'Classic analog drum machine sounds' },
  { id: '909', name: 'TR-909', description: 'Punchy house and techno drums' },
  { id: 'acoustic', name: 'Acoustic', description: 'Natural drum kit sounds' },
  { id: 'electronic', name: 'Electronic', description: 'Modern electronic drums' },
]

export class DrumSynthesizer {
  private gainNode: Tone.Gain
  private kit: string = '808'

  constructor(gainNode: Tone.Gain) {
    this.gainNode = gainNode
  }

  setKit(kitId: string): void {
    this.kit = kitId
  }

  private createDrumSynthFromComponents(components: DrumComponents): DrumSynth {
    return {
      triggerAttackRelease: (duration: ToneDuration, time?: ToneTime): void => {
        if (time !== undefined) {
          components.envelopes.forEach(env => env.triggerAttackRelease(duration, time))
        } else {
          components.envelopes.forEach(env => env.triggerAttackRelease(duration))
        }
      },
      dispose: (): void => {
        components.envelopes.forEach(env => env.dispose())
        components.oscillators.forEach(osc => osc.dispose())
        components.effects.forEach(effect => effect.dispose())
        components.noiseGenerators.forEach(noise => noise.dispose())
      },
    }
  }

  private create808KickComponents(): DrumComponents {
    // Pitch envelope with aggressive sweep (100Hz → 40Hz) for authentic 808 thump
    const pitchEnv = new Tone.FrequencyEnvelope({
      attack: 0.001,
      decay: 0.05, // Fast pitch decay for punchy attack
      sustain: 0,
      release: 0,
      baseFrequency: 40, // Lower fundamental for deeper sub-bass
      octaves: 1.3, // ~100Hz initial pitch sweep
    })

    // Tighter amplitude envelope for classic 808 punch
    const ampEnv = new Tone.Envelope({
      attack: 0.005,
      decay: 0.4, // Longer decay for extended sub-bass tail
      sustain: 0,
      release: 0.15,
    })

    const osc = new Tone.Oscillator(40, 'sine').start() // Deeper fundamental
    const distortion = new Tone.Distortion(0.5) // More harmonic content
    const lowpass = new Tone.Filter(80, 'lowpass') // Tighter low-pass for pure sub
    const compressor = new Tone.Compressor(-15, 6) // Heavy compression for punch
    const vca = new Tone.Gain()

    // Connect pitch envelope to frequency
    pitchEnv.connect(osc.frequency)

    // Audio chain: Osc → Distortion → Lowpass → Compressor → VCA → Gain
    osc.chain(distortion, lowpass, compressor, vca, this.gainNode)
    ampEnv.connect(vca.gain)

    return {
      envelopes: [pitchEnv, ampEnv],
      oscillators: [osc],
      effects: [distortion, lowpass, compressor, vca],
      noiseGenerators: [],
    }
  }

  create808Kick(): DrumSynth {
    return this.createDrumSynthFromComponents(this.create808KickComponents())
  }

  private create909KickComponents(): DrumComponents {
    // Click component (high-frequency attack)
    const clickEnv = new Tone.Envelope({
      attack: 0.001,
      decay: 0.003,
      sustain: 0,
      release: 0,
    })
    const clickOsc = new Tone.Oscillator(1600, 'sine').start()
    const clickGain = new Tone.Gain(0.3)

    // Body component (low-frequency thump)
    const bodyEnv = new Tone.Envelope({
      attack: 0.01,
      decay: 0.15,
      sustain: 0,
      release: 0.1,
    })
    const bodyOsc = new Tone.Oscillator(60, 'sine').start()
    const bodyGain = new Tone.Gain(0.8)

    // Mix and process
    const mixer = new Tone.Gain()
    const compressor = new Tone.Compressor(-8, 3)
    const lowpass = new Tone.Filter(200, 'lowpass')

    // Connect audio chain
    clickOsc.connect(clickGain)
    clickEnv.connect(clickGain.gain)
    bodyOsc.connect(bodyGain)
    bodyEnv.connect(bodyGain.gain)
    clickGain.connect(mixer)
    bodyGain.connect(mixer)
    mixer.chain(compressor, lowpass, this.gainNode)

    return {
      envelopes: [clickEnv, bodyEnv],
      oscillators: [clickOsc, bodyOsc],
      effects: [clickGain, bodyGain, mixer, compressor, lowpass],
      noiseGenerators: [],
    }
  }

  create909Kick(): DrumSynth {
    const components = this.create909KickComponents()
    return {
      triggerAttackRelease: (duration: ToneDuration, time?: ToneTime): void => {
        // Click envelope uses fixed '8n' duration, body envelope uses provided duration
        if (time !== undefined) {
          components.envelopes[0].triggerAttackRelease('8n', time) // click
          components.envelopes[1].triggerAttackRelease(duration, time) // body
        } else {
          components.envelopes[0].triggerAttackRelease('8n') // click
          components.envelopes[1].triggerAttackRelease(duration) // body
        }
      },
      dispose: (): void => {
        components.envelopes.forEach(env => env.dispose())
        components.oscillators.forEach(osc => osc.dispose())
        components.effects.forEach(effect => effect.dispose())
        components.noiseGenerators.forEach(noise => noise.dispose())
      },
    }
  }

  private create808SnareComponents(): DrumComponents {
    // Noise component
    const noiseEnv = new Tone.Envelope({
      attack: 0.001,
      decay: 0.1,
      sustain: 0,
      release: 0.05,
    })
    const noise = new Tone.Noise('white').start()
    const noiseGain = new Tone.Gain(0.5)

    // Tone component
    const toneEnv = new Tone.Envelope({
      attack: 0.001,
      decay: 0.08,
      sustain: 0,
      release: 0.03,
    })
    const toneOsc = new Tone.Oscillator(200, 'triangle').start()
    const toneGain = new Tone.Gain(0.6)

    // Processing
    const mixer = new Tone.Gain()
    const bandpass = new Tone.Filter(3000, 'bandpass')
    bandpass.Q.value = 5
    const distortion = new Tone.Distortion(0.2)

    // Connect audio chain
    noise.connect(noiseGain)
    noiseEnv.connect(noiseGain.gain)
    toneOsc.connect(toneGain)
    toneEnv.connect(toneGain.gain)
    noiseGain.connect(mixer)
    toneGain.connect(mixer)
    mixer.chain(bandpass, distortion, this.gainNode)

    return {
      envelopes: [noiseEnv, toneEnv],
      oscillators: [toneOsc],
      effects: [noiseGain, toneGain, mixer, bandpass, distortion],
      noiseGenerators: [noise],
    }
  }

  create808Snare(): DrumSynth {
    return this.createDrumSynthFromComponents(this.create808SnareComponents())
  }

  private create909SnareNoiseComponent(): {
    noiseEnv: Tone.Envelope
    noise: Tone.Noise
    noiseGain: Tone.Gain
  } {
    const noiseEnv = new Tone.Envelope({
      attack: 0.0005,
      decay: 0.08,
      sustain: 0.05,
      release: 0.04,
    })
    const noise = new Tone.Noise('white').start()
    const noiseGain = new Tone.Gain(0.8)
    noise.connect(noiseGain)
    noiseEnv.connect(noiseGain.gain)
    return { noiseEnv, noise, noiseGain }
  }

  private create909SnareToneComponents(): {
    tone1Env: Tone.Envelope
    tone1Osc: Tone.Oscillator
    tone1Gain: Tone.Gain
    tone2Env: Tone.Envelope
    tone2Osc: Tone.Oscillator
    tone2Gain: Tone.Gain
  } {
    // Dual-tone fundamental (250Hz + 330Hz)
    const tone1Env = new Tone.Envelope({ attack: 0.0005, decay: 0.04, sustain: 0, release: 0.02 })
    const tone1Osc = new Tone.Oscillator(250, 'triangle').start()
    const tone1Gain = new Tone.Gain(0.35)
    tone1Osc.connect(tone1Gain)
    tone1Env.connect(tone1Gain.gain)

    const tone2Env = new Tone.Envelope({ attack: 0.001, decay: 0.035, sustain: 0, release: 0.015 })
    const tone2Osc = new Tone.Oscillator(330, 'triangle').start()
    const tone2Gain = new Tone.Gain(0.25)
    tone2Osc.connect(tone2Gain)
    tone2Env.connect(tone2Gain.gain)

    return { tone1Env, tone1Osc, tone1Gain, tone2Env, tone2Osc, tone2Gain }
  }

  private create909SnareComponents(): DrumComponents {
    const { noiseEnv, noise, noiseGain } = this.create909SnareNoiseComponent()
    const { tone1Env, tone1Osc, tone1Gain, tone2Env, tone2Osc, tone2Gain } =
      this.create909SnareToneComponents()

    const mixer = new Tone.Gain()
    const highpass = new Tone.Filter(1500, 'highpass')
    const compressor = new Tone.Compressor(-12, 5)

    noiseGain.connect(mixer)
    tone1Gain.connect(mixer)
    tone2Gain.connect(mixer)
    mixer.chain(highpass, compressor, this.gainNode)

    return {
      envelopes: [noiseEnv, tone1Env, tone2Env],
      oscillators: [tone1Osc, tone2Osc],
      effects: [noiseGain, tone1Gain, tone2Gain, mixer, highpass, compressor],
      noiseGenerators: [noise],
    }
  }

  create909Snare(): DrumSynth {
    return this.createDrumSynthFromComponents(this.create909SnareComponents())
  }

  private create808HihatComponents(): DrumComponents {
    const env = new Tone.Envelope({
      attack: 0.001,
      decay: 0.04,
      sustain: 0,
      release: 0.01,
    })

    // Multiple oscillators for metallic sound
    const osc1 = new Tone.Oscillator(8000, 'square').start()
    const osc2 = new Tone.Oscillator(10000, 'square').start()
    const osc3 = new Tone.Oscillator(12000, 'square').start()

    const mixer = new Tone.Gain()
    const highpass = new Tone.Filter(8000, 'highpass')
    const gain = new Tone.Gain(0.3)

    // Connect audio chain
    osc1.connect(mixer)
    osc2.connect(mixer)
    osc3.connect(mixer)
    mixer.chain(highpass, gain, this.gainNode)
    env.connect(gain.gain)

    return {
      envelopes: [env],
      oscillators: [osc1, osc2, osc3],
      effects: [mixer, highpass, gain],
      noiseGenerators: [],
    }
  }

  create808Hihat(): DrumSynth {
    return this.createDrumSynthFromComponents(this.create808HihatComponents())
  }

  create909Hihat(): DrumSynth {
    // Use MetalSynth for authentic metallic sound
    const metalSynth = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 },
      harmonicity: 12,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1,
    })

    const highpass = new Tone.Filter(10000, 'highpass')
    const compressor = new Tone.Compressor(-15, 6)

    metalSynth.chain(highpass, compressor, this.gainNode)

    return {
      triggerAttackRelease: (duration: ToneDuration, time?: ToneTime): void => {
        if (time !== undefined) {
          metalSynth.triggerAttackRelease('C6', duration, time)
        } else {
          metalSynth.triggerAttackRelease('C6', duration)
        }
      },
      dispose: (): void => {
        metalSynth.dispose()
        highpass.dispose()
        compressor.dispose()
      },
    }
  }

  createDrumSynth(drumType: 'kick' | 'snare' | 'hihat' | 'openhat'): DrumSynth | null {
    switch (this.kit) {
      case '808':
        return this.create808DrumType(drumType)
      case '909':
        return this.create909DrumType(drumType)
      default:
        return null
    }
  }

  private create808DrumType(drumType: 'kick' | 'snare' | 'hihat' | 'openhat'): DrumSynth | null {
    switch (drumType) {
      case 'kick':
        return this.create808Kick()
      case 'snare':
        return this.create808Snare()
      case 'hihat':
        return this.create808Hihat()
      case 'openhat':
        return this.create808Hihat() // Use same as hihat with longer decay
      default:
        return null
    }
  }

  private create909DrumType(drumType: 'kick' | 'snare' | 'hihat' | 'openhat'): DrumSynth | null {
    switch (drumType) {
      case 'kick':
        return this.create909Kick()
      case 'snare':
        return this.create909Snare()
      case 'hihat':
        return this.create909Hihat()
      case 'openhat':
        return this.create909Hihat() // Use same as hihat with longer decay
      default:
        return null
    }
  }
}
