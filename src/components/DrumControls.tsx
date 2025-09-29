import { useSequencer } from '../context/SequencerContextImproved'
import type {
  DrumToggleButtonProps,
  DrumVolumeControlProps,
  DrumPatternSelectorProps,
  DrumKitSelectorProps
} from '../types'

const DrumToggleButton = ({
  drumEnabled,
  onToggle,
}: DrumToggleButtonProps) => (
  <div>
    <button
      onClick={onToggle}
      className={`w-full px-4 py-3 rounded font-bold text-sm min-h-[48px] touch-manipulation ${
        drumEnabled
          ? 'bg-lcars-orange text-black'
          : 'bg-gray-700 text-white hover:bg-gray-600'
      }`}
    >
      DRUMS {drumEnabled ? 'ON' : 'OFF'}
    </button>
  </div>
)

const DrumVolumeControl = ({
  drumVolume,
  drumEnabled,
  onVolumeChange,
}: DrumVolumeControlProps) => (
  <div>
    <label className="text-lcars-orange text-sm flex justify-between">
      <span>DRUM VOLUME</span>
      <span className="text-xs">{drumVolume}dB</span>
    </label>
    <input
      type="range"
      min="-24"
      max="0"
      value={drumVolume}
      onChange={(e): void => onVolumeChange(Number(e.target.value))}
      className="w-full h-8 touch-manipulation"
      disabled={!drumEnabled}
    />
  </div>
)

const DrumPatternSelector = ({
  drumPatterns,
  currentDrumPattern,
  drumEnabled,
  onPatternSelect,
}: DrumPatternSelectorProps) => (
  <div>
    <label className="text-lcars-orange text-sm mb-2 block">PATTERN</label>
    <div className="max-h-48 sm:max-h-64 overflow-y-auto space-y-1">
      {drumPatterns.map((pattern) => (
        <button
          key={pattern.id}
          onClick={(): void => onPatternSelect(pattern.id)}
          disabled={!drumEnabled}
          className={`w-full px-3 py-3 rounded text-xs text-left min-h-[48px] touch-manipulation ${
            currentDrumPattern === pattern.id && drumEnabled
              ? 'bg-lcars-orange text-black'
              : drumEnabled
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-gray-800 text-gray-500'
          }`}
        >
          <div className="font-bold">{pattern.name}</div>
          <div className="text-xs opacity-75">{pattern.genre}</div>
        </button>
      ))}
    </div>
  </div>
)

const DrumKitSelector = ({
  drumKits,
  currentDrumKit,
  drumEnabled,
  onKitSelect,
}: DrumKitSelectorProps) => (
  <div>
    <label className="text-lcars-orange text-sm mb-2 block">DRUM KIT</label>
    <div className="grid grid-cols-2 gap-2">
      {drumKits.map((kit) => (
        <button
          key={kit.id}
          onClick={(): void => onKitSelect(kit.id)}
          disabled={!drumEnabled}
          className={`px-3 py-2 rounded text-xs min-h-[48px] touch-manipulation ${
            currentDrumKit === kit.id && drumEnabled
              ? 'bg-lcars-purple text-black'
              : drumEnabled
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-gray-800 text-gray-500'
          }`}
        >
          <div className="font-bold">{kit.name}</div>
          <div className="text-xs opacity-75">{kit.description}</div>
        </button>
      ))}
    </div>
  </div>
)

const DrumControls = () => {
  const {
    drumEnabled,
    drumVolume,
    currentDrumPattern,
    currentDrumKit,
    drumPatterns,
    drumKits,
    toggleDrums,
    setDrumVolume,
    selectDrumPattern,
    selectDrumKit
  } = useSequencer()

  return (
    <div className="bg-gray-900 rounded-lg p-3 sm:p-4 border-2 border-lcars-orange w-full sm:w-64" data-testid="drum-controls">
      <h2 className="text-lcars-orange font-bold mb-3 sm:mb-4 text-sm sm:text-base">DRUM MACHINE</h2>
      <div className="space-y-3 sm:space-y-4">
        <DrumToggleButton drumEnabled={drumEnabled} onToggle={toggleDrums} />
        <DrumVolumeControl
          drumVolume={drumVolume}
          drumEnabled={drumEnabled}
          onVolumeChange={setDrumVolume}
        />
        <DrumKitSelector
          drumKits={drumKits}
          currentDrumKit={currentDrumKit}
          drumEnabled={drumEnabled}
          onKitSelect={selectDrumKit}
        />
        <DrumPatternSelector
          drumPatterns={drumPatterns}
          currentDrumPattern={currentDrumPattern}
          drumEnabled={drumEnabled}
          onPatternSelect={selectDrumPattern}
        />
      </div>
    </div>
  )
}

export default DrumControls