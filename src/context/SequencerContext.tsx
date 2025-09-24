import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import * as Tone from 'tone'
import { Scale, Chord } from 'tonal'

interface Cell {
  active: boolean
  velocity: number
}

interface DrumPattern {
  id: string
  name: string
  genre: string
  pattern: boolean[][]  // [kick, snare, hihat, openhat] x 16 steps
  kit: string
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
  updateSynthParam: (param: string, value: number | string) => void
  selectCharacter: (character: string) => void
  drumEnabled: boolean
  drumVolume: number
  currentDrumPattern: string
  drumPatterns: DrumPattern[]
  toggleDrums: () => void
  setDrumVolume: (volume: number) => void
  selectDrumPattern: (patternId: string) => void
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
    Array(16).fill(null).map(() => ({ active: false, velocity: 0.8 }))
  )

  const [grid, setGrid] = useState<Cell[][]>(initGrid)
  const gridRef = useRef<Cell[][]>(initGrid())
  const [isPlaying, setIsPlaying] = useState(false)
  const [tempo, setTempo] = useState(120)
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

  const [drumEnabled, setDrumEnabled] = useState(false)
  const [drumVolume, setDrumVolume] = useState(-6) // dB
  const [currentDrumPattern, setCurrentDrumPattern] = useState('hiphop1')

  const synthRef = useRef<Tone.PolySynth | null>(null)
  const sequencerRef = useRef<Tone.Sequence | null>(null)
  const drumSynthsRef = useRef<{[key: string]: Tone.Synth | Tone.NoiseSynth}>({})

  // Drum patterns database
  const drumPatterns: DrumPattern[] = [
    // Hip Hop
    { id: 'hiphop1', name: 'BOOM BAP', genre: 'Hip Hop', kit: 'classic', pattern: [
      [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], // kick
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], // snare
      [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], // hihat
      [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1]  // openhat
    ]},
    { id: 'hiphop2', name: 'TRAP', genre: 'Hip Hop', kit: 'modern', pattern: [
      [1,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0], // kick
      [0,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0], // snare
      [1,1,0,1,1,0,1,1,1,1,0,1,1,0,1,1], // hihat
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]  // openhat
    ]},
    { id: 'hiphop3', name: 'DRILL', genre: 'Hip Hop', kit: 'hard', pattern: [
      [1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0], // kick
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], // snare
      [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1], // hihat
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]  // openhat
    ]},
    { id: 'hiphop4', name: 'LOFI', genre: 'Hip Hop', kit: 'vintage', pattern: [
      [1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0], // kick
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], // snare
      [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,0], // hihat
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]  // openhat
    ]},
    // Jazz
    { id: 'jazz1', name: 'SWING', genre: 'Jazz', kit: 'jazz', pattern: [
      [1,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0], // kick
      [0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0], // snare
      [1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0], // hihat
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]  // openhat
    ]},
    { id: 'jazz2', name: 'BEBOP', genre: 'Jazz', kit: 'vintage', pattern: [
      [1,0,0,1,0,0,0,0,1,0,0,0,0,0,1,0], // kick
      [0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0], // snare
      [1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1], // hihat
      [0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0]  // openhat
    ]},
    { id: 'jazz3', name: 'LATIN', genre: 'Jazz', kit: 'latin', pattern: [
      [1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0], // kick
      [0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1], // snare
      [1,1,0,1,1,0,1,1,1,1,0,1,1,0,1,1], // hihat
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]  // openhat
    ]},
    { id: 'jazz4', name: 'FUSION', genre: 'Jazz', kit: 'modern', pattern: [
      [1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,1], // kick
      [0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0], // snare
      [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1], // hihat
      [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1]  // openhat
    ]},
    // Drum & Bass
    { id: 'dnb1', name: 'AMEN', genre: 'D&B', kit: 'electronic', pattern: [
      [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0], // kick
      [0,0,1,0,1,0,0,1,0,1,0,0,1,0,0,1], // snare
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // hihat
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]  // openhat
    ]},
    { id: 'dnb2', name: 'NEUROFUNK', genre: 'D&B', kit: 'dark', pattern: [
      [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], // kick
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], // snare
      [0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0], // hihat
      [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1]  // openhat
    ]},
    { id: 'dnb3', name: 'LIQUID', genre: 'D&B', kit: 'smooth', pattern: [
      [1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0], // kick
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], // snare
      [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], // hihat
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]  // openhat
    ]},
    { id: 'dnb4', name: 'JUNGLE', genre: 'D&B', kit: 'classic', pattern: [
      [1,0,0,0,1,0,0,1,0,0,1,0,0,0,0,1], // kick
      [0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,0], // snare
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // hihat
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]  // openhat
    ]},
    // Additional styles
    { id: 'house1', name: 'FOUR-ON-FLOOR', genre: 'House', kit: 'electronic', pattern: [
      [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], // kick
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], // snare
      [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1], // hihat
      [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1]  // openhat
    ]},
    { id: 'breakbeat1', name: 'FUNKY BREAKS', genre: 'Breaks', kit: 'funk', pattern: [
      [1,0,0,1,0,0,1,0,0,0,1,0,1,0,0,0], // kick
      [0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0], // snare
      [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0], // hihat
      [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0]  // openhat
    ]},
    { id: 'rock1', name: 'ROCK STEADY', genre: 'Rock', kit: 'rock', pattern: [
      [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], // kick
      [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0], // snare
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // hihat
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]  // openhat
    ]},
    { id: 'afrobeat1', name: 'AFROBEAT', genre: 'World', kit: 'world', pattern: [
      [1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,0], // kick
      [0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1], // snare
      [1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0], // hihat
      [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]  // openhat
    ]}
  ]

  // Initialize Tone.js
  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination()
    synthRef.current.set({
      oscillator: { type: 'sawtooth' as any },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.5,
        release: 0.3
      }
    })

    // Initialize drum synthesizers
    const gainNode = new Tone.Gain(Tone.dbToGain(drumVolume)).toDestination()

    drumSynthsRef.current = {
      kick: new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 }
      }).connect(gainNode),
      snare: new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.15 }
      }).connect(gainNode),
      hihat: new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.01, decay: 0.05, sustain: 0, release: 0.05 }
      }).connect(gainNode),
      openhat: new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 }
      }).connect(gainNode)
    }

    // Set initial frequencies for kick drum
    drumSynthsRef.current.kick.oscillator.frequency.value = 60

    return () => {
      if (sequencerRef.current) {
        sequencerRef.current.dispose()
      }
      if (synthRef.current) {
        synthRef.current.dispose()
      }
      Object.values(drumSynthsRef.current).forEach(synth => synth.dispose())
      gainNode.dispose()
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

  const toggleCell = useCallback((row: number, col: number, shiftKey = false) => {
    const newGrid = [...gridRef.current]
    newGrid[row] = [...newGrid[row]]
    const currentCell = newGrid[row][col]

    if (shiftKey) {
      // Shift-click: toggle between off and 0.8 velocity
      newGrid[row][col] = {
        active: !currentCell.active,
        velocity: 0.8
      }
    } else {
      // Regular click: cycle through velocity states
      if (!currentCell.active) {
        // Off -> Normal (0.8)
        newGrid[row][col] = { active: true, velocity: 0.8 }
      } else if (currentCell.velocity === 0.8) {
        // Normal -> Emphasis (1.0)
        newGrid[row][col] = { active: true, velocity: 1.0 }
      } else if (currentCell.velocity === 1.0) {
        // Emphasis -> Quiet (0.5)
        newGrid[row][col] = { active: true, velocity: 0.5 }
      } else {
        // Quiet -> Off
        newGrid[row][col] = { active: false, velocity: 0.8 }
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

          // Play notes for this step
          const baseNotes = ['C', 'D', 'E', 'G', 'A']

          for (let row = 0; row < 16; row++) {
            const cell = gridRef.current[row][step]
            if (cell.active) {
              const noteIndex = 15 - row
              const octave = Math.floor(noteIndex / 5) + 2
              const scaleIndex = noteIndex % 5
              const note = baseNotes[scaleIndex] + octave

              if (synthRef.current) {
                // Play each note with its individual velocity
                synthRef.current.triggerAttackRelease(note, '16n', time, cell.velocity)
              }
            }
          }

          // Play drum pattern if enabled
          if (drumEnabled && drumSynthsRef.current) {
            const currentPattern = drumPatterns.find(p => p.id === currentDrumPattern)
            if (currentPattern) {
              const drumNames = ['kick', 'snare', 'hihat', 'openhat']

              drumNames.forEach((drumName, drumIndex) => {
                if (currentPattern.pattern[drumIndex][step] === 1) {
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

  const setPreset = useCallback((preset: string) => {
    const newGrid = initGrid()

    switch (preset) {
      case 'ambient':
        // Sparse pattern with long notes
        for (let i = 0; i < 16; i += 4) {
          newGrid[8][i].active = true
          newGrid[10][i + 2].active = true
          newGrid[5][i + 1].active = true
        }
        setSynthParams(prev => ({
          ...prev,
          attack: 0.5,
          release: 2,
          waveform: 'sine'
        }))
        break

      case 'energetic':
        // Fast pattern with octaves
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
          waveform: 'square'
        }))
        break

      case 'cascade':
        // Descending pattern
        for (let i = 0; i < 16; i++) {
          newGrid[15 - i][i].active = true
        }
        break

      case 'rise':
        // Ascending pattern
        for (let i = 0; i < 16; i++) {
          newGrid[i][i].active = true
        }
        break
    }

    gridRef.current = newGrid
    setGrid(newGrid)
  }, [])

  const updateSynthParam = useCallback((param: string, value: number | string) => {
    setSynthParams(prev => ({
      ...prev,
      [param]: value
    }))
  }, [])

  const toggleDrums = useCallback(() => {
    setDrumEnabled(prev => !prev)
  }, [])

  const setDrumVolumeCallback = useCallback((volume: number) => {
    setDrumVolume(volume)

    // Update drum synth volumes in real-time
    if (drumSynthsRef.current) {
      const gainValue = Tone.dbToGain(volume)
      Object.values(drumSynthsRef.current).forEach(synth => {
        if (synth.volume) {
          synth.volume.value = volume
        }
      })
    }
  }, [])

  const selectDrumPattern = useCallback((patternId: string) => {
    setCurrentDrumPattern(patternId)
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
        updateSynthParam,
        selectCharacter,
        drumEnabled,
        drumVolume,
        currentDrumPattern,
        drumPatterns,
        toggleDrums,
        setDrumVolume: setDrumVolumeCallback,
        selectDrumPattern
      }}
    >
      {children}
    </SequencerContext.Provider>
  )
}