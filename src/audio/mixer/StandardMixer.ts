// Standard mixer implementation for modular architecture

import * as Tone from 'tone'
import type {
  MixerInterface,
  MixerTrack,
  InstrumentInterface,
  EffectsChain,
} from '../../types/instruments'
import { StandardEffectsChain } from '../effects/EffectsChain'

export class StandardMixerTrack implements MixerTrack {
  readonly id: string
  readonly name: string

  private instrument: InstrumentInterface | null = null
  private effectsChain: EffectsChain
  private trackGain: Tone.Gain
  private panNode: Tone.Panner
  private outputGain: Tone.Gain

  private _volume = 0.8
  private _pan = 0
  private _muted = false
  private _soloed = false

  constructor(id: string, name: string) {
    this.id = id
    this.name = name

    // Create audio chain: trackGain -> panNode -> effectsChain -> outputGain
    this.trackGain = new Tone.Gain(this._volume)
    this.panNode = new Tone.Panner(this._pan)
    this.outputGain = new Tone.Gain(1)

    // Create effects chain
    this.effectsChain = new StandardEffectsChain(`${id}_effects`)

    // Connect the chain
    this.trackGain.connect(this.panNode)
    this.effectsChain.connect(this.panNode)
    this.effectsChain.getOutput().connect(this.outputGain)
  }

  setInstrument(instrument: InstrumentInterface): void {
    // Disconnect previous instrument
    if (this.instrument) {
      this.instrument.getOutput().disconnect(this.trackGain)
    }

    this.instrument = instrument

    // Connect new instrument
    if (instrument) {
      instrument.getOutput().connect(this.trackGain)
      // Also connect instrument to its own effects chain
      instrument.connectToEffectsChain(this.effectsChain)
    }
  }

  getInstrument(): InstrumentInterface | null {
    return this.instrument
  }

  setVolume(volume: number): void {
    this._volume = Math.max(0, Math.min(1, volume))
    this.trackGain.gain.value = this._muted ? 0 : this._volume
  }

  getVolume(): number {
    return this._volume
  }

  setPan(pan: number): void {
    this._pan = Math.max(-1, Math.min(1, pan))
    this.panNode.pan.value = this._pan
  }

  getPan(): number {
    return this._pan
  }

  mute(): void {
    this._muted = true
    this.trackGain.gain.value = 0
  }

  unmute(): void {
    this._muted = false
    this.trackGain.gain.value = this._volume
  }

  isMuted(): boolean {
    return this._muted
  }

  solo(): void {
    this._soloed = true
  }

  unsolo(): void {
    this._soloed = false
  }

  isSoloed(): boolean {
    return this._soloed
  }

  getEffectsChain(): EffectsChain {
    return this.effectsChain
  }

  getOutput(): Tone.ToneAudioNode {
    return this.outputGain
  }

  dispose(): void {
    if (this.instrument) {
      this.instrument.disconnectFromEffectsChain()
      this.instrument.getOutput().disconnect()
    }

    this.effectsChain.dispose()
    this.trackGain.dispose()
    this.panNode.dispose()
    this.outputGain.dispose()
  }
}

export class StandardMixer implements MixerInterface {
  private tracks: Map<string, MixerTrack> = new Map()
  private masterGain: Tone.Gain
  private masterOutput: Tone.Gain
  private _masterVolume = 0.8

  constructor() {
    this.masterGain = new Tone.Gain(this._masterVolume)
    this.masterOutput = new Tone.Gain(1)

    // Connect master chain
    this.masterGain.connect(this.masterOutput)
  }

  createTrack(id: string, name: string): MixerTrack {
    if (this.tracks.has(id)) {
      throw new Error(`Track with id '${id}' already exists`)
    }

    const track = new StandardMixerTrack(id, name)
    this.tracks.set(id, track)

    // Connect track to master
    track.getOutput().connect(this.masterGain)

    return track
  }

  getTrack(id: string): MixerTrack | null {
    return this.tracks.get(id) || null
  }

  getAllTracks(): MixerTrack[] {
    return Array.from(this.tracks.values())
  }

  removeTrack(id: string): void {
    const track = this.tracks.get(id)
    if (track) {
      // Disconnect from master
      track.getOutput().disconnect(this.masterGain)

      // Dispose track
      track.dispose()

      // Remove from map
      this.tracks.delete(id)
    }
  }

  setMasterVolume(volume: number): void {
    this._masterVolume = Math.max(0, Math.min(1, volume))
    this.masterGain.gain.value = this._masterVolume
  }

  getMasterVolume(): number {
    return this._masterVolume
  }

  hasAnyTrackSoloed(): boolean {
    return Array.from(this.tracks.values()).some(track => track.isSoloed())
  }

  getActiveTrackOutput(): Tone.ToneAudioNode[] {
    const hasAnyMuted = this.hasAnyTrackSoloed()

    return Array.from(this.tracks.values())
      .filter(track => {
        if (track.isMuted()) return false
        if (hasAnyMuted && !track.isSoloed()) return false
        return true
      })
      .map(track => track.getOutput())
  }

  getMasterOutput(): Tone.ToneAudioNode {
    return this.masterOutput
  }

  dispose(): void {
    // Dispose all tracks
    for (const track of this.tracks.values()) {
      track.dispose()
    }
    this.tracks.clear()

    // Dispose master chain
    this.masterGain.dispose()
    this.masterOutput.dispose()
  }

  // Helper method to connect mixer to destination (speakers)
  connectToDestination(): void {
    this.masterOutput.toDestination()
  }

  // Helper method to get track by instrument
  getTrackByInstrument(instrument: InstrumentInterface): MixerTrack | null {
    for (const track of this.tracks.values()) {
      if (track.getInstrument() === instrument) {
        return track
      }
    }
    return null
  }

  // Helper method to set solo exclusive (only one track can be soloed)
  setSoloExclusive(trackId: string): void {
    // Unsolo all tracks first
    for (const track of this.tracks.values()) {
      track.unsolo()
    }

    // Solo the specified track
    const track = this.getTrack(trackId)
    if (track) {
      track.solo()
    }
  }

  // Helper method to get mixer state for saving/loading
  getState(): {
    masterVolume: number
    tracks: Array<{ id: string; volume: number; pan: number; muted: boolean; soloed: boolean }>
  } {
    return {
      masterVolume: this._masterVolume,
      tracks: Array.from(this.tracks.entries()).map(([id, track]) => ({
        id,
        name: track.name,
        volume: track.getVolume(),
        pan: track.getPan(),
        muted: track.isMuted(),
        soloed: track.isSoloed(),
        instrumentId: track.getInstrument()?.id || null,
      })),
    }
  }
}
