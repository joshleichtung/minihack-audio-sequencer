import { useSequencer } from '../context/SequencerContext'

const EffectsControls = () => {
  const { effectsParams, updateEffectsParam } = useSequencer()

  return (
    <div className="bg-gray-900 rounded-lg p-4 border-2 border-lcars-purple w-64">
      <h2 className="text-lcars-purple font-bold mb-4">SYNTH EFFECTS</h2>

      <div className="space-y-4">
        {/* Reverb */}
        <div>
          <label className="text-lcars-purple text-sm flex justify-between">
            <span>REVERB</span>
            <span className="text-xs">{effectsParams.reverb}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={effectsParams.reverb}
            onChange={(e) => updateEffectsParam('reverb', Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-400 mt-1">ROOM → HALL</div>
        </div>

        {/* Delay */}
        <div>
          <label className="text-lcars-purple text-sm flex justify-between">
            <span>DELAY</span>
            <span className="text-xs">{effectsParams.delay}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={effectsParams.delay}
            onChange={(e) => updateEffectsParam('delay', Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-400 mt-1">RHYTHMIC ECHO</div>
        </div>

        {/* Chorus */}
        <div>
          <label className="text-lcars-purple text-sm flex justify-between">
            <span>CHORUS</span>
            <span className="text-xs">{effectsParams.chorus}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={effectsParams.chorus}
            onChange={(e) => updateEffectsParam('chorus', Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-400 mt-1">SUBTLE → LUSH</div>
        </div>

        {/* Wah Filter */}
        <div>
          <label className="text-lcars-purple text-sm flex justify-between">
            <span>WAH FILTER</span>
            <span className="text-xs">{effectsParams.wahFilter}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={effectsParams.wahFilter}
            onChange={(e) => updateEffectsParam('wahFilter', Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-400 mt-1">SQUELCHY SWEEP</div>
        </div>

        {/* Quick Presets */}
        <div className="pt-2 border-t border-gray-700">
          <div className="text-lcars-purple text-xs mb-2">QUICK PRESETS</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                updateEffectsParam('reverb', 0)
                updateEffectsParam('delay', 0)
                updateEffectsParam('chorus', 0)
                updateEffectsParam('wahFilter', 0)
              }}
              className="bg-gray-700 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
            >
              DRY
            </button>
            <button
              onClick={() => {
                updateEffectsParam('reverb', 40)
                updateEffectsParam('delay', 25)
                updateEffectsParam('chorus', 20)
                updateEffectsParam('wahFilter', 0)
              }}
              className="bg-gray-700 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
            >
              SPACE
            </button>
            <button
              onClick={() => {
                updateEffectsParam('reverb', 15)
                updateEffectsParam('delay', 0)
                updateEffectsParam('chorus', 60)
                updateEffectsParam('wahFilter', 35)
              }}
              className="bg-gray-700 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
            >
              LUSH
            </button>
            <button
              onClick={() => {
                updateEffectsParam('reverb', 10)
                updateEffectsParam('delay', 45)
                updateEffectsParam('chorus', 10)
                updateEffectsParam('wahFilter', 70)
              }}
              className="bg-gray-700 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
            >
              FUNK
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EffectsControls