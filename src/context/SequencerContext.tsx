import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import * as Tone from 'tone'
import { Scale, Chord } from 'tonal'

interface Cell {
  active: boolean
  velocity: number
}

interface SequencerContextType {
  grid: Cell[][]
  isPlaying: boolean
  tempo: number
  currentStep: number
  toggleCell: (row: number, col: number) => void
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

  const synthRef = useRef<Tone.PolySynth | null>(null)
  const sequencerRef = useRef<Tone.Sequence | null>(null)

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

    return () => {
      if (sequencerRef.current) {
        sequencerRef.current.dispose()
      }
      if (synthRef.current) {
        synthRef.current.dispose()
      }
    }
  }, [])

  // Character patch definitions
  const characterPatches: Record<string, any> = {
    default: {
      oscillator: { type: synthParams.waveform },
      envelope: { attack: synthParams.attack, release: synthParams.release },
      filterEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.3 }
    },
    nebula: {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.8, decay: 0.3, sustain: 0.7, release: 2.0 },
      filterEnvelope: { attack: 0.5, decay: 0.2, sustain: 0.3, release: 1.5 }
    },
    plasma: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0.3, release: 0.2 },
      filterEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.1 }
    },
    quantum: {
      oscillator: { type: 'square' },
      envelope: { attack: 0.001, decay: 0.01, sustain: 0.1, release: 0.05 },
      filterEnvelope: { attack: 0.001, decay: 0.01, sustain: 0.1, release: 0.01 }
    },
    warpDrive: {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.8, release: 0.5 },
      filterEnvelope: { attack: 0.1, decay: 0.3, sustain: 0.6, release: 0.4 }
    },
    photon: {
      oscillator: { type: 'pulse' as any },
      envelope: { attack: 0.001, decay: 0.001, sustain: 0.01, release: 0.1 },
      filterEnvelope: { attack: 0.001, decay: 0.01, sustain: 0.0, release: 0.05 }
    },
    void: {
      oscillator: { type: 'fatsawtooth' as any },
      envelope: { attack: 0.3, decay: 0.5, sustain: 0.9, release: 1.5 },
      filterEnvelope: { attack: 0.4, decay: 0.3, sustain: 0.7, release: 1.0 }
    }
  }

  // Update synth parameters
  useEffect(() => {
    if (synthRef.current) {
      const patch = characterPatches[synthParams.character] || characterPatches.default

      // Apply character patch
      synthRef.current.set({
        ...patch,
        volume: synthParams.volume
      })

      // Override with manual controls if using default
      if (synthParams.character === 'default') {
        synthRef.current.set({
          oscillator: { type: synthParams.waveform as any },
          envelope: {
            attack: synthParams.attack,
            release: synthParams.release
          }
        })
      }
    }
  }, [synthParams])

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
        updateSynthParam
      }}
    >
      {children}
    </SequencerContext.Provider>
  )
}