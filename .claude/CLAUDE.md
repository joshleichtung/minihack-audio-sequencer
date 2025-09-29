# VibeLoop Project - Claude Configuration

## Project Overview

VibeLoop is a browser-based music sequencer with real-time audio synthesis, drum
patterns, and visual effects. Built with React, TypeScript, Tone.js for Web
Audio.

## Development Workflow Rules - MANDATORY ENFORCEMENT

### 🚨 CRITICAL DEVELOPMENT RULES - NEVER SKIP

1. **ZERO TOLERANCE FOR LINT ERRORS**: Run `npm run lint` and fix ALL issues
   IMMEDIATELY. NEVER commit with linting errors. NO EXCEPTIONS.
2. **NO --no-verify COMMITS**: Never use --no-verify flag. Fix lint issues
   first.
3. **LINT BEFORE EVERY CHANGE**: Run lint before making any code modifications
4. **COMMIT AND PUSH IMMEDIATELY**: After completing any feature/fix, commit AND
   push to remote
5. **NO UNCOMMITTED WORK**: Never leave working changes uncommitted at end of
   session
6. **VALIDATE BUILDS**: Run `npm run build` to ensure no build errors before
   major commits

### 🛑 MANDATORY LINT ENFORCEMENT

**ABSOLUTE PROHIBITION: NO ESLINT DISABLING**

- **NEVER** use `/* eslint-disable */` or `// eslint-disable-next-line` without
  explicit approval
- **NEVER** disable `@typescript-eslint/no-explicit-any` rule
- **NEVER** use `--no-verify` flag in git commits
- **NEVER** bypass linting with any workarounds
- **FIX THE CODE** to meet linting standards instead of disabling rules

**BEFORE ANY CODE CHANGE:**

```bash
npm run lint    # MUST pass with 0 errors before proceeding
```

**BEFORE EVERY COMMIT:**

```bash
npm run lint    # MUST pass with 0 errors
npm run build   # MUST pass without errors
git commit      # Only if both above pass
```

**IF LINTING FAILS:**

- Stop all development immediately
- Fix ALL linting errors one by one
- Run `npm run lint` until 0 errors remain
- THEN continue with development

### Git Workflow - MANDATORY

1. **Create feature branches** for ALL new work
2. **Incremental commits** for each logical change
3. **Descriptive commit messages** with context and impact
4. **Never work directly on main** - always use feature branches
5. **Merge only with explicit approval** from project owner
6. **Testing required** before any commit to feature branch
7. **Quality gates** must pass before merge requests
8. **Visual validation** using Playwright MCP for UI changes

### 🔄 Development Loop - ENFORCE EVERY TIME

```bash
# 1. Start feature work
git checkout -b feature/feature-name

# 2. During development - CONTINUOUSLY
npm run lint          # Fix any linting issues IMMEDIATELY
npm run build         # Verify build works

# 3. After ANY meaningful change - IMMEDIATELY
git add .
git commit -m "descriptive message"
git push              # NEVER FORGET TO PUSH

# 4. End of session - VERIFY
git status            # Must show "working tree clean"
git log --oneline -3  # Verify recent commits are pushed
```

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
- **NO ESLINT DISABLING** - especially `@typescript-eslint/no-explicit-any`
- **Explicit interfaces** for all data structures
- **Proper error handling** with try/catch blocks
- **Import organization** - group by: React, external libs, internal modules
- **Replace any types** with proper TypeScript interfaces immediately

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
- **Visual regression** using Maestro MCP screenshots
- **Audio synthesis** quality and consistency
- **Pattern loop** timing and musical coherence

### Testing Tools

- Jest for unit tests
- Playwright for E2E testing
- Maestro MCP for visual validation
- Tone.js test utilities for audio testing
- Manual testing on iOS/Android devices

### Automated Testing Pipeline

- **Pre-commit hooks** for linting and type checking
- **Visual testing** on every UI change
- **Audio testing** for timing consistency
- **Cross-browser** compatibility checks
- **Performance benchmarks** for audio latency

## Build & Deployment

### Development

- `npm run dev` - local development server
- `npm run build` - production build with size checks
- `npm run lint` - ESLint + TypeScript checks
- `npm run test` - run all test suites
- `npm run test:audio` - audio-specific tests
- `npm run test:visual` - visual regression tests

### Quality Gates

1. TypeScript compilation with no errors
2. ESLint passes with no warnings
3. All tests pass (unit, integration, E2E)
4. Visual regression tests pass
5. Audio timing tests pass
6. Build size under limits
7. Performance benchmarks met
8. Manual audio testing on target devices

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

## 🤖 Claude Code Development Reminders

### BEFORE Starting Any Work

```bash
cd /Users/josh/projects/vibeloop
git status                    # Check current state
npm run lint                  # Verify clean starting point
```

### DURING Development - After Each Change

```bash
npm run lint                  # Fix linting issues IMMEDIATELY
npm run build                 # Verify build integrity
# Continue with implementation only if both pass
```

### AFTER Completing Any Feature/Change

```bash
git add .
git commit -m "type: description"  # Descriptive commit message
git push                           # MANDATORY - never skip push
git status                         # Verify clean state
```

### END of Session Checklist

- [ ] All changes committed and pushed
- [ ] `git status` shows "working tree clean"
- [ ] No linting errors: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Development server running if continuing work

## Quick Reference Commands

```bash
# Start development
npm run dev

# Development quality check
npm run lint && npm run build

# Create feature branch
git checkout -b feature/your-feature-name

# Commit with proper message
git commit -m "feat: add new feature

Detailed description of changes and impact.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# ALWAYS push immediately
git push
```
