import { Sparkles, Zap, TrendingDown, TrendingUp } from 'lucide-react'
import { useSequencer } from '../context/SequencerContextImproved'

const PresetButtons = () => {
  const { setPreset } = useSequencer()

  const presets = [
    { name: 'AMBIENT', id: 'ambient', icon: Sparkles, color: 'bg-lcars-blue' },
    { name: 'ENERGETIC', id: 'energetic', icon: Zap, color: 'bg-lcars-orange' },
    { name: 'CASCADE', id: 'cascade', icon: TrendingDown, color: 'bg-lcars-purple' },
    { name: 'RISE', id: 'rise', icon: TrendingUp, color: 'bg-lcars-pink' },
  ]

  return (
    <div className="bg-gray-900 rounded-lg p-3 sm:p-4 border-2 border-lcars-peach">
      <h2 className="text-lcars-peach font-bold mb-3 sm:mb-4 text-sm sm:text-base">
        PRESET PATTERNS
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
        {presets.map(preset => {
          const Icon = preset.icon
          return (
            <button
              key={preset.id}
              onClick={() => setPreset(preset.id)}
              className={`${preset.color} text-black rounded-lg px-3 sm:px-4 py-3 flex items-center gap-2 hover:opacity-80 transition-opacity min-h-[48px] touch-manipulation justify-center`}
            >
              <Icon size={16} />
              <span className="text-xs sm:text-xs font-bold">{preset.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default PresetButtons
