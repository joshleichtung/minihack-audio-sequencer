### 🎵 **Live at: [vibeloop.fly.dev](https://vibeloop.fly.dev/)**

# VibeLoop

![VibeLoop Demo](https://github.com/joshleichtung/minihack-audio-sequencer/raw/main/vibeloop-demo.gif)

A web-based audio grid sequencer with LCARS (Star Trek) visual aesthetics, featuring real-time effects and realistic drum machines.

**⚡ 2-hour hackfest project built as part of [AllThingsWeb.dev](https://allthingsweb.dev/)**

![VibeLoop](https://img.shields.io/badge/Status-Live-brightgreen?style=for-the-badge)
[![Deployed on Fly.io](https://img.shields.io/badge/Deployed%20on-Fly.io-purple?style=for-the-badge)](https://vibeloop.fly.dev/)

## ✨ Features

- **🎛️ 16x16 Interactive Grid**: Step sequencer with 256 cells for pattern creation
- **🎨 LCARS Visual Theme**: Star Trek-inspired interface design with authentic styling
- **🎹 Advanced Synth Engine**: Real-time synthesis with character patches and effects
- **🥁 Realistic Drum Machine**: 16 distinct drum patterns across Hip Hop, Jazz, D&B, and Electronic genres
- **⚡ Real-time Effects**: Reverb, delay, chorus, and wah filter with live control
- **✨ Visual Feedback**: Sparkle animations and side visualizers that react to music
- **⌨️ Spacebar Control**: Global play/stop with keyboard shortcuts
- **🎵 Preset Patterns**: Built-in arpeggios and textures for instant music creation

## 🚀 Live Demo

**Try it now: [vibeloop.fly.dev](https://vibeloop.fly.dev/)**

No installation required - just open in your browser and start making music!

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS with custom LCARS theme
- **Audio**: Tone.js (Web Audio synthesis and effects)
- **Deployment**: Docker + Fly.io
- **UI Components**: Custom LCARS-themed components

## 🎮 How to Use

1. **Start Playing**: Press the orange PLAY button or hit spacebar
2. **Create Patterns**: Click grid squares to activate/deactivate steps
3. **Adjust Sound**: Use the synth controls to modify brightness, texture, and character
4. **Add Effects**: Control reverb, delay, chorus, and wah filter in real-time
5. **Layer Drums**: Enable the drum machine and select from 16 different patterns
6. **Try Presets**: Use quick preset buttons for instant musical ideas

## 🔧 Local Development

```bash
# Clone the repository
git clone https://github.com/joshleichtung/minihack-audio-sequencer.git
cd minihack-audio-sequencer

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting and quality checks
npm run lint

# Run all tests
npm test

# Run specific test suites
npm run test:audio      # Audio timing tests
npm run test:visual     # Visual regression tests
npm run test:ui         # Interactive UI tests
npm run test:headed     # Run tests with browser visible
npm run test:debug      # Debug mode for tests
```

## ⚙️ Implementation Options

### Timing Engine Architectures

The app supports two distinct timing implementations that can be toggled in development:

#### **1. Tone.Sequence Implementation** (Default)
- **File**: `src/context/SequencerContext.tsx`
- **Approach**: Uses Tone.js built-in Sequence scheduler
- **Timing**: `'4n'` (quarter notes) - each step = 1 beat
- **Precision**: Relies on Tone.js internal timing
- **Benefits**: Simple, reliable, well-tested
- **Use Cases**: Standard musical applications

#### **2. Lookahead Scheduling Implementation** (Advanced)
- **File**: `src/context/SequencerContextImproved.tsx`
- **Approach**: Manual lookahead scheduling with 25ms precision
- **Timing**: `60.0 / tempo` seconds per step
- **Precision**: Custom timing engine with drift correction
- **Benefits**: Maximum timing accuracy, custom control
- **Use Cases**: Professional audio applications, timing-critical scenarios

### Switching Between Implementations

**For Development Testing:**
```typescript
// In src/main.tsx, toggle between:
import App from './App.tsx'                    // Uses Tone.Sequence
import AppWithTimingToggle from './AppWithTimingToggle.tsx'  // Runtime toggle

// AppWithTimingToggle provides UI toggle button for A/B testing
```

**For Production:**
- Choose implementation based on requirements
- Default: Tone.Sequence (more stable)
- Advanced: Lookahead (maximum precision)

### Audio Architecture Details

#### **Timing Precision Specifications**
- **Target Loop Time**: 6.857 seconds (16 beats @ 140 BPM)
- **Acceptable Drift**: <500ms over 10 loops (verified via E2E tests)
- **Step Precision**: ±10ms visual sync offset
- **Browser Compatibility**: Chrome (best), Firefox, Safari, Mobile

#### **Quality Gates**
1. **Syntax**: ESLint + TypeScript strict mode
2. **Performance**: Core Web Vitals compliance
3. **Accessibility**: WCAG 2.1 AA (44px touch targets)
4. **Audio Timing**: <500ms drift over 10 loops
5. **Security**: Dependency vulnerability scanning
6. **Browser Testing**: Cross-platform E2E validation

## 🧪 Testing

### Test Suites

#### **Audio Timing Tests** (`tests/e2e/audio-timing.spec.ts`)
Validates timing precision across browsers:
- **BPM Consistency**: ±50ms variance at 120 BPM
- **Drum Loop Precision**: No timing drift over multiple loops
- **Accumulation Errors**: <500ms drift over 10 complete loops
- **Cross-Browser**: Chrome, Firefox, Safari, Mobile

#### **Visual Regression Tests**
UI consistency and accessibility:
- Component rendering across viewport sizes
- LCARS theme consistency
- Mobile touch target compliance (44px minimum)
- Position indicator animation accuracy

#### **Interactive UI Tests**
User workflow validation:
- Grid cell activation/deactivation
- Transport controls (play/stop/spacebar)
- Synth parameter changes
- Effect control responsiveness
- Preset pattern loading

### Running Tests

```bash
# Quick test run (essential tests only)
npm test

# Full test suite with timing validation
npm run test:audio

# Visual testing with browser visible
npm run test:headed

# Debug specific test failures
npm run test:debug

# Run tests for specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Troubleshooting Tests

#### **Timing Test Failures**
- **Issue**: >500ms drift over 10 loops
- **Cause**: Browser audio context precision, system load
- **Solution**: Run on dedicated test machine, check implementation choice

#### **Mobile Accessibility Failures**
- **Issue**: Grid cells not clickable on mobile
- **Cause**: Touch target size <44px, visibility issues
- **Solution**: Verify CSS grid layout, check component styling

#### **Cross-Browser Inconsistencies**
- **Issue**: Tests pass in Chrome, fail in Safari/Firefox
- **Cause**: Web Audio API implementation differences
- **Solution**: Browser-specific timing adjustments may be needed

### Development Workflow

```bash
# 1. Start development
npm run dev

# 2. Make changes, run relevant tests
npm run test:audio        # After timing changes
npm run lint              # After code changes

# 3. Full validation before commit
npm test && npm run lint

# 4. Manual testing
# - Load http://localhost:5173
# - Test audio playback, timing, interactions
# - Verify mobile responsiveness
```

## 🎵 Musical Features

### Synth Engine
- **Character Patches**: Nebula, Plasma, Quantum, Warp Drive, Photon, Void
- **Real-time Controls**: Brightness (filter cutoff), Texture (resonance), Attack/Release
- **Waveforms**: Sine, Sawtooth, Square, Triangle

### Effects Chain
- **Reverb**: Room to hall spatial effects
- **Delay**: Rhythmic 8th-note feedback delay
- **Chorus**: Subtle to lush modulation
- **Wah Filter**: Squelchy auto-wah sweep

### Drum Machine
- **16 Patterns**: Boom Bap, Trap, Drill, Lo-Fi, Swing, Bebop, D&B, and more
- **Realistic Sounds**: Punchy kick, snappy snare, crisp hi-hats using advanced synthesis
- **Live Control**: Pattern switching and volume control during playback

## 🎨 Design Inspiration

- **LCARS**: Star Trek's Library Computer Access/Retrieval System UI
- **Modern Web Audio**: Bringing hardware sequencer experience to the browser

## 🌟 Philosophy

VibeLoop prioritizes visual impact and immediate playability for both musicians and non-musicians, making electronic music creation accessible, engaging, and fun. The LCARS aesthetic creates an immersive sci-fi music-making experience that feels both futuristic and intuitive.

---

**Made with ❤️ for music creators everywhere**

[🎵 Start Making Music Now →](https://vibeloop.fly.dev/)