/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */
import { useSequencer } from '../context/SequencerContext'
import { SCALES, KEYS } from '../utils/scales'
import type { SynthParameters } from '../types'

type SliderConfig = {
  label: string
  param: keyof SynthParameters
  min: number
  max: number
  value: number
  displayValue: string
  transformValue?: (value: number) => number
  reverseTransform?: (value: number) => number
}

const SliderControl = ({
  config,
  onUpdate,
}: {
  config: SliderConfig
  onUpdate: (param: keyof SynthParameters, value: string | number) => void
}): React.JSX.Element => (
  <div>
    <label className="text-lcars-orange text-sm flex justify-between">
      <span>{config.label}</span>
      <span className="text-xs">{config.displayValue}</span>
    </label>
    <input
      type="range"
      min={config.min}
      max={config.max}
      value={config.value}
      onChange={(e): void => {
        const rawValue = Number(e.target.value)
        const finalValue = config.reverseTransform ? config.reverseTransform(rawValue) : rawValue
        onUpdate(config.param, finalValue)
      }}
      className="w-full h-8 touch-manipulation"
    />
  </div>
)

const ButtonGrid = ({
  label,
  options,
  currentValue,
  onSelect,
  colorClass = 'lcars-orange',
}: {
  label: string
  options: Array<{ id: string; name: string }> | string[]
  currentValue: string
  onSelect: (value: string) => void
  colorClass?: string
}): React.JSX.Element => (
  <div>
    <label className={`text-${colorClass} text-sm`}>{label}</label>
    <div className="grid grid-cols-2 gap-2 mt-1">
      {options.map(option => {
        const optionId = typeof option === 'string' ? option : option.id
        const optionName = typeof option === 'string' ? option.toUpperCase() : option.name

        return (
          <button
            key={optionId}
            onClick={(): void => onSelect(optionId)}
            className={`px-3 py-2 rounded text-xs min-h-[48px] touch-manipulation ${
              currentValue === optionId
                ? `bg-${colorClass} text-black`
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            {optionName}
          </button>
        )
      })}
    </div>
  </div>
)

const CHARACTER_PATCHES = [
  { id: 'default', name: 'DEFAULT' },
  { id: 'nebula', name: 'NEBULA' },
  { id: 'plasma', name: 'PLASMA' },
  { id: 'quantum', name: 'QUANTUM' },
  { id: 'warpDrive', name: 'WARP' },
  { id: 'photon', name: 'PHOTON' },
  { id: 'void', name: 'VOID' },
] as const

const WAVEFORMS = ['sine', 'sawtooth', 'square', 'triangle'] as const

const LFO_TARGETS = [
  { id: 'frequency', name: 'FREQ' },
  { id: 'filter', name: 'FILTER' },
  { id: 'amplitude', name: 'AMP' },
] as const

const SUB_OSC_TYPES = ['sine', 'sawtooth', 'square', 'triangle'] as const

const createSliderConfigs = (synthParams: SynthParameters): SliderConfig[] => [
  {
    label: 'BRIGHTNESS',
    param: 'brightness',
    min: 0,
    max: 100,
    value: synthParams.brightness,
    displayValue: String(synthParams.brightness),
  },
  {
    label: 'TEXTURE',
    param: 'texture',
    min: 0,
    max: 100,
    value: synthParams.texture,
    displayValue: String(synthParams.texture),
  },
  {
    label: 'ATTACK',
    param: 'attack',
    min: 0,
    max: 100,
    value: synthParams.attack * 50,
    displayValue: `${synthParams.attack.toFixed(2)}s`,
    reverseTransform: (value: number): number => value / 50,
  },
  {
    label: 'DECAY',
    param: 'decay',
    min: 0,
    max: 100,
    value: synthParams.decay * 50,
    displayValue: `${synthParams.decay.toFixed(2)}s`,
    reverseTransform: (value: number): number => value / 50,
  },
  {
    label: 'SUSTAIN',
    param: 'sustain',
    min: 0,
    max: 100,
    value: synthParams.sustain * 100,
    displayValue: `${Math.round(synthParams.sustain * 100)}%`,
    reverseTransform: (value: number): number => value / 100,
  },
  {
    label: 'RELEASE',
    param: 'release',
    min: 0,
    max: 100,
    value: synthParams.release * 50,
    displayValue: `${synthParams.release.toFixed(2)}s`,
    reverseTransform: (value: number): number => value / 50,
  },
  {
    label: 'VOLUME',
    param: 'volume',
    min: -24,
    max: 0,
    value: synthParams.volume,
    displayValue: `${synthParams.volume}dB`,
  },
]

const createAdvancedSliderConfigs = (synthParams: SynthParameters): SliderConfig[] => [
  {
    label: 'DETUNE',
    param: 'detune',
    min: -100,
    max: 100,
    value: synthParams.detune,
    displayValue: `${synthParams.detune > 0 ? '+' : ''}${synthParams.detune}¢`,
  },
  {
    label: 'PORTAMENTO',
    param: 'portamento',
    min: 0,
    max: 100,
    value: synthParams.portamento * 100,
    displayValue: `${synthParams.portamento.toFixed(2)}s`,
    reverseTransform: (value: number): number => value / 100,
  },
  {
    label: 'FILTER CUTOFF',
    param: 'filterCutoff',
    min: 200,
    max: 8000,
    value: synthParams.filterCutoff,
    displayValue: `${Math.round(synthParams.filterCutoff)}Hz`,
  },
  {
    label: 'FILTER RES',
    param: 'filterResonance',
    min: 1,
    max: 20,
    value: synthParams.filterResonance,
    displayValue: synthParams.filterResonance.toFixed(1),
  },
  {
    label: 'FILTER ENV',
    param: 'filterEnvAmount',
    min: 0,
    max: 4,
    value: synthParams.filterEnvAmount,
    displayValue: synthParams.filterEnvAmount.toFixed(1),
  },
  {
    label: 'LFO RATE',
    param: 'lfoRate',
    min: 0.1,
    max: 20,
    value: synthParams.lfoRate,
    displayValue: `${synthParams.lfoRate.toFixed(1)}Hz`,
  },
  {
    label: 'LFO AMOUNT',
    param: 'lfoAmount',
    min: 0,
    max: 100,
    value: synthParams.lfoAmount,
    displayValue: `${Math.round(synthParams.lfoAmount)}%`,
  },
  {
    label: 'OSC MIX',
    param: 'oscMix',
    min: 0,
    max: 100,
    value: synthParams.oscMix,
    displayValue: `${Math.round(synthParams.oscMix)}%`,
  },
  {
    label: 'NOISE LEVEL',
    param: 'noiseLevel',
    min: 0,
    max: 100,
    value: synthParams.noiseLevel,
    displayValue: `${Math.round(synthParams.noiseLevel)}%`,
  },
]

const SynthControls = (): React.JSX.Element => {
  const {
    synthParams,
    updateSynthParam,
    selectCharacter,
    currentScale,
    currentKey,
    setScale,
    setKey,
  } = useSequencer()
  const sliderConfigs = createSliderConfigs(synthParams)
  const advancedSliderConfigs = createAdvancedSliderConfigs(synthParams)

  return (
    <div
      className="bg-gray-900 rounded-lg p-3 sm:p-4 border-2 border-lcars-purple w-full sm:w-64"
      data-testid="synth-controls"
    >
      <h2 className="text-lcars-purple font-bold mb-3 sm:mb-4 text-sm sm:text-base">
        SYNTH CONTROLS
      </h2>
      <div className="space-y-3 sm:space-y-4">
        {/* Basic Controls */}
        {sliderConfigs.map(config => (
          <SliderControl key={config.param} config={config} onUpdate={updateSynthParam} />
        ))}
        <ButtonGrid
          label="WAVEFORM"
          options={[...WAVEFORMS]}
          currentValue={synthParams.waveform}
          onSelect={(value): void => updateSynthParam('waveform', value)}
        />
        <ButtonGrid
          label="CHARACTER"
          options={[...CHARACTER_PATCHES]}
          currentValue={synthParams.character}
          onSelect={selectCharacter}
          colorClass="lcars-purple"
        />

        {/* Advanced Controls */}
        <div className="border-t border-gray-700 pt-3">
          <h3 className="text-lcars-orange font-bold mb-3 text-xs">ADVANCED</h3>
          {advancedSliderConfigs.map(config => (
            <SliderControl key={config.param} config={config} onUpdate={updateSynthParam} />
          ))}
          <ButtonGrid
            label="LFO TARGET"
            options={[...LFO_TARGETS]}
            currentValue={synthParams.lfoTarget}
            onSelect={(value): void => updateSynthParam('lfoTarget', value)}
            colorClass="lcars-green"
          />
          <ButtonGrid
            label="SUB OSC"
            options={[...SUB_OSC_TYPES]}
            currentValue={synthParams.subOscType}
            onSelect={(value): void => updateSynthParam('subOscType', value)}
            colorClass="lcars-blue"
          />
        </div>

        {/* Scale and Key Controls */}
        <div className="border-t border-gray-700 pt-3">
          <h3 className="text-lcars-blue font-bold mb-3 text-xs">SCALE & KEY</h3>
          <ButtonGrid
            label="SCALE"
            options={SCALES.map(scale => ({ id: scale.id, name: scale.name }))}
            currentValue={currentScale?.id || ''}
            onSelect={setScale}
            colorClass="lcars-blue"
          />
          <ButtonGrid
            label="KEY"
            options={KEYS.map(key => ({ id: key.id, name: key.name }))}
            currentValue={currentKey?.id || ''}
            onSelect={setKey}
            colorClass="lcars-orange"
          />
        </div>
      </div>
    </div>
  )
}

export default SynthControls
