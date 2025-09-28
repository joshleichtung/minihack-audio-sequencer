import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import * as Tone from 'tone'
import type { Scale, Key } from '../utils/scales'
import { SCALES, KEYS, getNoteForRow } from '../utils/scales'

interface Cell {
  active: boolean
  velocity: number
}

interface DrumPattern {
  id: string
  name: string
  genre: string
  pattern: number[][]  // [kick, snare, hihat, openhat] x N steps (0 or 1), supports 16, 32, etc.
  kit: string
  length: number  // Pattern length in steps
}

interface SequencerContextType {
  grid: Cell[][]
  isPlaying: boolean
  tempo: number
  currentStep: number
  toggleCell: (row: number, col: number, shiftKey?: boolean) => void
  togglePlayback: () => void
  setTempo: (tempo: number) => void
  clearGrid: () => void
  setPreset: (preset: string) => void
  synthParams: {
    brightness: number
    texture: number
    attack: number
    release: number
    volume: number
    waveform: string
    character: string
  }
  effectsParams: {
    reverb: number
    delay: number
    chorus: number
    wahFilter: number
  }
  updateSynthParam: (param: string, value: number | string) => void
  updateEffectsParam: (param: string, value: number) => void
  selectCharacter: (character: string) => void
  drumEnabled: boolean
  drumVolume: number
  currentDrumPattern: string
  drumPatterns: DrumPattern[]
  toggleDrums: () => void
  setDrumVolume: (volume: number) => void
  selectDrumPattern: (patternId: string) => void
  currentScale: Scale
  currentKey: Key
  setScale: (scaleId: string) => void
  setKey: (keyId: string) => void
}

const SequencerContext = createContext<SequencerContextType | undefined>(undefined)

export const useSequencer = () => {
  const context = useContext(SequencerContext)
  if (!context) {
    throw new Error('useSequencer must be used within SequencerProvider')
  }
  return context
}

export const SequencerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize 16x16 grid
  const initGrid = () => Array(16).fill(null).map(() =>
    Array(16).fill(null).map(() => ({ active: false, velocity: 0.7 }))
  )

  const [grid, setGrid] = useState<Cell[][]>(initGrid)
  const gridRef = useRef<Cell[][]>(initGrid())
  const [isPlaying, setIsPlaying] = useState(false)
  const [tempo, setTempo] = useState(90)
  const [currentStep, setCurrentStep] = useState(0)

  const [synthParams, setSynthParams] = useState({
    brightness: 50,  // Filter cutoff
    texture: 20,     // Filter resonance
    attack: 0.01,    // Envelope attack
    release: 0.3,    // Envelope release
    volume: -12,     // Master volume in dB
    waveform: 'sawtooth', // Oscillator type
    character: 'default' // Synth patch
  })

  const [effectsParams, setEffectsParams] = useState({
    reverb: 0,      // 0-100 room to hall
    delay: 0,       // 0-100 off to rhythmic
    chorus: 0,      // 0-100 subtle to lush
    wahFilter: 0    // 0-100 off to squelchy wah
  })

  const [drumEnabled, setDrumEnabled] = useState(false)
  const [drumVolume, setDrumVolume] = useState(-6) // dB
  const [currentDrumPattern, setCurrentDrumPattern] = useState('hiphop1')

  // Scale and key state
  const [currentScale, setCurrentScale] = useState<Scale>(SCALES[0]) // Pentatonic
  const [currentKey, setCurrentKey] = useState<Key>(KEYS[0]) // C

  const synthRef = useRef<Tone.PolySynth | null>(null)
  const sequencerRef = useRef<Tone.Sequence | null>(null)
  const drumSynthsRef = useRef<{[key: string]: Tone.Synth | Tone.NoiseSynth}>({})
  const drumGainRef = useRef<Tone.Gain | null>(null)
  const drumEnabledRef = useRef(drumEnabled)
  const currentDrumPatternRef = useRef(currentDrumPattern)

  // Effects refs
  const reverbRef = useRef<Tone.Reverb | null>(null)
  const delayRef = useRef<Tone.FeedbackDelay | null>(null)
  const chorusRef = useRef<Tone.Chorus | null>(null)
  const wahFilterRef = useRef<Tone.AutoWah | null>(null)

  // Drum patterns database
  const drumPatterns: DrumPattern[] = [
    // Hip Hop
    { id: 'hiphop1', name: 'BOOM BAP', genre: 'Hip Hop', kit: 'classic', length: 16, pattern: [
      [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], // kick
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], // snare
      [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], // hihat
      [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1]  // openhat
    ]},
    { id: 'hiphop2', name: 'TRAP', genre: 'Hip Hop', kit: 'modern', length: 16, pattern: [
      [1,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0], // kick
      [0,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0], // snare
      [1,1,0,1,1,0,1,1,1,1,0,1,1,0,1,1], // hihat
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]  // openhat
    ]},
    { id: 'hiphop3', name: 'DRILL', genre: 'Hip Hop', kit: 'hard', length: 16, pattern: [
      [1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0], // kick
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], // snare
      [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1], // hihat
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]  // openhat
    ]},
    { id: 'hiphop4', name: 'LOFI', genre: 'Hip Hop', kit: 'vintage', length: 16, pattern: [
      [1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0], // kick
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], // snare
      [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,0], // hihat
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]  // openhat
    ]},
    // Jazz
    { id: 'jazz1', name: 'SWING', genre: 'Jazz', kit: 'jazz', length: 16, pattern: [
      [1,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0], // kick
      [0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0], // snare
      [1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0], // hihat
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]  // openhat
    ]},
    { id: 'jazz2', name: 'BEBOP', genre: 'Jazz', kit: 'vintage', length: 16, pattern: [
      [1,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0], // kick
      [0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0], // snare
      [1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1], // hihat
      [0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0]  // openhat
    ]},
    { id: 'jazz3', name: 'LATIN', genre: 'Jazz', kit: 'latin', length: 16, pattern: [
      [1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0], // kick
      [0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1], // snare
      [1,1,0,1,1,0,1,1,1,1,0,1,1,0,1,1], // hihat
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]  // openhat
    ]},
    { id: 'jazz4', name: 'FUSION', genre: 'Jazz', kit: 'modern', length: 16, pattern: [
      [1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,1], // kick
      [0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0], // snare
      [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1], // hihat
      [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1]  // openhat
    ]},
    // Drum & Bass
    { id: 'dnb1', name: 'AMEN', genre: 'D&B', kit: 'electronic', length: 16, pattern: [
      [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0], // kick
      [0,0,1,0,1,0,0,1,0,1,0,0,1,0,0,1], // snare
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // hihat
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]  // openhat
    ]},
    { id: 'dnb2', name: 'NEUROFUNK', genre: 'D&B', kit: 'dark', length: 16, pattern: [
      [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], // kick
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], // snare
      [0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0], // hihat
      [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1]  // openhat
    ]},
    { id: 'dnb3', name: 'LIQUID', genre: 'D&B', kit: 'smooth', length: 16, pattern: [
      [1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0], // kick
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], // snare
      [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], // hihat
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]  // openhat
    ]},
    { id: 'dnb4', name: 'JUNGLE', genre: 'D&B', kit: 'classic', length: 16, pattern: [
      [1,0,0,0,1,0,0,1,0,0,1,0,0,0,0,1], // kick
      [0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0], // snare
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // hihat
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]  // openhat
    ]},
    // Additional styles
    { id: 'house1', name: 'FOUR-ON-FLOOR', genre: 'House', kit: 'electronic', length: 16, pattern: [
      [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], // kick
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], // snare
      [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1], // hihat
      [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1]  // openhat
    ]},
    { id: 'breakbeat1', name: 'FUNKY BREAKS', genre: 'Breaks', kit: 'funk', length: 16, pattern: [
      [1,0,0,1,0,0,1,0,0,0,1,0,1,0,0,0], // kick
      [0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0], // snare
      [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], // hihat
      [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0]  // openhat
    ]},
    { id: 'rock1', name: 'ROCK STEADY', genre: 'Rock', kit: 'rock', length: 16, pattern: [
      [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], // kick
      [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0], // snare
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // hihat
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]  // openhat
    ]},
    { id: 'afrobeat1', name: 'AFROBEAT', genre: 'World', kit: 'world', length: 16, pattern: [
      [1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,0], // kick
      [0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1], // snare
      [1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0], // hihat
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]  // openhat
    ]},
    // 32-step patterns to demonstrate extended functionality
    { id: 'extended32_1', name: 'PROGRESSIVE HOUSE 32', genre: 'House', kit: 'electronic', length: 32, pattern: [
      [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0,1,0], // kick - varies in second half
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,1], // snare - more complex in second half
      [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,1,1,0,1,1,0,1,0], // hihat - different pattern second half
      [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0]  // openhat - sparse accents
    ]},
    { id: 'extended32_2', name: 'EVOLVING TECHNO 32', genre: 'Techno', kit: 'electronic', length: 32, pattern: [
      [1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,1,0,1,1], // kick - builds intensity
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,1,0,1,0], // snare - more hits in second half
      [1,1,0,1,1,0,1,1,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,0,1,1,1,0,1,1,1], // hihat - continuous with gaps
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1]  // openhat - only in second half
    ]}
  ]

  // Initialize Tone.js
  useEffect(() => {
    // Create effects chain
    reverbRef.current = new Tone.Reverb(0.8)
    delayRef.current = new Tone.FeedbackDelay('8n', 0.3)
    chorusRef.current = new Tone.Chorus(4, 2.5, 0.5)
    wahFilterRef.current = new Tone.AutoWah(50, 6, 0)

    // Set initial effects levels (all off)
    reverbRef.current.wet.value = 0
    delayRef.current.wet.value = 0
    chorusRef.current.wet.value = 0
    wahFilterRef.current.wet.value = 0

    // Chain effects: Synth → Wah → Chorus → Delay → Reverb → Destination
    const effectsChain = [
      wahFilterRef.current,
      chorusRef.current,
      delayRef.current,
      reverbRef.current
    ]

    synthRef.current = new Tone.PolySynth(Tone.Synth)
    synthRef.current.set({
      oscillator: { type: 'sawtooth' as any },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.5,
        release: 0.3
      }
    })

    // Connect synth through effects chain to destination
    synthRef.current.chain(...effectsChain, Tone.Destination)

    // Initialize drum gain node
    drumGainRef.current = new Tone.Gain(Tone.dbToGain(drumVolume)).toDestination()

    // Initialize drum synthesizers with distinct sounds

    // KICK DRUM - Deep punchy kick with pitch envelope
    const kickLowpass = new Tone.Filter(100, 'lowpass').connect(drumGainRef.current)
    const kickSynth = new Tone.MembraneSynth({
      pitchDecay: 0.08,
      octaves: 2,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.2 }
    }).connect(kickLowpass)

    // SNARE DRUM - Layered noise + tone for realistic snare
    const snareNoise = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.01, decay: 0.13, sustain: 0, release: 0.03 }
    })
    const snareTone = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.02 }
    })
    const snareFilter = new Tone.Filter(3000, 'highpass').connect(drumGainRef.current)
    const snareMix = new Tone.Gain(0.7).connect(snareFilter)
    snareNoise.connect(snareMix)
    snareTone.connect(snareMix)

    // HIHAT - Bright metallic closed hihat
    const hihatFilter = new Tone.Filter(10000, 'highpass').connect(drumGainRef.current)
    const hihatSynth = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.01 },
      harmonicity: 12,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1
    }).connect(hihatFilter)

    // OPEN HIHAT - Longer decay metallic sound
    const openhatFilter = new Tone.Filter(8000, 'highpass').connect(drumGainRef.current)
    const openhatSynth = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.3, sustain: 0.1, release: 0.3 },
      harmonicity: 10,
      modulationIndex: 16,
      resonance: 3000,
      octaves: 1.5
    }).connect(openhatFilter)

    drumSynthsRef.current = {
      kick: kickSynth,
      snare: {
        triggerAttackRelease: (duration: any) => {
          snareNoise.triggerAttackRelease(duration)
          snareTone.triggerAttackRelease(200, duration)
        }
      } as any,
      hihat: hihatSynth as any,
      openhat: openhatSynth as any
    }

    return () => {
      if (sequencerRef.current) {
        sequencerRef.current.dispose()
      }
      if (synthRef.current) {
        synthRef.current.dispose()
      }
      // Dispose drum synthesizers carefully
      if (drumSynthsRef.current.kick) drumSynthsRef.current.kick.dispose()
      if (drumSynthsRef.current.hihat) drumSynthsRef.current.hihat.dispose()
      if (drumSynthsRef.current.openhat) drumSynthsRef.current.openhat.dispose()
      // Snare cleanup handled by individual components
      if (drumGainRef.current) {
        drumGainRef.current.dispose()
      }
      // Dispose effects
      if (reverbRef.current) reverbRef.current.dispose()
      if (delayRef.current) delayRef.current.dispose()
      if (chorusRef.current) chorusRef.current.dispose()
      if (wahFilterRef.current) wahFilterRef.current.dispose()
    }
  }, [])

  // Character patch definitions - simplified to use our controls
  const characterPatches: Record<string, any> = {
    default: null, // Uses current slider values
    nebula: {
      waveform: 'sine',
      attack: 0.5,
      release: 1.5,
      brightness: 30,
      texture: 40,
      volume: -8
    },
    plasma: {
      waveform: 'sawtooth',
      attack: 0.001,
      release: 0.3,
      brightness: 80,
      texture: 60,
      volume: -10
    },
    quantum: {
      waveform: 'square',
      attack: 0.001,
      release: 0.1,
      brightness: 70,
      texture: 30,
      volume: -8
    },
    warpDrive: {
      waveform: 'triangle',
      attack: 0.05,
      release: 0.5,
      brightness: 40,
      texture: 50,
      volume: -6
    },
    photon: {
      waveform: 'square',
      attack: 0.001,
      release: 0.05,
      brightness: 90,
      texture: 10,
      volume: -4
    },
    void: {
      waveform: 'sawtooth',
      attack: 0.2,
      release: 1.0,
      brightness: 20,
      texture: 70,
      volume: -5
    }
  }

  // Handle character patch selection
  const selectCharacter = useCallback((character: string) => {
    if (character !== 'default') {
      const patch = characterPatches[character]
      if (patch) {
        setSynthParams(prev => ({
          ...prev,
          ...patch,
          character
        }))
      }
    } else {
      setSynthParams(prev => ({
        ...prev,
        character
      }))
    }
  }, [])

  // Update synth parameters
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.set({
        oscillator: { type: synthParams.waveform as any },
        envelope: {
          attack: synthParams.attack,
          decay: 0.1,
          sustain: 0.5,
          release: synthParams.release
        },
        volume: synthParams.volume
      })
    }
  }, [synthParams.waveform, synthParams.attack, synthParams.release, synthParams.volume])

  // Update tempo
  useEffect(() => {
    Tone.Transport.bpm.value = tempo
  }, [tempo])

  // Keep drum refs updated
  useEffect(() => {
    drumEnabledRef.current = drumEnabled
  }, [drumEnabled])

  useEffect(() => {
    currentDrumPatternRef.current = currentDrumPattern
  }, [currentDrumPattern])

  const toggleCell = useCallback((row: number, col: number, shiftKey = false) => {
    const newGrid = [...gridRef.current]
    newGrid[row] = [...newGrid[row]]
    const currentCell = newGrid[row][col]

    if (shiftKey) {
      // Shift-click: cycle through velocity states
      if (!currentCell.active) {
        // Off -> Normal (0.7)
        newGrid[row][col] = { active: true, velocity: 0.7 }
      } else if (currentCell.velocity === 0.7) {
        // Normal -> Emphasis (1.0)
        newGrid[row][col] = { active: true, velocity: 1.0 }
      } else if (currentCell.velocity === 1.0) {
        // Emphasis -> Quiet (0.3)
        newGrid[row][col] = { active: true, velocity: 0.3 }
      } else {
        // Quiet -> Off
        newGrid[row][col] = { active: false, velocity: 0.7 }
      }
    } else {
      // Regular click: toggle between off and normal velocity
      newGrid[row][col] = {
        active: !currentCell.active,
        velocity: 0.7
      }
    }

    gridRef.current = newGrid
    setGrid(newGrid)
  }, [])

  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      Tone.Transport.stop()
      Tone.Transport.cancel()
      if (sequencerRef.current) {
        sequencerRef.current.stop()
        sequencerRef.current.dispose()
        sequencerRef.current = null
      }
      setCurrentStep(0)
      setIsPlaying(false)
    } else {
      await Tone.start()

      // Clean up any existing sequence
      if (sequencerRef.current) {
        sequencerRef.current.dispose()
      }

      // Create new sequence with current grid state
      const seq = new Tone.Sequence(
        (time, step) => {
          // Update UI
          Tone.Draw.schedule(() => {
            setCurrentStep(step)
          }, time)

          // Play notes for this step using current scale and key
          for (let row = 0; row < 16; row++) {
            const cell = gridRef.current[row][step]
            if (cell.active) {
              const note = getNoteForRow(row, currentScale, currentKey)

              if (synthRef.current) {
                // Play each note with its individual velocity
                synthRef.current.triggerAttackRelease(note, '16n', time, cell.velocity)
              }
            }
          }

          // Play drum pattern if enabled
          if (drumEnabledRef.current && drumSynthsRef.current) {
            const currentPattern = drumPatterns.find(p => p.id === currentDrumPatternRef.current)
            if (currentPattern) {
              const drumNames = ['kick', 'snare', 'hihat', 'openhat']

              drumNames.forEach((drumName, drumIndex) => {
                const patternStep = step % currentPattern.length
                if (currentPattern.pattern[drumIndex][patternStep] === 1) {
                  const synth = drumSynthsRef.current[drumName]
                  if (synth) {
                    synth.triggerAttackRelease('16n', time)
                  }
                }
              })
            }
          }
        },
        Array(16).fill(0).map((_, i) => i),
        '16n'
      )

      seq.loop = true
      seq.start(0)
      sequencerRef.current = seq

      Tone.Transport.bpm.value = tempo
      Tone.Transport.start()
      setIsPlaying(true)
    }
  }, [isPlaying, tempo])

  const clearGrid = useCallback(() => {
    const newGrid = initGrid()
    gridRef.current = newGrid
    setGrid(newGrid)
    setCurrentStep(0)
  }, [])

  // Helper function to get scale-relative row positions
  const getScaleRows = useCallback(() => {
    const scaleLength = currentScale.intervals.length
    const rows: number[] = []

    // Map scale degrees to grid rows (0-15, with 15 being highest)
    for (let i = 0; i < 16; i++) {
      const scaleIndex = i % scaleLength
      const octave = Math.floor(i / scaleLength)
      const rowFromTop = 15 - i  // Invert: row 15 = highest note, row 0 = lowest
      rows.push(rowFromTop)
    }
    return rows
  }, [currentScale])

  const setPreset = useCallback((preset: string) => {
    const newGrid = initGrid()
    const scaleRows = getScaleRows()
    const scaleLength = currentScale.intervals.length

    switch (preset) {
      case 'ambient':
        // Sparse pattern with perfect fifths and octaves - works great in any scale
        // Root, fifth, octave pattern every 4 beats
        for (let beat = 0; beat < 16; beat += 4) {
          // Root note (scale degree 1)
          newGrid[scaleRows[0]][beat].active = true
          newGrid[scaleRows[0]][beat].velocity = 0.7

          // Fifth (scale degree 5 if available, otherwise 4)
          const fifthDegree = scaleLength > 4 ? 4 : 3
          if (beat + 2 < 16) {
            newGrid[scaleRows[fifthDegree]][beat + 2].active = true
            newGrid[scaleRows[fifthDegree]][beat + 2].velocity = 0.3
          }

          // Octave (scale degree 8 if available)
          if (scaleLength >= 7 && beat + 1 < 16) {
            newGrid[scaleRows[7]][beat + 1].active = true
            newGrid[scaleRows[7]][beat + 1].velocity = 0.3
          }
        }
        setSynthParams(prev => ({
          ...prev,
          attack: 0.5,
          release: 2.0,
          waveform: 'sine',
          brightness: 30,
          texture: 10
        }))
        break

      case 'energetic':
        // Fast arpeggio pattern using triads
        for (let i = 0; i < 16; i += 2) {
          // Root chord notes every 2 beats
          newGrid[scaleRows[0]][i].active = true  // Root
          newGrid[scaleRows[0]][i].velocity = 1.0

          if (scaleLength > 2) {
            newGrid[scaleRows[2]][i].active = true  // Third
            newGrid[scaleRows[2]][i].velocity = 0.7
          }
          if (scaleLength > 4) {
            newGrid[scaleRows[4]][i].active = true  // Fifth
            newGrid[scaleRows[4]][i].velocity = 0.7
          }
          if (scaleLength >= 7) {
            newGrid[scaleRows[7]][i].active = true  // Octave
            newGrid[scaleRows[7]][i].velocity = 0.7
          }
        }
        setSynthParams(prev => ({
          ...prev,
          attack: 0.001,
          release: 0.2,
          waveform: 'sawtooth',
          brightness: 80,
          texture: 60
        }))
        break

      case 'cascade':
        // Descending scale pattern - uses all scale degrees
        for (let i = 0; i < Math.min(16, scaleLength * 2); i++) {
          const scaleIndex = (scaleLength * 2 - 1 - i) % scaleLength
          const octaveOffset = Math.floor((scaleLength * 2 - 1 - i) / scaleLength) * scaleLength
          const rowIndex = scaleRows[scaleIndex + octaveOffset] || scaleRows[scaleIndex]

          if (i < 16) {
            newGrid[rowIndex][i].active = true
            newGrid[rowIndex][i].velocity = 0.7
          }
        }
        setSynthParams(prev => ({
          ...prev,
          attack: 0.01,
          release: 0.5,
          waveform: 'triangle',
          brightness: 60,
          texture: 40
        }))
        break

      case 'rise':
        // Ascending scale pattern with velocity crescendo
        for (let i = 0; i < Math.min(16, scaleLength * 2); i++) {
          const scaleIndex = i % scaleLength
          const octaveOffset = Math.floor(i / scaleLength) * scaleLength
          const rowIndex = scaleRows[scaleIndex + octaveOffset] || scaleRows[scaleIndex]

          if (i < 16) {
            newGrid[rowIndex][i].active = true
            // Crescendo effect
            newGrid[rowIndex][i].velocity = 0.3 + (i / 16) * 0.7
          }
        }
        setSynthParams(prev => ({
          ...prev,
          attack: 0.05,
          release: 0.8,
          waveform: 'square',
          brightness: 70,
          texture: 50
        }))
        break
    }

    gridRef.current = newGrid
    setGrid(newGrid)
  }, [currentScale, getScaleRows])

  const updateSynthParam = useCallback((param: string, value: number | string) => {
    setSynthParams(prev => ({
      ...prev,
      [param]: value
    }))
  }, [])

  const updateEffectsParam = useCallback((param: string, value: number) => {
    setEffectsParams(prev => ({
      ...prev,
      [param]: value
    }))

    // Update effects in real-time
    const wetValue = value / 100 // Convert 0-100 to 0-1

    switch (param) {
      case 'reverb':
        if (reverbRef.current) {
          reverbRef.current.wet.value = wetValue
        }
        break
      case 'delay':
        if (delayRef.current) {
          delayRef.current.wet.value = wetValue
        }
        break
      case 'chorus':
        if (chorusRef.current) {
          chorusRef.current.wet.value = wetValue
        }
        break
      case 'wahFilter':
        if (wahFilterRef.current) {
          wahFilterRef.current.wet.value = wetValue
          // Adjust wah intensity based on value
          wahFilterRef.current.gain.value = wetValue * 8 // 0 to 8 intensity
        }
        break
    }
  }, [])

  const toggleDrums = useCallback(() => {
    setDrumEnabled(prev => !prev)
  }, [])

  const setDrumVolumeCallback = useCallback((volume: number) => {
    setDrumVolume(volume)

    // Update drum gain node in real-time
    if (drumGainRef.current) {
      drumGainRef.current.gain.value = Tone.dbToGain(volume)
    }
  }, [])

  const selectDrumPattern = useCallback((patternId: string) => {
    setCurrentDrumPattern(patternId)
  }, [])

  // Scale and key functions
  const setScale = useCallback((scaleId: string) => {
    const scale = SCALES.find(s => s.id === scaleId)
    if (scale) {
      setCurrentScale(scale)
    }
  }, [])

  const setKey = useCallback((keyId: string) => {
    const key = KEYS.find(k => k.id === keyId)
    if (key) {
      setCurrentKey(key)
    }
  }, [])

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
        drumPatterns,
        toggleDrums,
        setDrumVolume: setDrumVolumeCallback,
        selectDrumPattern,
        currentScale,
        currentKey,
        setScale,
        setKey
      }}
    >
      {children}
    </SequencerContext.Provider>
  )
}