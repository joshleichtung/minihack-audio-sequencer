# VibeLoop Modular Instrument Architecture

## Overview

This document outlines the new modular architecture for VibeLoop that enables:

- **Multiple instrument instances** (e.g., multiple synths, drum kits)
- **Standardized interfaces** for all instruments and effects
- **Unified mixer system** with per-track effects and controls
- **Extensible design** for future instrument types
- **Backward compatibility** with existing code

## Architecture Components

### 1. Core Interfaces

#### InstrumentInterface

The foundation of all instruments, defining a standard contract:

```typescript
interface InstrumentInterface {
  // Identification
  readonly id: string
  readonly name: string
  readonly type: InstrumentType

  // Lifecycle management
  initialize(): Promise<void>
  dispose(): void

  // Audio playback
  triggerNote(note: string | number, velocity: number, time?: ToneTime): void
  triggerAttackRelease(
    note: string | number,
    duration: ToneDuration,
    time?: ToneTime
  ): void

  // Parameter control (dynamic UI generation)
  setParameter<T>(paramId: string, value: T): void
  getParameter<T>(paramId: string): T

  // Effects integration
  connectToEffectsChain(effectsChain: EffectsChain): void

  // Output routing
  getOutput(): Tone.ToneAudioNode
}
```

#### EffectsChain

Standardized effects processing:

```typescript
interface EffectsChain {
  addEffect(effect: EffectInterface): void
  removeEffect(effectId: string): void
  connect(input: Tone.ToneAudioNode): void
  getOutput(): Tone.ToneAudioNode
}
```

#### MixerInterface

Unified mixing and routing:

```typescript
interface MixerInterface {
  createTrack(id: string, name: string): MixerTrack
  getTrack(id: string): MixerTrack | null
  setMasterVolume(volume: number): void
  getMasterOutput(): Tone.ToneAudioNode
}
```

### 2. Instrument Factory System

The `InstrumentFactory` provides a unified way to create instruments:

```typescript
// Create a polyphonic synthesizer
const synth = await factory.create({
  type: 'polySynth',
  name: 'Lead Synth',
  parameters: {
    oscillatorType: 'sawtooth',
    attack: 0.1,
    release: 0.3,
  },
})

// Create from preset
const bass = await factory.createWithPreset('monoSynth', 'bass', {
  name: 'Bass Line',
})
```

**Supported Instrument Types:**

- `polySynth` - Multi-voice synthesizer for chords
- `monoSynth` - Single-voice synthesizer for leads/bass
- `drumKit` - Multi-sample drum machine
- `sampler` - Sample-based instruments (future)

### 3. Effects System

Modular effects that can be chained:

```typescript
// Create effects chain
const effectsChain = new StandardEffectsChain('track1_fx')

// Add effects
effectsChain.addEffect(new ReverbEffect('reverb1'))
effectsChain.addEffect(new DelayEffect('delay1'))

// Connect to instrument
instrument.connectToEffectsChain(effectsChain)
```

**Built-in Effects:**

- Reverb (decay, pre-delay, wet level)
- Delay (time, feedback, wet level)
- Filter (frequency, resonance, type)
- Chorus (rate, depth, wet level)
- Distortion (drive, wet level)

### 4. Mixer System

Each instrument gets its own mixer track:

```typescript
// Create mixer and tracks
const mixer = new StandardMixer()
const track1 = mixer.createTrack('lead', 'Lead Synth')
const track2 = mixer.createTrack('bass', 'Bass Line')

// Assign instruments to tracks
track1.setInstrument(leadSynth)
track2.setInstrument(bassSynth)

// Control track parameters
track1.setVolume(0.8)
track1.setPan(-0.2)
track2.solo()
```

**Track Features:**

- Volume, pan, mute, solo controls
- Individual effects chains per track
- Automatic solo/mute logic
- Master output routing

### 5. Grid Sequencer Integration

Multi-instrument grid support:

```typescript
interface SequencerGrid {
  registerInstrument(instrumentId: string, rows: number, cols: number): void
  toggleCell(instrumentId: string, row: number, col: number): void
  getGrid(instrumentId: string): Cell[][]
}
```

## Benefits of Modular Architecture

### 1. Scalability

- **Add new instruments** without touching existing code
- **Multiple instances** of the same instrument type
- **Dynamic UI generation** from parameter definitions
- **Plugin-style architecture** for future extensions

### 2. Maintainability

- **Clear separation of concerns** between instruments, effects, and mixing
- **Standardized interfaces** reduce complexity
- **Type safety** throughout the system
- **Easier testing** with isolated components

### 3. User Experience

- **Consistent UI patterns** across all instruments
- **Professional mixing experience** with individual track controls
- **Preset system** for quick instrument creation
- **Real-time parameter control** with immediate audio feedback

### 4. Performance

- **Efficient audio routing** through Tone.js chains
- **Lazy initialization** of audio resources
- **Proper cleanup** prevents memory leaks
- **Optimized scheduling** for tight timing

## Migration Strategy

### Phase 1: Parallel Implementation

✅ **Completed - Core Architecture**

- Created all interface definitions
- Implemented base classes and factories
- Built effects chain and mixer systems
- Established parameter system for dynamic UIs

### Phase 2: Backward Compatibility Layer

🔄 **Current Phase**

- Create adapter layer for existing SequencerContext
- Wrap current synth/drum implementations in new interfaces
- Maintain existing component APIs
- Gradual migration of UI components

### Phase 3: Migration of Components

📋 **Next Phase**

- Update SequencerContext to use new architecture
- Migrate individual UI components (SynthControls, DrumControls)
- Add multi-instrument support to grid
- Implement preset loading/saving

### Phase 4: Advanced Features

🚀 **Future Features**

- Add more instrument types (sampler, FM synth)
- Implement complex effects (compressor, EQ, vocoder)
- Add automation lanes for parameters
- MIDI I/O support
- Audio recording and export

## Example Usage

### Creating a Multi-Instrument Setup

```typescript
// Initialize system
const factory = StandardInstrumentFactory.getInstance()
const mixer = new StandardMixer()

// Create instruments
const leadSynth = await factory.createWithPreset('polySynth', 'lead')
const bassSynth = await factory.createWithPreset('monoSynth', 'bass')
const drums = await factory.createWithPreset('drumKit', 'hiphop')

// Create mixer tracks
const leadTrack = mixer.createTrack('lead', 'Lead Synth')
const bassTrack = mixer.createTrack('bass', 'Bass Line')
const drumTrack = mixer.createTrack('drums', 'Drums')

// Assign instruments
leadTrack.setInstrument(leadSynth)
bassTrack.setInstrument(bassSynth)
drumTrack.setInstrument(drums)

// Add effects
leadTrack.getEffectsChain().addEffect(new ReverbEffect('lead_reverb'))
bassTrack.getEffectsChain().addEffect(new FilterEffect('bass_filter'))

// Connect to output
mixer.connectToDestination()

// Play notes
leadSynth.triggerAttackRelease('C4', '4n', '+0.1')
bassSynth.triggerAttackRelease('C2', '2n', '+0.2')
drums.triggerNote(36, 0.8, '+0.3') // Kick drum
```

### Dynamic Parameter Control

```typescript
// Get available parameters
const paramNames = leadSynth.getParameterNames()
// ['oscillatorType', 'attack', 'decay', 'sustain', 'release', 'filterFrequency']

// Control parameters
leadSynth.setParameter('attack', 0.2)
leadSynth.setParameter('filterFrequency', 2000)

// Read current values
const currentAttack = leadSynth.getParameter<number>('attack')
```

### Effects Management

```typescript
const track = mixer.getTrack('lead')
const effectsChain = track.getEffectsChain()

// Add reverb
const reverb = new ReverbEffect('reverb1')
reverb.setParameter('decay', 3.0)
reverb.setParameter('wet', 0.4)
effectsChain.addEffect(reverb)

// Add delay after reverb
const delay = new DelayEffect('delay1')
delay.setParameter('delayTime', '8n')
delay.setParameter('feedback', 0.3)
effectsChain.addEffect(delay)

// Remove effect
effectsChain.removeEffect('reverb1')
```

## File Structure

```
src/
├── types/
│   └── instruments.ts          # Core type definitions
├── audio/
│   ├── instruments/
│   │   ├── BaseInstrument.ts   # Base instrument class
│   │   ├── InstrumentFactory.ts # Factory for creating instruments
│   │   ├── ModularSynth.ts     # Synth implementations
│   │   └── ModularDrumKit.ts   # Drum kit implementation
│   ├── effects/
│   │   ├── EffectsChain.ts     # Effects chain implementation
│   │   └── StandardEffects.ts  # Built-in effects
│   └── mixer/
│       └── StandardMixer.ts    # Mixer implementation
└── context/
    └── ModularSequencerContext.tsx # New context using modular architecture
```

## Technical Considerations

### Audio Routing

The architecture maintains clean audio signal flow:

```
Instrument → Track Gain → Pan → Effects Chain → Track Output → Master Mix → Destination
```

### Memory Management

- All audio nodes implement proper disposal
- Effects chains automatically clean up when removed
- Instruments dispose of internal Tone.js objects
- Mixer tracks clean up on removal

### Parameter System

- Type-safe parameter access with generics
- Automatic UI generation from parameter definitions
- Validation and clamping of parameter values
- Support for different parameter types (range, boolean, select)

### Performance Optimization

- Lazy initialization of audio resources
- Efficient parameter updates through direct Tone.js access
- Minimal object creation during playback
- Optimized effect chain routing

This modular architecture provides a solid foundation for expanding VibeLoop
into a full-featured DAW-style application while maintaining the simplicity and
performance of the current implementation.
