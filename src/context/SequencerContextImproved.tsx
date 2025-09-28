import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import * as Tone from 'tone'

interface Cell {
  active: boolean
  velocity: number
}

interface DrumPattern {
  id: string
  name: string
  genre: string
  pattern: number[][]  // [kick, snare, hihat, openhat] x 16 steps (0 or 1)
  kit: string
}

interface ScheduledEvent {
  time: number
  step: number
  executed: boolean
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

  // Scheduled events tracking
  const scheduledEventsRef = useRef<ScheduledEvent[]>([])
  const lookaheadTimeRef = useRef(100) // ms
  const scheduleIntervalRef = useRef<number | null>(null)
  const nextStepTimeRef = useRef(0)
  const currentStepRef = useRef(0)

  const [synthParams, setSynthParams] = useState({
    brightness: 50,
    texture: 20,
    attack: 0.01,
    release: 0.3,
    volume: -12,
    waveform: 'sawtooth',
    character: 'default'
  })

  const [effectsParams, setEffectsParams] = useState({
    reverb: 0,
    delay: 0,
    chorus: 0,
    wahFilter: 0
  })

  const [drumEnabled, setDrumEnabled] = useState(false)
  const [drumVolume, setDrumVolume] = useState(-6)
  const [currentDrumPattern, setCurrentDrumPattern] = useState('hiphop1')

  const synthRef = useRef<Tone.PolySynth | null>(null)
  const drumSynthsRef = useRef<{[key: string]: any}>({})
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
    // Add other patterns...
  ]

  // Lookahead scheduler function
  const scheduler = useCallback(() => {
    if (!isPlaying) return

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
        scheduleStep(step, nextStepTimeRef.current)
        scheduledEventsRef.current.push({
          time: nextStepTimeRef.current,
          step,
          executed: false
        })
      }

      // Advance to next step
      const secondsPerStep = 60.0 / (tempo * 4) // 16th notes
      nextStepTimeRef.current += secondsPerStep
      currentStepRef.current = (currentStepRef.current + 1) % 16
    }

    // Clean up old scheduled events
    scheduledEventsRef.current = scheduledEventsRef.current.filter(
      event => event.time > currentTime - 1
    )
  }, [isPlaying, tempo])

  const scheduleStep = useCallback((step: number, time: number) => {
    // Schedule UI update with slight anticipation for visual sync
    Tone.Draw.schedule(() => {
      setCurrentStep(step)
    }, time - 0.01) // 10ms early for visual feedback

    // Schedule audio events
    const transportTime = time - Tone.context.currentTime

    // Play melody notes
    const baseNotes = ['C', 'D', 'E', 'G', 'A']
    for (let row = 0; row < 16; row++) {
      const cell = gridRef.current[row][step]
      if (cell.active) {
        const noteIndex = 15 - row
        const octave = Math.floor(noteIndex / 5) + 2
        const scaleIndex = noteIndex % 5
        const note = baseNotes[scaleIndex] + octave

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
              // Schedule with precise timing
              if (drumName === 'snare' && synth.triggerAttackRelease) {
                synth.triggerAttackRelease('16n', `+${transportTime}`)
              } else if (synth.triggerAttackRelease) {
                synth.triggerAttackRelease('C1', '16n', `+${transportTime}`)
              }
            }
          }
        })
      }
    }
  }, [drumPatterns])

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

    // Chain effects
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

    // Initialize drum synthesizers with improved sounds
    initializeDrumSynths()

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
  }, [drumVolume])

  const initializeDrumSynths = () => {
    // KICK DRUM - Improved with pitch envelope
    const kickEnvelope = new Tone.Envelope({
      attack: 0.01,
      decay: 0.2,
      sustain: 0,
      release: 0.2
    })

    const kickPitchEnv = new Tone.Envelope({
      attack: 0.01,
      decay: 0.08,
      sustain: 0,
      release: 0
    })

    const kickOsc = new Tone.Oscillator(60, 'sine')
    kickPitchEnv.connect(kickOsc.frequency)
    kickEnvelope.connect(kickOsc.volume)

    const kickLowpass = new Tone.Filter(100, 'lowpass')
    kickOsc.connect(kickLowpass)
    kickLowpass.connect(drumGainRef.current!)

    const kickSynth = {
      triggerAttackRelease: (_note: string, duration: string, time?: string) => {
        if (time) {
          kickEnvelope.triggerAttackRelease(duration, time)
          kickPitchEnv.triggerAttackRelease(duration, time)
          kickOsc.start(time).stop(time + 0.5)
        } else {
          kickEnvelope.triggerAttackRelease(duration)
          kickPitchEnv.triggerAttackRelease(duration)
          kickOsc.start().stop('+0.5')
        }
      }
    }

    // SNARE DRUM - Layered for more punch
    const snareNoise = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.13, sustain: 0, release: 0.03 }
    })

    const snareTone = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.02 }
    })

    const snareFilter = new Tone.Filter(3000, 'highpass')
    const snareMix = new Tone.Gain(0.7)

    snareNoise.connect(snareMix)
    snareTone.connect(snareMix)
    snareMix.connect(snareFilter)
    snareFilter.connect(drumGainRef.current!)

    const snareSynth = {
      triggerAttackRelease: (duration: string, time?: string) => {
        if (time) {
          snareNoise.triggerAttackRelease(duration, time)
          snareTone.triggerAttackRelease('G3', duration, time)
        } else {
          snareNoise.triggerAttackRelease(duration)
          snareTone.triggerAttackRelease('G3', duration)
        }
      }
    }

    // HI-HAT - Metallic sound
    const hihatFilter = new Tone.Filter(10000, 'highpass')
    const hihatSynth = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.01 },
      harmonicity: 12,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1
    })
    hihatSynth.connect(hihatFilter)
    hihatFilter.connect(drumGainRef.current!)

    // OPEN HAT - Longer metallic sound
    const openhatFilter = new Tone.Filter(8000, 'highpass')
    const openhatSynth = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.3, sustain: 0.1, release: 0.3 },
      harmonicity: 10,
      modulationIndex: 16,
      resonance: 3000,
      octaves: 1.5
    })
    openhatSynth.connect(openhatFilter)
    openhatFilter.connect(drumGainRef.current!)

    drumSynthsRef.current = {
      kick: kickSynth,
      snare: snareSynth,
      hihat: hihatSynth,
      openhat: openhatSynth
    }
  }

  const disposeDrumSynths = () => {
    // Cleanup drum synths
    Object.values(drumSynthsRef.current).forEach((synth: any) => {
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

  const toggleCell = useCallback((row: number, col: number, shiftKey = false) => {
    const newGrid = [...gridRef.current]
    newGrid[row] = [...newGrid[row]]
    const currentCell = newGrid[row][col]

    if (shiftKey) {
      newGrid[row][col] = {
        active: !currentCell.active,
        velocity: 0.8
      }
    } else {
      if (!currentCell.active) {
        newGrid[row][col] = { active: true, velocity: 0.8 }
      } else if (currentCell.velocity === 0.8) {
        newGrid[row][col] = { active: true, velocity: 1.0 }
      } else if (currentCell.velocity === 1.0) {
        newGrid[row][col] = { active: true, velocity: 0.5 }
      } else {
        newGrid[row][col] = { active: false, velocity: 0.8 }
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
      setIsPlaying(false)
    } else {
      await Tone.start()

      // Initialize timing
      nextStepTimeRef.current = Tone.context.currentTime + 0.1 // Start slightly in the future
      currentStepRef.current = 0
      scheduledEventsRef.current = []

      // Start scheduler interval
      scheduleIntervalRef.current = window.setInterval(scheduler, 25) // Check every 25ms

      Tone.Transport.bpm.value = tempo
      Tone.Transport.start()
      setIsPlaying(true)
    }
  }, [isPlaying, tempo, scheduler])

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
          waveform: 'sine'
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
          waveform: 'square'
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
  const characterPatches: Record<string, any> = {
    default: null,
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

    const wetValue = value / 100

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
        selectDrumPattern
      }}
    >
      {children}
    </SequencerContext.Provider>
  )
}