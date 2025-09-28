# VibeLoop Project - Claude Configuration

## Project Overview
VibeLoop is a browser-based music sequencer with real-time audio synthesis, drum patterns, and visual effects. Built with React, TypeScript, Tone.js for Web Audio.

## Development Workflow Rules

### Git Workflow - MANDATORY
1. **Create feature branches** for ALL new work
2. **Incremental commits** for each logical change
3. **Descriptive commit messages** with context and impact
4. **Never work directly on main** - always use feature branches
5. **Merge only with explicit approval** from project owner

### Commit Message Format
```
<type>: <description>

<body explaining what and why>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

Types: feat, fix, refactor, perf, docs, test, chore

### Branch Naming Convention
- `feature/timing-improvements`
- `fix/mobile-audio-issues`
- `refactor/drum-synthesis`
- `docs/api-documentation`

## Code Standards

### TypeScript Requirements
- **Strict mode enabled** - no `any` types without justification
- **Explicit interfaces** for all data structures
- **Proper error handling** with try/catch blocks
- **Import organization** - group by: React, external libs, internal modules

### Audio Development Best Practices
- **Use lookahead scheduling** for all timing-critical operations
- **Dispose audio nodes** properly to prevent memory leaks
- **Test on mobile devices** - iOS Safari and Android Chrome
- **Consider WebAudio limitations** - mobile autoplay policies

### Performance Requirements
- **Bundle size** < 500KB initial load
- **Audio latency** < 50ms for user interactions
- **60fps rendering** for visual components
- **Memory usage** monitored and optimized

## File Organization

### Directory Structure
```
src/
├── audio/           # Audio engines and synthesis
├── components/      # React UI components
├── context/         # React context providers
├── hooks/           # Custom React hooks
├── utils/           # Pure utility functions
└── types/           # TypeScript type definitions
```

### Naming Conventions
- **Components**: PascalCase (`DrumControls.tsx`)
- **Files**: camelCase (`audioEngine.ts`)
- **Constants**: SCREAMING_SNAKE_CASE
- **Interfaces**: PascalCase with descriptive names

## Testing Requirements

### Must Test
- **Audio timing accuracy** with test harness
- **Mobile compatibility** on real devices
- **Cross-browser support** (Chrome, Firefox, Safari)
- **Touch interactions** for mobile interface

### Testing Tools
- Jest for unit tests
- Playwright for E2E testing
- Manual testing on iOS/Android devices

## Build & Deployment

### Development
- `npm run dev` - local development server
- `npm run build` - production build with size checks
- `npm run lint` - ESLint + TypeScript checks

### Quality Gates
1. TypeScript compilation with no errors
2. ESLint passes with no warnings
3. Build size under limits
4. Manual audio testing

## Audio Architecture Guidelines

### Tone.js Best Practices
- **Use Transport.bpm** for tempo synchronization
- **Implement proper scheduling** with lookahead buffers
- **Chain effects properly** to avoid feedback loops
- **Dispose synthesizers** in cleanup functions

### Mobile Audio Support
- **Initialize on user interaction** using MobileAudioManager
- **Test audio unlock** on iOS Safari specifically
- **Handle autoplay restrictions** gracefully

## Component Development

### React Patterns
- **Functional components** with hooks only
- **useCallback** for event handlers
- **useMemo** for expensive calculations
- **Context** for global state (audio, sequencer)

### State Management
- React Context for audio state
- Local state for UI-only interactions
- Refs for audio nodes and timing data

## Documentation Requirements

### Code Documentation
- **JSDoc comments** for all public functions
- **README updates** for significant features
- **API documentation** for audio modules
- **Technical decisions** documented in TECHNICAL_ANALYSIS.md

### User Documentation
- **Feature descriptions** in README
- **Keyboard shortcuts** documented
- **Mobile usage notes** included

## Performance Monitoring

### Audio Performance
- Monitor audio callback execution time
- Track Web Audio memory usage
- Measure timing accuracy vs BPM

### UI Performance
- Use React DevTools Profiler
- Monitor render frequency
- Optimize heavy re-renders

## Security Considerations

### Web Audio Security
- **No external audio loading** without validation
- **Sanitize user input** for pattern data
- **Rate limit** audio operations if needed

### Data Handling
- **Local storage only** for patterns/projects
- **No server communication** for audio data
- **Privacy-first** design approach

## Browser Compatibility

### Minimum Support
- Chrome 80+
- Firefox 75+
- Safari 13+ (iOS Safari 13+)
- Edge 80+

### Web Audio Features
- AudioContext required
- OfflineAudioContext for rendering
- AudioWorklet preferred over ScriptProcessor

## Mobile Considerations

### Touch Interface
- **44px minimum** touch target size
- **Gesture support** for zoom/pan on grid
- **Responsive breakpoints** for mobile layouts

### Performance
- **Reduced complexity** on mobile
- **Battery usage optimization**
- **Memory usage awareness**

## Future Development Notes

### Planned Features
- Real-time collaboration (WebSockets)
- MIDI I/O support
- Sample loading and playback
- Audio effects expansion

### Technical Debt Tracking
- Update TODO.md for major debt items
- Document architectural decisions
- Plan refactoring sessions

---

## Quick Reference Commands

```bash
# Start development
npm run dev

# Full build test
npm run build && npm run lint

# Create feature branch
git checkout -b feature/your-feature-name

# Commit with proper message
git commit -m "feat: add new feature

Detailed description of changes and impact.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```