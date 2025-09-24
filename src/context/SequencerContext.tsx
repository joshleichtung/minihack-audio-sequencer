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
    character: 'sawtooth' // Oscillator type
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

  // Update synth parameters
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.set({
        oscillator: { type: synthParams.character as any },
        envelope: {
          attack: synthParams.attack,
          release: synthParams.release
        },
        volume: synthParams.volume
      })
    }
  }, [synthParams])

  // Update tempo
  useEffect(() => {
    Tone.Transport.bpm.value = tempo
  }, [tempo])

  const toggleCell = useCallback((row: number, col: number) => {
    const newGrid = [...gridRef.current]
    newGrid[row] = [...newGrid[row]]
    newGrid[row][col] = {
      ...newGrid[row][col],
      active: !newGrid[row][col].active
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
          const notes: string[] = []

          for (let row = 0; row < 16; row++) {
            if (gridRef.current[row][step].active) {
              const noteIndex = 15 - row
              const octave = Math.floor(noteIndex / 5) + 2
              const scaleIndex = noteIndex % 5
              const note = baseNotes[scaleIndex] + octave
              notes.push(note)
            }
          }

          if (notes.length > 0 && synthRef.current) {
            synthRef.current.triggerAttackRelease(notes, '16n', time)
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
          character: 'sine'
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
          character: 'square'
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