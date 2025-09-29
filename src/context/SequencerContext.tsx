/* eslint-disable max-lines, max-lines-per-function, @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-misused-promises, security/detect-object-injection, react-hooks/exhaustive-deps, react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import * as Tone from 'tone'
import { DrumSynthesizer, DRUM_KITS } from '../audio/DrumSynthesis'
import type { ToneDuration, ToneTime } from '../types/audio'
import { mobileAudioManager } from '../audio/MobileAudioFix'
import { SCALES, KEYS, getNoteForRow } from '../utils/scales'
import type {
  Cell,
  DrumPattern,
  Scale,
  Key,
  SequencerContextType,
  SequencerProviderProps,
  ScheduledEvent,
  SynthParameters,
  EffectParameters,
} from '../types'

import type { DrumSynthCollection, CharacterPatchCollection } from '../types/audio'

const SequencerContext = createContext<SequencerContextType | undefined>(undefined)

export const useSequencer = () => {
  const context = useContext(SequencerContext)
  if (!context) {
    throw new Error('useSequencer must be used within SequencerProvider')
  }
  return context
}

export const SequencerProvider: React.FC<SequencerProviderProps> = ({ children }) => {
  // Initialize 16x16 grid
  const initGrid = () =>
    Array(16)
      .fill(null)
      .map(() =>
        Array(16)
          .fill(null)
          .map(() => ({ active: false, velocity: 0.8 }))
      )

  const [grid, setGrid] = useState<Cell[][]>(initGrid)
  const gridRef = useRef<Cell[][]>(initGrid())
  const [isPlaying, setIsPlaying] = useState(false)
  const isPlayingRef = useRef(false) // Add ref for scheduler to check
  const [tempo, setTempo] = useState(120)
  const [currentStep, setCurrentStep] = useState(0)

  // Scheduled events tracking
  const scheduledEventsRef = useRef<ScheduledEvent[]>([])
  const lookaheadTimeRef = useRef(100) // ms
  const scheduleIntervalRef = useRef<number | null>(null)
  const nextStepTimeRef = useRef(0)
  const currentStepRef = useRef(0)

  // Enhanced timing features
  const swingAmount = useRef(0) // 0-100% swing amount
  const microTimingEnabled = useRef(true) // High precision timing
  const timingAnalysis = useRef({
    averageLatency: 0,
    jitter: 0,
    missedEvents: 0,
    totalEvents: 0,
  })

  // Individual track controls
  const [trackControls, setTrackControls] = useState({
    melody: {
      volume: 0.8,
      muted: false,
      solo: false,
      pan: 0, // -1 to 1
      reverb: 0,
      delay: 0,
      chorus: 0,
      wahFilter: 0,
    },
    kick: {
      volume: 0.9,
      muted: false,
      solo: false,
      pan: 0,
      reverb: 0,
      delay: 0,
      chorus: 0,
      wahFilter: 0,
    },
    snare: {
      volume: 0.8,
      muted: false,
      solo: false,
      pan: 0,
      reverb: 0,
      delay: 0,
      chorus: 0,
      wahFilter: 0,
    },
    hihat: {
      volume: 0.6,
      muted: false,
      solo: false,
      pan: 0.2,
      reverb: 0,
      delay: 0,
      chorus: 0,
      wahFilter: 0,
    },
    openhat: {
      volume: 0.7,
      muted: false,
      solo: false,
      pan: -0.2,
      reverb: 0,
      delay: 0,
      chorus: 0,
      wahFilter: 0,
    },
  })

  // Track effect chains - refs for real-time audio control
  const trackEffectsRef = useRef<{
    [key: string]: {
      gain: Tone.Gain
      panner: Tone.Panner3D | Tone.Panner
      reverb: Tone.Reverb
      delay: Tone.FeedbackDelay
      chorus: Tone.Chorus
      wahFilter: Tone.AutoWah
    }
  }>({})

  const [synthParams, setSynthParams] = useState<SynthParameters>({
    brightness: 50,
    texture: 20,
    attack: 0.01,
    decay: 0.1,
    sustain: 0.5,
    release: 0.3,
    volume: -12,
    waveform: 'sawtooth',
    character: 'default',
    // Enhanced synthesis parameters
    detune: 0, // Pitch detune in cents
    portamento: 0, // Glide time between notes
    filterCutoff: 2000, // Filter frequency
    filterResonance: 1, // Filter Q factor
    filterEnvAmount: 0, // Filter envelope amount
    lfoRate: 4, // LFO frequency
    lfoAmount: 0, // LFO modulation depth
    lfoTarget: 'frequency', // LFO target
    // Oscillator mixing
    oscMix: 0.5, // Mix between main and sub oscillator
    subOscType: 'triangle', // Sub oscillator waveform
    noiseLevel: 0, // Noise generator level
  })

  const [effectsParams, setEffectsParams] = useState<EffectParameters>({
    reverb: 0,
    delay: 0,
    chorus: 0,
    wahFilter: 0,
  })

  const [drumEnabled, setDrumEnabled] = useState(false)
  const [drumVolume, setDrumVolume] = useState(-6)
  const [currentDrumPattern, setCurrentDrumPattern] = useState('hiphop1')
  const [currentDrumKit, setCurrentDrumKit] = useState('808')

  // Scale and key state
  const [currentScale, setCurrentScaleState] = useState<Scale | null>(
    SCALES.find(s => s.id === 'pentatonic') || SCALES[0]
  )
  const [currentKey, setCurrentKeyState] = useState<Key | null>(
    KEYS.find(k => k.id === 'c') || KEYS[0]
  )

  const synthRef = useRef<Tone.PolySynth | null>(null)
  const drumSynthsRef = useRef<DrumSynthCollection>({})
  const drumSynthesizerRef = useRef<DrumSynthesizer | null>(null)
  const drumGainRef = useRef<Tone.Gain | null>(null)
  const drumEnabledRef = useRef(drumEnabled)
  const currentDrumPatternRef = useRef(currentDrumPattern)
  const currentDrumKitRef = useRef(currentDrumKit)
  const currentScaleRef = useRef<Scale | null>(SCALES.find(s => s.id === 'pentatonic') || SCALES[0])
  const currentKeyRef = useRef<Key | null>(KEYS.find(k => k.id === 'c') || KEYS[0])

  // Effects refs
  const reverbRef = useRef<Tone.Reverb | null>(null)
  const delayRef = useRef<Tone.FeedbackDelay | null>(null)
  const chorusRef = useRef<Tone.Chorus | null>(null)
  const wahFilterRef = useRef<Tone.AutoWah | null>(null)

  // Drum patterns database
  const drumPatterns: DrumPattern[] = [
    // Hip Hop
    {
      id: 'hiphop1',
      name: 'BOOM BAP',
      genre: 'Hip Hop',
      kit: 'classic',
      pattern: [
        [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], // kick
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // snare
        [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0], // hihat
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1], // openhat
      ],
    },
    {
      id: 'hiphop2',
      name: 'TRAP',
      genre: 'Hip Hop',
      kit: 'modern',
      pattern: [
        [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0], // kick
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0], // snare
        [1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1], // hihat
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // openhat
      ],
    },
    // Add other patterns...
  ]

  // Enhanced lookahead scheduler function with swing and timing analysis
  const scheduler = useCallback(() => {
    if (!isPlayingRef.current) {
      return
    }

    const currentTime = Tone.context.currentTime
    const lookaheadTime = lookaheadTimeRef.current / 1000 // Convert to seconds

    // Schedule all steps that fall within the lookahead window
    while (nextStepTimeRef.current < currentTime + lookaheadTime) {
      const step = currentStepRef.current

      // Check if this step hasn't been scheduled yet
      const alreadyScheduled = scheduledEventsRef.current.some(
        event => event.step === step && event.time === nextStepTimeRef.current && !event.executed
      )

      if (!alreadyScheduled) {
        // Calculate swing timing for off-beat steps
        let swingOffset = 0
        const isOffBeat = step % 2 === 1
        if (isOffBeat && swingAmount.current > 0) {
          const maxSwing = (60.0 / tempo / 4) * 0.33 // Max 33% of step length
          swingOffset = maxSwing * (swingAmount.current / 100)
        }

        const adjustedTime = nextStepTimeRef.current + swingOffset
        scheduleStep(step, adjustedTime)

        scheduledEventsRef.current.push({
          time: adjustedTime,
          step,
          executed: false,
        })

        // Update timing analysis
        timingAnalysis.current.totalEvents++
      }

      // Advance to next step with micro-timing precision
      const baseStepTime = 60.0 / tempo / 4 // Each step = 16th note (1/4 beat)
      const stepTime = microTimingEnabled.current
        ? baseStepTime * (1 + (Math.random() - 0.5) * 0.001) // ±0.05% micro timing
        : baseStepTime

      nextStepTimeRef.current += stepTime
      currentStepRef.current = (currentStepRef.current + 1) % 16
    }

    // Clean up old scheduled events and analyze timing
    const eventsToRemove = scheduledEventsRef.current.filter(event => event.time <= currentTime - 1)

    // Update jitter analysis
    if (eventsToRemove.length > 0) {
      const latencies = eventsToRemove.map(event => Math.abs(event.time - currentTime))
      const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length
      timingAnalysis.current.averageLatency = avgLatency
      timingAnalysis.current.jitter = Math.sqrt(
        latencies.reduce((sum, lat) => sum + Math.pow(lat - avgLatency, 2), 0) / latencies.length
      )
    }

    scheduledEventsRef.current = scheduledEventsRef.current.filter(
      event => event.time > currentTime - 1
    )
  }, [isPlaying, tempo])

  const scheduleStep = useCallback(
    (step: number, time: number) => {
      // Schedule UI update with slight anticipation for visual sync
      Tone.Draw.schedule(() => {
        setCurrentStep(step)
      }, time - 0.01) // 10ms early for visual feedback

      // Schedule audio events
      const transportTime = time - Tone.context.currentTime

      // Play melody notes using current scale and key
      for (let row = 0; row < 16; row++) {
        const cell = gridRef.current[row][step]
        if (cell.active && currentScaleRef.current && currentKeyRef.current) {
          const note = getNoteForRow(row, currentScaleRef.current, currentKeyRef.current)

          if (synthRef.current) {
            synthRef.current.triggerAttackRelease(note, '16n', `+${transportTime}`, cell.velocity)
          }
        }
      }

      // Play drums if enabled
      if (drumEnabledRef.current && drumSynthsRef.current) {
        const currentPattern = drumPatterns.find(p => p.id === currentDrumPatternRef.current)
        if (currentPattern) {
          const drumNames = ['kick', 'snare', 'hihat', 'openhat']

          drumNames.forEach((drumName, drumIndex) => {
            if (currentPattern.pattern[drumIndex][step] === 1) {
              const synth = drumSynthsRef.current[drumName]
              if (synth) {
                // Schedule with precise timing - all drums use (duration, time) interface
                if (synth.triggerAttackRelease) {
                  synth.triggerAttackRelease('16n', `+${transportTime}` as ToneTime)
                }
              }
            }
          })
        }
      }
    },
    [drumPatterns]
  )

  // Initialize mobile audio unlock listeners
  useEffect(() => {
    mobileAudioManager.addUnlockListeners()

    return () => {
      mobileAudioManager.removeUnlockListeners()
    }
  }, [])

  // Audio initialization flag
  const audioInitialized = useRef(false)

  // Initialize individual track effect chains
  const initializeTrackEffects = useCallback(() => {
    const tracks = ['melody', 'kick', 'snare', 'hihat', 'openhat']

    tracks.forEach(trackId => {
      // Create effect chain for each track
      const gain = new Tone.Gain(trackControls[trackId as keyof typeof trackControls].volume)
      const panner = new Tone.Panner(trackControls[trackId as keyof typeof trackControls].pan)
      const reverb = new Tone.Reverb(0.8)
      const delay = new Tone.FeedbackDelay('8n', 0.3)
      const chorus = new Tone.Chorus(4, 2.5, 0.5)
      const wahFilter = new Tone.AutoWah(50, 6, 0)

      // Set initial effect levels
      reverb.wet.value = trackControls[trackId as keyof typeof trackControls].reverb / 100
      delay.wet.value = trackControls[trackId as keyof typeof trackControls].delay / 100
      chorus.wet.value = 0 // Default off since not exposed in TrackControl interface
      wahFilter.wet.value = 0 // Default off since not exposed in TrackControl interface

      // Chain effects: gain -> panner -> wahFilter -> chorus -> delay -> reverb -> destination
      gain.chain(panner, wahFilter, chorus, delay, reverb, Tone.Destination)

      trackEffectsRef.current[trackId] = {
        gain,
        panner,
        reverb,
        delay,
        chorus,
        wahFilter,
      }
    })
  }, [trackControls])

  // Initialize audio objects only when needed (lazy initialization)
  const initializeAudio = useCallback(() => {
    if (audioInitialized.current) return

    // Initialize individual track effects first
    initializeTrackEffects()

    // Create master effects chain (kept for backwards compatibility)
    reverbRef.current = new Tone.Reverb(0.8)
    delayRef.current = new Tone.FeedbackDelay('8n', 0.3)
    chorusRef.current = new Tone.Chorus(4, 2.5, 0.5)
    wahFilterRef.current = new Tone.AutoWah(50, 6, 0)

    // Set initial effects levels (all off)
    reverbRef.current.wet.value = 0
    delayRef.current.wet.value = 0
    chorusRef.current.wet.value = 0
    wahFilterRef.current.wet.value = 0

    // Create enhanced synth with filter and LFO
    synthRef.current = new Tone.PolySynth(Tone.MonoSynth, {
      oscillator: { type: synthParams.waveform as 'sine' | 'square' | 'sawtooth' | 'triangle' },
      envelope: {
        attack: synthParams.attack,
        decay: synthParams.decay,
        sustain: synthParams.sustain,
        release: synthParams.release,
      },
      filter: {
        Q: synthParams.filterResonance,
        frequency: synthParams.filterCutoff,
        type: 'lowpass',
      },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.5,
        release: 1,
        baseFrequency: synthParams.filterCutoff,
        octaves: synthParams.filterEnvAmount,
      },
    })

    // Connect synth through melody track effects
    if (trackEffectsRef.current.melody) {
      synthRef.current.connect(trackEffectsRef.current.melody.gain)
    }

    // Initialize drum gain node (master drum volume control)
    drumGainRef.current = new Tone.Gain(Tone.dbToGain(drumVolume)).toDestination()

    // Initialize drum synthesizer
    drumSynthesizerRef.current = new DrumSynthesizer(drumGainRef.current)
    drumSynthesizerRef.current.setKit(currentDrumKit)

    // Initialize drum synthesizers with improved sounds
    initializeDrumSynths()

    audioInitialized.current = true
  }, [drumVolume, initializeTrackEffects])

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (scheduleIntervalRef.current) {
        clearInterval(scheduleIntervalRef.current)
      }
      if (synthRef.current) synthRef.current.dispose()
      disposeDrumSynths()
      if (drumGainRef.current) drumGainRef.current.dispose()
      if (reverbRef.current) reverbRef.current.dispose()
      if (delayRef.current) delayRef.current.dispose()
      if (chorusRef.current) chorusRef.current.dispose()
      if (wahFilterRef.current) wahFilterRef.current.dispose()
    }
  }, [])

  const initializeDrumSynths = useCallback(() => {
    if (!drumSynthesizerRef.current || !drumGainRef.current) return

    // Create drum synths using fallback implementations that properly connect to track effects
    // Note: DrumSynthesizer class connections bypass individual track effects,
    // so we use fallback drums that connect to the correct track effects chains
    const drumSynths = {
      kick: createFallbackKick(),
      snare: createFallbackSnare(),
      hihat: createFallbackHihat(),
      openhat: createFallbackOpenhat(),
    }

    // Note: Drum track connections are handled in the fallback drum functions
    // The DrumSynthesizer class connects directly to drumGainRef by design

    drumSynthsRef.current = drumSynths
  }, [])

  // Fallback drum implementations (simplified versions)
  const createFallbackKick = () => {
    const synth = new Tone.MembraneSynth()
    // Connect to kick track effects by default
    const kickEffects = trackEffectsRef.current.kick
    if (kickEffects) {
      synth.connect(kickEffects.gain)
    }
    return {
      triggerAttackRelease: (duration: ToneDuration, time?: ToneTime) => {
        if (time !== undefined) {
          synth.triggerAttackRelease('C1', duration, time)
        } else {
          synth.triggerAttackRelease('C1', duration)
        }
      },
      connect: (destination: Tone.InputNode) => synth.connect(destination),
      disconnect: () => synth.disconnect(),
      dispose: () => synth.dispose(),
    }
  }

  const createFallbackSnare = () => {
    const synth = new Tone.NoiseSynth()
    // Connect to snare track effects by default
    const snareEffects = trackEffectsRef.current.snare
    if (snareEffects) {
      synth.connect(snareEffects.gain)
    }
    return {
      triggerAttackRelease: (duration: ToneDuration, time?: ToneTime) => {
        if (time !== undefined) {
          synth.triggerAttackRelease(duration, time)
        } else {
          synth.triggerAttackRelease(duration)
        }
      },
      connect: (destination: Tone.InputNode) => synth.connect(destination),
      disconnect: () => synth.disconnect(),
      dispose: () => synth.dispose(),
    }
  }

  const createFallbackHihat = () => {
    const synth = new Tone.MetalSynth()
    // Connect to hihat track effects by default
    const hihatEffects = trackEffectsRef.current.hihat
    if (hihatEffects) {
      synth.connect(hihatEffects.gain)
    }
    return {
      triggerAttackRelease: (duration: ToneDuration, time?: ToneTime) => {
        if (time !== undefined) {
          synth.triggerAttackRelease('C5', duration, time)
        } else {
          synth.triggerAttackRelease('C5', duration)
        }
      },
      connect: (destination: Tone.InputNode) => synth.connect(destination),
      disconnect: () => synth.disconnect(),
      dispose: () => synth.dispose(),
    }
  }

  const createFallbackOpenhat = () => {
    const synth = new Tone.MetalSynth()
    // Connect to openhat track effects by default
    const openhatEffects = trackEffectsRef.current.openhat
    if (openhatEffects) {
      synth.connect(openhatEffects.gain)
    }
    return {
      triggerAttackRelease: (duration: ToneDuration, time?: ToneTime) => {
        if (time !== undefined) {
          synth.triggerAttackRelease('C5', duration, time)
        } else {
          synth.triggerAttackRelease('C5', duration)
        }
      },
      connect: (destination: Tone.InputNode) => synth.connect(destination),
      disconnect: () => synth.disconnect(),
      dispose: () => synth.dispose(),
    }
  }

  const disposeDrumSynths = () => {
    // Cleanup drum synths
    const drumSynths = drumSynthsRef.current
    Object.keys(drumSynths).forEach(key => {
      const synth = drumSynths[key]
      if (synth && synth.dispose) {
        synth.dispose()
      }
    })
  }

  // Keep drum refs updated
  useEffect(() => {
    drumEnabledRef.current = drumEnabled
  }, [drumEnabled])

  useEffect(() => {
    currentDrumPatternRef.current = currentDrumPattern
  }, [currentDrumPattern])

  useEffect(() => {
    currentDrumKitRef.current = currentDrumKit
    if (drumSynthesizerRef.current) {
      drumSynthesizerRef.current.setKit(currentDrumKit)
      // Reinitialize drum synths with new kit
      disposeDrumSynths()
      initializeDrumSynths()
    }
  }, [currentDrumKit])

  // Keep scale and key refs updated
  useEffect(() => {
    currentScaleRef.current = currentScale
  }, [currentScale])

  useEffect(() => {
    currentKeyRef.current = currentKey
  }, [currentKey])

  const toggleCell = useCallback((row: number, col: number, shiftKey = false) => {
    const newGrid = [...gridRef.current]
    newGrid[row] = [...newGrid[row]]
    const currentCell = newGrid[row][col]

    if (shiftKey) {
      // Shift+click: cycle through velocity levels (if active)
      if (currentCell.active) {
        if (currentCell.velocity === 0.3) {
          newGrid[row][col] = { active: true, velocity: 0.7 }
        } else if (currentCell.velocity === 0.7) {
          newGrid[row][col] = { active: true, velocity: 1.0 }
        } else {
          newGrid[row][col] = { active: true, velocity: 0.3 }
        }
      } else {
        // If not active, activate with default velocity
        newGrid[row][col] = { active: true, velocity: 0.7 }
      }
    } else {
      // Normal click: toggle active/inactive
      if (currentCell.active) {
        newGrid[row][col] = { active: false, velocity: 0.7 }
      } else {
        newGrid[row][col] = { active: true, velocity: 0.7 }
      }
    }

    gridRef.current = newGrid
    setGrid(newGrid)
  }, [])

  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      // Stop scheduler
      if (scheduleIntervalRef.current) {
        clearInterval(scheduleIntervalRef.current)
        scheduleIntervalRef.current = null
      }

      Tone.Transport.stop()
      Tone.Transport.cancel()

      // Clear scheduled events
      scheduledEventsRef.current = []

      setCurrentStep(0)
      currentStepRef.current = 0
      isPlayingRef.current = false
      setIsPlaying(false)
    } else {
      // Ensure Tone.js context is started first
      if (Tone.context.state !== 'running') {
        await Tone.start()
      }

      // Initialize audio objects now that we have user interaction
      initializeAudio()

      // Ensure mobile audio is properly initialized
      await mobileAudioManager.initializeAudio()

      // Initialize timing
      nextStepTimeRef.current = Tone.context.currentTime + 0.1 // Start slightly in the future
      currentStepRef.current = 0
      scheduledEventsRef.current = []

      // Start enhanced scheduler interval with adaptive precision
      const schedulerInterval = microTimingEnabled.current ? 10 : 25 // 10ms for high precision, 25ms for normal
      scheduleIntervalRef.current = window.setInterval(scheduler, schedulerInterval)

      Tone.Transport.bpm.value = tempo
      Tone.Transport.start()
      isPlayingRef.current = true
      setIsPlaying(true)
    }
  }, [isPlaying, tempo, scheduler, initializeAudio])

  const clearGrid = useCallback(() => {
    const newGrid = initGrid()
    gridRef.current = newGrid
    setGrid(newGrid)
    setCurrentStep(0)
  }, [])

  const setPreset = useCallback((preset: string) => {
    const newGrid = initGrid()

    switch (preset) {
      case 'ambient':
        for (let i = 0; i < 16; i += 4) {
          newGrid[8][i].active = true
          newGrid[10][i + 2].active = true
          newGrid[5][i + 1].active = true
        }
        setSynthParams(prev => ({
          ...prev,
          attack: 0.5,
          release: 2,
          waveform: 'sine',
        }))
        break

      case 'energetic':
        for (let i = 0; i < 16; i += 2) {
          newGrid[0][i].active = true
          newGrid[5][i].active = true
          newGrid[10][i].active = true
          newGrid[15][i].active = true
        }
        setSynthParams(prev => ({
          ...prev,
          attack: 0.001,
          release: 0.1,
          waveform: 'square',
        }))
        break

      case 'cascade':
        for (let i = 0; i < 16; i++) {
          newGrid[15 - i][i].active = true
        }
        break

      case 'rise':
        for (let i = 0; i < 16; i++) {
          newGrid[i][i].active = true
        }
        break
    }

    gridRef.current = newGrid
    setGrid(newGrid)
  }, [])

  // Character patch definitions
  const characterPatches: CharacterPatchCollection = {
    default: null,
    nebula: {
      waveform: 'sine',
      attack: 0.5,
      release: 1.5,
      brightness: 30,
      texture: 40,
      volume: -8,
    },
    plasma: {
      waveform: 'sawtooth',
      attack: 0.001,
      release: 0.3,
      brightness: 80,
      texture: 60,
      volume: -10,
    },
    quantum: {
      waveform: 'square',
      attack: 0.001,
      release: 0.1,
      brightness: 70,
      texture: 30,
      volume: -8,
    },
    warpDrive: {
      waveform: 'triangle',
      attack: 0.05,
      release: 0.5,
      brightness: 40,
      texture: 50,
      volume: -6,
    },
    photon: {
      waveform: 'square',
      attack: 0.001,
      release: 0.05,
      brightness: 90,
      texture: 10,
      volume: -4,
    },
    void: {
      waveform: 'sawtooth',
      attack: 0.2,
      release: 1.0,
      brightness: 20,
      texture: 70,
      volume: -5,
    },
  }

  const selectCharacter = useCallback((character: string) => {
    if (character !== 'default') {
      const patch = characterPatches[character]
      if (patch) {
        setSynthParams(prev => ({
          ...prev,
          ...patch,
          character,
        }))
      }
    } else {
      setSynthParams(prev => ({
        ...prev,
        character,
      }))
    }
  }, [])

  const updateSynthParam = useCallback((param: string, value: number | string) => {
    setSynthParams(prev => ({
      ...prev,
      [param]: value,
    }))
  }, [])

  const applyEffectToMelodyTrack = useCallback((param: string, wetValue: number) => {
    const melodyEffects = trackEffectsRef.current.melody
    if (!melodyEffects) return

    switch (param) {
      case 'reverb':
        if (melodyEffects.reverb) melodyEffects.reverb.wet.value = wetValue
        break
      case 'delay':
        if (melodyEffects.delay) melodyEffects.delay.wet.value = wetValue
        break
      case 'chorus':
        if (melodyEffects.chorus) melodyEffects.chorus.wet.value = wetValue
        break
      case 'wahFilter':
        if (melodyEffects.wahFilter) {
          melodyEffects.wahFilter.wet.value = wetValue
          melodyEffects.wahFilter.gain.value = wetValue * 8
        }
        break
    }
  }, [])

  const applyEffectToGlobalEffects = useCallback((param: string, wetValue: number) => {
    switch (param) {
      case 'reverb':
        if (reverbRef.current) reverbRef.current.wet.value = wetValue
        break
      case 'delay':
        if (delayRef.current) delayRef.current.wet.value = wetValue
        break
      case 'chorus':
        if (chorusRef.current) chorusRef.current.wet.value = wetValue
        break
      case 'wahFilter':
        if (wahFilterRef.current) {
          wahFilterRef.current.wet.value = wetValue
          wahFilterRef.current.gain.value = wetValue * 8
        }
        break
    }
  }, [])

  const updateEffectsParam = useCallback(
    (param: string, value: number) => {
      setEffectsParams(prev => ({
        ...prev,
        [param]: value,
      }))

      const wetValue = value / 100
      applyEffectToMelodyTrack(param, wetValue)
      applyEffectToGlobalEffects(param, wetValue)
    },
    [applyEffectToMelodyTrack, applyEffectToGlobalEffects]
  )

  const toggleDrums = useCallback(() => {
    setDrumEnabled(prev => !prev)
  }, [])

  const setDrumVolumeCallback = useCallback((volume: number) => {
    setDrumVolume(volume)
    if (drumGainRef.current) {
      drumGainRef.current.gain.value = Tone.dbToGain(volume)
    }
  }, [])

  const selectDrumPattern = useCallback((patternId: string) => {
    setCurrentDrumPattern(patternId)
  }, [])

  const selectDrumKit = useCallback((kitId: string) => {
    setCurrentDrumKit(kitId)
    if (drumSynthesizerRef.current) {
      drumSynthesizerRef.current.setKit(kitId)
    }
  }, [])

  const setScale = useCallback((scaleId: string) => {
    const scale = SCALES.find(s => s.id === scaleId)
    setCurrentScaleState(scale || null)
  }, [])

  const setKey = useCallback((keyId: string) => {
    const key = KEYS.find(k => k.id === keyId)
    setCurrentKeyState(key || null)
  }, [])

  // Timing control functions
  const setSwingAmount = useCallback((amount: number) => {
    swingAmount.current = Math.max(0, Math.min(100, amount))
  }, [])

  const toggleMicroTiming = useCallback(() => {
    microTimingEnabled.current = !microTimingEnabled.current
  }, [])

  const getTimingStats = useCallback(
    () => ({
      averageLatency: timingAnalysis.current.averageLatency,
      jitter: timingAnalysis.current.jitter,
      missedEvents: timingAnalysis.current.missedEvents,
      totalEvents: timingAnalysis.current.totalEvents,
      swingAmount: swingAmount.current,
      microTimingEnabled: microTimingEnabled.current,
    }),
    []
  )

  // Individual track control functions
  const updateTrackControl = useCallback(
    // eslint-disable-next-line complexity
    (trackId: string, control: string, value: number | boolean) => {
      setTrackControls(prev => ({
        ...prev,
        [trackId]: {
          ...prev[trackId as keyof typeof prev],
          [control]: value,
        },
      }))

      // Apply real-time audio changes
      const trackEffects = trackEffectsRef.current[trackId]
      if (trackEffects) {
        switch (control) {
          case 'volume':
            trackEffects.gain.gain.rampTo(value as number, 0.1)
            break
          case 'muted':
            trackEffects.gain.gain.rampTo(
              (value as boolean) ? 0 : trackControls[trackId as keyof typeof trackControls].volume,
              0.1
            )
            break
          case 'pan':
            if ('pan' in trackEffects.panner) {
              trackEffects.panner.pan.rampTo(value as number, 0.1)
            }
            break
          case 'reverb':
            trackEffects.reverb.wet.rampTo((value as number) / 100, 0.1)
            break
          case 'delay':
            trackEffects.delay.wet.rampTo((value as number) / 100, 0.1)
            break
          case 'chorus':
            trackEffects.chorus.wet.rampTo((value as number) / 100, 0.1)
            break
          case 'wahFilter':
            trackEffects.wahFilter.wet.rampTo((value as number) / 100, 0.1)
            break
        }
      }
    },
    [trackControls]
  )

  const soloTrack = useCallback((trackId: string) => {
    setTrackControls(prev => {
      const newControls = { ...prev }
      // Toggle solo for the clicked track
      newControls[trackId as keyof typeof newControls].solo =
        !newControls[trackId as keyof typeof newControls].solo

      // If any track is soloed, mute all non-soloed tracks
      const hasSolo = Object.values(newControls).some(track => track.solo)

      if (hasSolo) {
        Object.keys(newControls).forEach(key => {
          const track = newControls[key as keyof typeof newControls]
          const trackEffects = trackEffectsRef.current[key]
          if (trackEffects) {
            trackEffects.gain.gain.rampTo(track.solo ? track.volume : 0, 0.1)
          }
        })
      } else {
        // No tracks soloed, restore all volumes
        Object.keys(newControls).forEach(key => {
          const track = newControls[key as keyof typeof newControls]
          const trackEffects = trackEffectsRef.current[key]
          if (trackEffects && !track.muted) {
            trackEffects.gain.gain.rampTo(track.volume, 0.1)
          }
        })
      }

      return newControls
    })
  }, [])

  const muteTrack = useCallback(
    (trackId: string) => {
      updateTrackControl(
        trackId,
        'muted',
        !trackControls[trackId as keyof typeof trackControls].muted
      )
    },
    [trackControls, updateTrackControl]
  )

  // Update synth parameters
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.set({
        oscillator: {
          type: synthParams.waveform as 'sine' | 'square' | 'sawtooth' | 'triangle',
          // Note: detune parameter handled through individual voice access
        },
        envelope: {
          attack: synthParams.attack,
          decay: synthParams.decay,
          sustain: synthParams.sustain,
          release: synthParams.release,
        },
        volume: synthParams.volume,
        portamento: synthParams.portamento,
      })

      // Note: Filter settings would be applied at individual voice level
      // but voice property is private in newer Tone.js versions
    }
  }, [
    synthParams.waveform,
    synthParams.attack,
    synthParams.decay,
    synthParams.sustain,
    synthParams.release,
    synthParams.volume,
    synthParams.detune,
    synthParams.portamento,
    synthParams.filterCutoff,
    synthParams.filterResonance,
  ])

  // Update tempo
  useEffect(() => {
    Tone.Transport.bpm.value = tempo
  }, [tempo])

  return (
    <SequencerContext.Provider
      value={{
        grid,
        isPlaying,
        tempo,
        currentStep,
        toggleCell,
        togglePlayback,
        setTempo,
        clearGrid,
        setPreset,
        synthParams,
        effectsParams,
        updateSynthParam,
        updateEffectsParam,
        selectCharacter,
        drumEnabled,
        drumVolume,
        currentDrumPattern,
        currentDrumKit,
        drumPatterns,
        drumKits: DRUM_KITS,
        toggleDrums,
        setDrumVolume: setDrumVolumeCallback,
        selectDrumPattern,
        selectDrumKit,
        currentScale,
        currentKey,
        setScale,
        setKey,
        setSwingAmount,
        toggleMicroTiming,
        getTimingStats,
        trackControls,
        updateTrackControl,
        soloTrack,
        muteTrack,
      }}
    >
      {children}
    </SequencerContext.Provider>
  )
}
