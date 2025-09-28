import { useSequencer } from '../context/SequencerContextImproved'

type EffectSliderProps = {
  label: string
  value: number
  description: string
  onChange: (value: number) => void
}

const EffectSlider = ({ label, value, description, onChange }: EffectSliderProps): JSX.Element => (
  <div>
    <label className="text-lcars-purple text-sm flex justify-between">
      <span>{label}</span>
      <span className="text-xs">{value}%</span>
    </label>
    <input
      type="range"
      min="0"
      max="100"
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full h-8 touch-manipulation"
    />
    <div className="text-xs text-gray-400 mt-1">{description}</div>
  </div>
)

type PresetButtonProps = {
  name: string
  onClick: () => void
}

const PresetButton = ({ name, onClick }: PresetButtonProps): JSX.Element => (
  <button
    onClick={onClick}
    className="bg-gray-700 text-white px-2 py-2 rounded text-xs hover:bg-gray-600 min-h-[48px] touch-manipulation"
  >
    {name}
  </button>
)

type EffectsPresetsProps = {
  updateEffectsParam: (param: string, value: number) => void
}

const EffectsPresets = ({ updateEffectsParam }: EffectsPresetsProps): JSX.Element => {
  const presets = [
    {
      name: 'DRY',
      values: { reverb: 0, delay: 0, chorus: 0, wahFilter: 0 },
    },
    {
      name: 'SPACE',
      values: { reverb: 40, delay: 25, chorus: 20, wahFilter: 0 },
    },
    {
      name: 'LUSH',
      values: { reverb: 15, delay: 0, chorus: 60, wahFilter: 35 },
    },
    {
      name: 'FUNK',
      values: { reverb: 10, delay: 45, chorus: 10, wahFilter: 70 },
    },
  ]

  const applyPreset = (values: Record<string, number>): void => {
    Object.entries(values).forEach(([param, value]) => {
      updateEffectsParam(param, value)
    })
  }

  return (
    <div className="pt-2 border-t border-gray-700">
      <div className="text-lcars-purple text-xs mb-2">QUICK PRESETS</div>
      <div className="grid grid-cols-2 gap-2">
        {presets.map(preset => (
          <PresetButton
            key={preset.name}
            name={preset.name}
            onClick={() => applyPreset(preset.values)}
          />
        ))}
      </div>
    </div>
  )
}

const EffectsControls = (): JSX.Element => {
  const { effectsParams, updateEffectsParam } = useSequencer()

  return (
    <div className="bg-gray-900 rounded-lg p-3 sm:p-4 border-2 border-lcars-purple w-full sm:w-64">
      <h2 className="text-lcars-purple font-bold mb-3 sm:mb-4 text-sm sm:text-base">
        SYNTH EFFECTS
      </h2>

      <div className="space-y-3 sm:space-y-4">
        <EffectSlider
          label="REVERB"
          value={effectsParams.reverb}
          description="ROOM → HALL"
          onChange={value => updateEffectsParam('reverb', value)}
        />

        <EffectSlider
          label="DELAY"
          value={effectsParams.delay}
          description="RHYTHMIC ECHO"
          onChange={value => updateEffectsParam('delay', value)}
        />

        <EffectSlider
          label="CHORUS"
          value={effectsParams.chorus}
          description="SUBTLE → LUSH"
          onChange={value => updateEffectsParam('chorus', value)}
        />

        <EffectSlider
          label="WAH FILTER"
          value={effectsParams.wahFilter}
          description="SQUELCHY SWEEP"
          onChange={value => updateEffectsParam('wahFilter', value)}
        />

        <EffectsPresets updateEffectsParam={updateEffectsParam} />
      </div>
    </div>
  )
}

export default EffectsControls
