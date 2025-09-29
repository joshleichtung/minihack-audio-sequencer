// Component prop type definitions

export interface VisualizerProps {
  side: 'left' | 'right'
}

export interface GridCellProps {
  cell: {
    active: boolean
    velocity: number
  }
  rowIndex: number
  colIndex: number
  isCurrentStep: boolean
  isSparkle: boolean
  onToggle: (rowIndex: number, colIndex: number, shiftKey: boolean) => void
}

export interface NoteLabelsProps {
  currentScale: {
    id: string
    name: string
    intervals: number[]
    description: string
  }
  currentKey: {
    id: string
    name: string
    rootNote: string
    pitchClass: number
  }
}

// Button component props
export interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  'data-testid'?: string
  'aria-pressed'?: 'true' | 'false'
  type?: 'button' | 'submit' | 'reset'
}

// Input component props
export interface SliderProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  label?: string
  className?: string
  'data-testid'?: string
}

export interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: Array<{
    value: string
    label: string
  }>
  label?: string
  className?: string
  'data-testid'?: string
}

// Common component patterns
export interface BaseComponentProps {
  className?: string
  'data-testid'?: string
  children?: React.ReactNode
}

export interface ControlComponentProps extends BaseComponentProps {
  disabled?: boolean
  loading?: boolean
}

// EffectsControls component props
export interface EffectSliderProps {
  label: string
  value: number
  description: string
  onChange: (value: number) => void
}

export interface PresetButtonProps {
  name: string
  onClick: () => void
}

export interface EffectsPresetsProps {
  updateEffectsParam: (param: keyof import('./audio').EffectParameters, value: number) => void
}

// DrumControls component props
export interface DrumToggleButtonProps {
  drumEnabled: boolean
  onToggle: () => void
}

export interface DrumVolumeControlProps {
  drumVolume: number
  drumEnabled: boolean
  onVolumeChange: (volume: number) => void
}

export interface DrumPatternSelectorProps {
  drumPatterns: Array<{
    id: string
    name: string
    genre: string
  }>
  currentDrumPattern: string
  drumEnabled: boolean
  onPatternSelect: (patternId: string) => void
}

export interface DrumKitSelectorProps {
  drumKits: Array<{
    id: string
    name: string
    description: string
  }>
  currentDrumKit: string
  drumEnabled: boolean
  onKitSelect: (kitId: string) => void
}