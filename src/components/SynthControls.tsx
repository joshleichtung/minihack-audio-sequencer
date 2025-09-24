import { useSequencer } from '../context/SequencerContext'

const SynthControls = () => {
  const { synthParams, updateSynthParam } = useSequencer()

  return (
    <div className="bg-gray-900 rounded-lg p-4 border-2 border-lcars-purple w-64 max-h-[600px] overflow-y-auto">
      <h2 className="text-lcars-purple font-bold mb-4">SYNTH CONTROLS</h2>

      <div className="space-y-4">
        <div>
          <label className="text-lcars-orange text-sm">BRIGHTNESS</label>
          <input
            type="range"
            min="0"
            max="100"
            value={synthParams.brightness}
            onChange={(e) => updateSynthParam('brightness', Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-lcars-orange text-sm">TEXTURE</label>
          <input
            type="range"
            min="0"
            max="100"
            value={synthParams.texture}
            onChange={(e) => updateSynthParam('texture', Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-lcars-orange text-sm">ATTACK</label>
          <input
            type="range"
            min="0"
            max="100"
            value={synthParams.attack * 100}
            onChange={(e) => updateSynthParam('attack', Number(e.target.value) / 100)}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-lcars-orange text-sm">RELEASE</label>
          <input
            type="range"
            min="0"
            max="100"
            value={synthParams.release * 33}
            onChange={(e) => updateSynthParam('release', Number(e.target.value) / 33)}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-lcars-orange text-sm">WAVEFORM</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {['sine', 'sawtooth', 'square', 'triangle'].map((type) => (
              <button
                key={type}
                onClick={() => updateSynthParam('waveform', type)}
                className={`px-3 py-1 rounded text-xs ${
                  synthParams.waveform === type
                    ? 'bg-lcars-orange text-black'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-lcars-purple text-sm">CHARACTER</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {[
              { id: 'default', name: 'DEFAULT' },
              { id: 'nebula', name: 'NEBULA' },
              { id: 'plasma', name: 'PLASMA' },
              { id: 'quantum', name: 'QUANTUM' },
              { id: 'warpDrive', name: 'WARP' },
              { id: 'photon', name: 'PHOTON' },
              { id: 'void', name: 'VOID' }
            ].map((patch) => (
              <button
                key={patch.id}
                onClick={() => updateSynthParam('character', patch.id)}
                className={`px-3 py-1 rounded text-xs ${
                  synthParams.character === patch.id
                    ? 'bg-lcars-purple text-black'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {patch.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SynthControls