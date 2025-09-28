/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, max-lines-per-function */
import { useSequencer } from '../context/SequencerContextImproved'
import { SCALES, KEYS } from '../utils/scales'

type SynthParam = string | number

interface SynthParams {
  brightness: number
  texture: number
  attack: number
  release: number
  volume: number
  waveform: string
  character: string
}

type SliderConfig = {
  label: string
  param: string
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
  onUpdate: (param: string, value: SynthParam) => void
}): JSX.Element => (
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
}): JSX.Element => (
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

const createSliderConfigs = (synthParams: SynthParams): SliderConfig[] => [
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

const SynthControls = (): JSX.Element => {
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

  return (
    <div
      className="bg-gray-900 rounded-lg p-3 sm:p-4 border-2 border-lcars-purple w-full sm:w-64"
      data-testid="synth-controls"
    >
      <h2 className="text-lcars-purple font-bold mb-3 sm:mb-4 text-sm sm:text-base">
        SYNTH CONTROLS
      </h2>
      <div className="space-y-3 sm:space-y-4">
        {sliderConfigs.map(config => (
          <SliderControl key={config.param} config={config} onUpdate={updateSynthParam} />
        ))}
        <ButtonGrid
          label="WAVEFORM"
          options={WAVEFORMS}
          currentValue={synthParams.waveform}
          onSelect={(value): void => updateSynthParam('waveform', value)}
        />
        <ButtonGrid
          label="CHARACTER"
          options={CHARACTER_PATCHES}
          currentValue={synthParams.character}
          onSelect={selectCharacter}
          colorClass="lcars-purple"
        />
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
  )
}

export default SynthControls
