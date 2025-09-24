# Planning Document - Minihack Audio Grid Sequencer

## Project Goal
Create a demo-worthy web-based audio sequencer in 2 hours that combines:
- Tenori-On's intuitive grid interface
- LCARS (Star Trek) visual aesthetics
- Simplified synthesis for non-musicians

## Research Findings

### Tenori-On Key Features
- 16x16 LED button matrix (256 interactive cells)
- Horizontal axis = time, Vertical axis = pitch
- Multiple performance modes (Score, Random, Draw, Bounce, Push, Solo)
- Visual feedback with patterns visible as they play
- Compact, handheld design philosophy

### LCARS Design Language
- **Colors**: Black background with pastel blues, purples, oranges
- **Typography**: Condensed sans-serif, all caps
- **Elements**: Rounded corner frames, minimal activity displays
- **Philosophy**: Advanced technology should appear effortless

## Technical Architecture

### Component Structure
```
App.tsx (main layout with LCARS frame)
├── Grid.tsx (16x16 sequencer)
├── SynthControls.tsx (simplified parameters)
├── PresetButtons.tsx (patterns & arpeggios)
└── Transport.tsx (play/stop/tempo)
```

### Audio Engine Design
- **Synthesis**: Subtractive synth via Tone.js
- **Sequencing**: 16-step pattern, adjustable tempo
- **Scale**: C major pentatonic (accessible for non-musicians)
- **Polyphony**: 8-voice for rich textures

### Simplified Controls for Non-Musicians
1. **Brightness** → Filter cutoff
2. **Texture** → Filter resonance
3. **Attack** → Note onset speed
4. **Release** → Note decay time
5. **Character** → Oscillator type

### Preset Patterns
- **Ambient**: Slow attack, minor 7th chords, long release
- **Energetic**: Fast attack, major triads with octaves
- **Mysterious**: Pentatonic scale with reverb
- **Bouncy**: Staccato notes in major scale
- **Cascade**: Descending arpeggio patterns
- **Rise**: Ascending melodic sequences

## Implementation Timeline (1h 15m remaining)

1. **Setup** (5 min): Git, GitHub, React project
2. **Core Grid** (20 min): Interactive 16x16 matrix
3. **Audio** (20 min): Tone.js integration
4. **Styling** (15 min): LCARS theme application
5. **Controls** (10 min): Synth parameters
6. **Presets** (10 min): Pattern generators
7. **Polish** (10 min): Final touches for demo

## Success Metrics
- Visual impact on first load
- Immediate sound on interaction
- Non-musician can create pleasant patterns
- Smooth performance during demo
- "Cool factor" for hackathon presentation