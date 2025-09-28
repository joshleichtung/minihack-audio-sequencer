# Maestro MCP Integration Guide

This document outlines how to use Maestro MCP for visual feedback during development of the VibeLoop music sequencer.

## Overview

Maestro MCP provides real-time visual feedback capabilities that allow Claude to:
- Take screenshots of the running application
- Monitor visual changes during development
- Validate UI implementations against design specifications
- Perform visual regression testing
- Debug layout and styling issues in real-time

## Setup

### Prerequisites

1. **Running Development Server**: Ensure the app is running at http://localhost:5173
   ```bash
   npm run dev
   ```

2. **Browser Access**: Chrome/Chromium browser available for automated screenshots

3. **Maestro MCP Configuration**: Configured in Claude Code for browser automation

## Integration Workflows

### 1. Component Development with Visual Validation

When developing new UI components:

```typescript
// 1. Implement component
// 2. Add test-id attributes for E2E testing
// 3. Use Maestro to take screenshot for validation
// 4. Compare against design specifications
// 5. Iterate based on visual feedback
```

### 2. Real-time Visual Debugging

During development iterations:
- Take screenshots before/after changes
- Monitor responsive behavior across device sizes
- Validate LCARS design system compliance
- Check audio visualizer rendering
- Verify grid layout and positioning

### 3. Quality Assurance Integration

Visual testing integration:
- Screenshot comparison tests
- Cross-browser visual validation
- Mobile responsive design checks
- Dark/light theme consistency
- Animation and transition validation

## Maestro Commands for VibeLoop

### Basic Screenshots

```bash
# Take full page screenshot
take_screenshot(url="http://localhost:5173")

# Take mobile viewport screenshot
take_screenshot(url="http://localhost:5173", viewport="mobile")

# Take specific component screenshot
take_screenshot(url="http://localhost:5173", selector="[data-testid='grid']")
```

### Interactive Testing

```bash
# Test playback functionality
navigate_to("http://localhost:5173")
click_element("[data-testid='play-button']")
take_screenshot(description="Playback active state")

# Test grid interaction
click_element("[data-testid='grid-cell-0-0']")
take_screenshot(description="Grid cell activated")
```

### Responsive Design Validation

```bash
# Test various viewport sizes
for size in ["320x568", "768x1024", "1920x1080"]:
    set_viewport(size)
    take_screenshot(description=f"Layout at {size}")
```

## Visual Validation Scenarios

### 1. Grid Component Validation
- **Objective**: Ensure 16x8 grid displays correctly
- **Visual Checks**: Cell positioning, hover states, active states
- **Responsive**: Mobile touch targets (44px minimum)

### 2. Transport Controls Validation
- **Objective**: Verify play/pause button states
- **Visual Checks**: Icon changes, color states, hover effects
- **Accessibility**: Focus indicators, contrast ratios

### 3. LCARS Design System Compliance
- **Objective**: Maintain Star Trek LCARS aesthetic
- **Visual Checks**: Color palette, typography, border radius
- **Components**: All UI elements follow LCARS conventions

### 4. Audio Visualizer Validation
- **Objective**: Real-time audio visualization
- **Visual Checks**: Waveform rendering, frequency bars
- **Performance**: Smooth 60fps animation

### 5. Mobile Responsive Validation
- **Objective**: Touch-friendly interface on mobile
- **Visual Checks**: Layout adaptation, button sizing
- **Interaction**: Touch gestures, scrolling behavior

## Development Workflow Integration

### Code → Visual → Iterate Cycle

1. **Code Implementation**
   ```typescript
   // Implement feature
   const newComponent = () => { /* ... */ }
   ```

2. **Visual Validation**
   ```bash
   # Take screenshot to validate implementation
   take_screenshot(component="new-component")
   ```

3. **Comparison & Analysis**
   - Compare against design specifications
   - Check responsive behavior
   - Validate accessibility compliance

4. **Iteration**
   - Make adjustments based on visual feedback
   - Repeat cycle until satisfactory

### Automated Visual Testing Pipeline

```yaml
# Example CI/CD integration
visual_tests:
  - name: "Grid Layout"
    url: "http://localhost:5173"
    selector: "[data-testid='grid']"
    viewports: ["desktop", "tablet", "mobile"]

  - name: "Transport Controls"
    url: "http://localhost:5173"
    selector: "[data-testid='transport']"
    interactions: ["hover", "focus", "active"]

  - name: "Full Page Layout"
    url: "http://localhost:5173"
    viewport: "1920x1080"
    compare_against: "baseline_screenshots/main.png"
```

## Best Practices

### 1. Screenshot Naming Convention
```
screenshots/
├── components/
│   ├── grid_default_desktop.png
│   ├── grid_active_mobile.png
│   └── transport_playing_tablet.png
├── pages/
│   ├── main_page_desktop.png
│   └── main_page_mobile.png
└── states/
    ├── playback_active.png
    └── pattern_selected.png
```

### 2. Visual Regression Detection
- Maintain baseline screenshots for each component
- Automated comparison on every change
- Flag visual differences for review
- Version control visual assets

### 3. Performance Considerations
- Take screenshots at consistent timing intervals
- Allow sufficient time for animations to complete
- Consider loading states and async operations
- Optimize screenshot resolution vs. file size

## Troubleshooting

### Common Issues

1. **Timing Issues**
   - Allow sufficient time for React hydration
   - Wait for audio context initialization
   - Account for animation durations

2. **Responsive Layout Problems**
   - Verify CSS media queries
   - Check viewport meta tag
   - Validate touch target sizes

3. **Browser Compatibility**
   - Test across multiple browsers
   - Account for browser-specific differences
   - Validate Web Audio API support

### Debug Commands

```bash
# Check if app is loaded
check_element_exists("[data-testid='grid']")

# Verify audio context state
execute_script("return window.Tone?.context?.state")

# Get current viewport size
get_viewport_size()
```

## Maestro MCP Configuration

### Required Settings
```json
{
  "browser": "chromium",
  "headless": false,
  "viewport": {
    "width": 1920,
    "height": 1080
  },
  "timeout": 30000,
  "screenshot_quality": 90,
  "wait_for_load": true
}
```

This integration enables real-time visual feedback during development, ensuring the VibeLoop interface maintains its high-quality LCARS aesthetic while providing excellent user experience across all devices.