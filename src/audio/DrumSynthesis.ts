import * as Tone from 'tone'

export interface DrumKit {
  id: string
  name: string
  description: string
}

export const DRUM_KITS: DrumKit[] = [
  { id: '808', name: 'TR-808', description: 'Classic analog drum machine sounds' },
  { id: '909', name: 'TR-909', description: 'Punchy house and techno drums' },
  { id: 'acoustic', name: 'Acoustic', description: 'Natural drum kit sounds' },
  { id: 'electronic', name: 'Electronic', description: 'Modern electronic drums' }
]

export class DrumSynthesizer {
  private gainNode: Tone.Gain
  private kit: string = '808'

  constructor(gainNode: Tone.Gain) {
    this.gainNode = gainNode
  }

  setKit(kitId: string) {
    this.kit = kitId
  }

  // 808 KICK - Deep sub bass with pitch envelope
  create808Kick(): any {
    const pitchEnv = new Tone.Envelope({
      attack: 0.01,
      decay: 0.08,
      sustain: 0,
      release: 0
    })

    const ampEnv = new Tone.Envelope({
      attack: 0.01,
      decay: 0.3,
      sustain: 0,
      release: 0.2
    })

    const osc = new Tone.Oscillator(60, 'sine').start()
    const distortion = new Tone.Distortion(0.4)
    const lowpass = new Tone.Filter(100, 'lowpass')
    const compressor = new Tone.Compressor(-12, 4)

    // Connect pitch envelope to frequency
    pitchEnv.connect(osc.frequency)

    // Audio chain: Osc → Distortion → Lowpass → Compressor → Gain
    osc.chain(distortion, lowpass, compressor, this.gainNode)

    // Connect amplitude envelope to compressor output
    const vca = new Tone.Gain()
    compressor.connect(vca)
    ampEnv.connect(vca.gain)
    vca.connect(this.gainNode)

    return {
      triggerAttackRelease: (duration: string, time?: string) => {
        const triggerTime = time || undefined
        pitchEnv.triggerAttackRelease(duration, triggerTime)
        ampEnv.triggerAttackRelease(duration, triggerTime)
      },
      dispose: () => {
        osc.dispose()
        pitchEnv.dispose()
        ampEnv.dispose()
        distortion.dispose()
        lowpass.dispose()
        compressor.dispose()
        vca.dispose()
      }
    }
  }

  // 909 KICK - Punchy with click attack
  create909Kick(): any {
    // Click component (high-frequency attack)
    const clickEnv = new Tone.Envelope({
      attack: 0.001,
      decay: 0.003,
      sustain: 0,
      release: 0
    })
    const clickOsc = new Tone.Oscillator(1600, 'sine').start()
    const clickGain = new Tone.Gain(0.3)
    clickOsc.connect(clickGain)
    clickEnv.connect(clickGain.gain)

    // Body component (low-frequency thump)
    const bodyEnv = new Tone.Envelope({
      attack: 0.01,
      decay: 0.15,
      sustain: 0,
      release: 0.1
    })
    const bodyOsc = new Tone.Oscillator(60, 'sine').start()
    const bodyGain = new Tone.Gain(0.8)
    bodyOsc.connect(bodyGain)
    bodyEnv.connect(bodyGain.gain)

    // Mix and process
    const mixer = new Tone.Gain()
    const compressor = new Tone.Compressor(-8, 3)
    const lowpass = new Tone.Filter(200, 'lowpass')

    clickGain.connect(mixer)
    bodyGain.connect(mixer)
    mixer.chain(compressor, lowpass, this.gainNode)

    return {
      triggerAttackRelease: (duration: string, time?: string) => {
        const triggerTime = time || undefined
        clickEnv.triggerAttackRelease('8n', triggerTime)
        bodyEnv.triggerAttackRelease(duration, triggerTime)
      },
      dispose: () => {
        clickOsc.dispose()
        bodyOsc.dispose()
        clickEnv.dispose()
        bodyEnv.dispose()
        clickGain.dispose()
        bodyGain.dispose()
        mixer.dispose()
        compressor.dispose()
        lowpass.dispose()
      }
    }
  }

  // 808 SNARE - Layered noise and tone
  create808Snare(): any {
    // Noise component
    const noiseEnv = new Tone.Envelope({
      attack: 0.001,
      decay: 0.1,
      sustain: 0,
      release: 0.05
    })
    const noise = new Tone.Noise('white').start()
    const noiseGain = new Tone.Gain(0.5)
    noise.connect(noiseGain)
    noiseEnv.connect(noiseGain.gain)

    // Tone component
    const toneEnv = new Tone.Envelope({
      attack: 0.001,
      decay: 0.08,
      sustain: 0,
      release: 0.03
    })
    const toneOsc = new Tone.Oscillator(200, 'triangle').start()
    const toneGain = new Tone.Gain(0.6)
    toneOsc.connect(toneGain)
    toneEnv.connect(toneGain.gain)

    // Processing
    const mixer = new Tone.Gain()
    const bandpass = new Tone.Filter(3000, 'bandpass')
    bandpass.Q.value = 5
    const distortion = new Tone.Distortion(0.2)

    noiseGain.connect(mixer)
    toneGain.connect(mixer)
    mixer.chain(bandpass, distortion, this.gainNode)

    return {
      triggerAttackRelease: (duration: string, time?: string) => {
        const triggerTime = time || undefined
        noiseEnv.triggerAttackRelease(duration, triggerTime)
        toneEnv.triggerAttackRelease(duration, triggerTime)
      },
      dispose: () => {
        noise.dispose()
        toneOsc.dispose()
        noiseEnv.dispose()
        toneEnv.dispose()
        noiseGain.dispose()
        toneGain.dispose()
        mixer.dispose()
        bandpass.dispose()
        distortion.dispose()
      }
    }
  }

  // 909 SNARE - Crispy and punchy
  create909Snare(): any {
    // High-frequency noise burst
    const noiseEnv = new Tone.Envelope({
      attack: 0.001,
      decay: 0.06,
      sustain: 0,
      release: 0.02
    })
    const noise = new Tone.Noise('white').start()
    const noiseGain = new Tone.Gain(0.7)
    noise.connect(noiseGain)
    noiseEnv.connect(noiseGain.gain)

    // Fundamental tone
    const toneEnv = new Tone.Envelope({
      attack: 0.001,
      decay: 0.05,
      sustain: 0,
      release: 0.02
    })
    const toneOsc = new Tone.Oscillator(250, 'triangle').start()
    const toneGain = new Tone.Gain(0.4)
    toneOsc.connect(toneGain)
    toneEnv.connect(toneGain.gain)

    // Processing
    const mixer = new Tone.Gain()
    const highpass = new Tone.Filter(2000, 'highpass')
    const compressor = new Tone.Compressor(-10, 4)

    noiseGain.connect(mixer)
    toneGain.connect(mixer)
    mixer.chain(highpass, compressor, this.gainNode)

    return {
      triggerAttackRelease: (duration: string, time?: string) => {
        const triggerTime = time || undefined
        noiseEnv.triggerAttackRelease(duration, triggerTime)
        toneEnv.triggerAttackRelease(duration, triggerTime)
      },
      dispose: () => {
        noise.dispose()
        toneOsc.dispose()
        noiseEnv.dispose()
        toneEnv.dispose()
        noiseGain.dispose()
        toneGain.dispose()
        mixer.dispose()
        highpass.dispose()
        compressor.dispose()
      }
    }
  }

  // 808 HI-HAT - Metallic and sharp
  create808Hihat(): any {
    const env = new Tone.Envelope({
      attack: 0.001,
      decay: 0.04,
      sustain: 0,
      release: 0.01
    })

    // Multiple oscillators for metallic sound
    const osc1 = new Tone.Oscillator(8000, 'square').start()
    const osc2 = new Tone.Oscillator(10000, 'square').start()
    const osc3 = new Tone.Oscillator(12000, 'square').start()

    const mixer = new Tone.Gain()
    const highpass = new Tone.Filter(8000, 'highpass')
    const gain = new Tone.Gain(0.3)

    osc1.connect(mixer)
    osc2.connect(mixer)
    osc3.connect(mixer)
    mixer.chain(highpass, gain, this.gainNode)
    env.connect(gain.gain)

    return {
      triggerAttackRelease: (duration: string, time?: string) => {
        const triggerTime = time || undefined
        env.triggerAttackRelease(duration, triggerTime)
      },
      dispose: () => {
        osc1.dispose()
        osc2.dispose()
        osc3.dispose()
        env.dispose()
        mixer.dispose()
        highpass.dispose()
        gain.dispose()
      }
    }
  }

  // 909 HI-HAT - Bright and crispy
  create909Hihat(): any {
    // Use MetalSynth for authentic metallic sound
    const metalSynth = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 },
      harmonicity: 12,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1
    })

    const highpass = new Tone.Filter(10000, 'highpass')
    const compressor = new Tone.Compressor(-15, 6)

    metalSynth.chain(highpass, compressor, this.gainNode)

    return {
      triggerAttackRelease: (duration: string, time?: string) => {
        metalSynth.triggerAttackRelease('C6', duration, time)
      },
      dispose: () => {
        metalSynth.dispose()
        highpass.dispose()
        compressor.dispose()
      }
    }
  }

  // Create drum synth based on current kit
  createDrumSynth(drumType: 'kick' | 'snare' | 'hihat' | 'openhat'): any {
    switch (this.kit) {
      case '808':
        switch (drumType) {
          case 'kick': return this.create808Kick()
          case 'snare': return this.create808Snare()
          case 'hihat': return this.create808Hihat()
          case 'openhat': return this.create808Hihat() // Use same as hihat with longer decay
          default: return null
        }
      case '909':
        switch (drumType) {
          case 'kick': return this.create909Kick()
          case 'snare': return this.create909Snare()
          case 'hihat': return this.create909Hihat()
          case 'openhat': return this.create909Hihat() // Use same as hihat with longer decay
          default: return null
        }
      default:
        // Fallback to original implementation
        return null
    }
  }
}