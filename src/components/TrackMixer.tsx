/* eslint-disable max-lines-per-function */

/* eslint-disable security/detect-object-injection */
import { useSequencer } from '../context/SequencerContextImproved'

const TrackMixer = (): React.JSX.Element => {
  const { trackControls, updateTrackControl, soloTrack, muteTrack } = useSequencer()

  const tracks = ['melody', 'kick', 'snare', 'hihat', 'openhat'] as const

  return (
    <div className="bg-gray-900 rounded-lg p-4 border-2 border-lcars-green">
      <h2 className="text-lcars-green font-bold mb-4 text-sm sm:text-base">TRACK MIXER</h2>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        {tracks.map(trackId => {
          const track = trackControls[trackId]

          return (
            <div key={trackId} className="bg-gray-800 rounded p-3 space-y-3">
              <h3 className="text-white font-bold text-xs uppercase text-center">{trackId}</h3>

              {/* Volume */}
              <div>
                <label className="text-lcars-green text-xs">VOL</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={track.volume}
                  onChange={e => updateTrackControl(trackId, 'volume', parseFloat(e.target.value))}
                  className="w-full h-2"
                />
                <div className="text-xs text-center text-gray-300">
                  {Math.round(track.volume * 100)}
                </div>
              </div>

              {/* Pan */}
              <div>
                <label className="text-lcars-green text-xs">PAN</label>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.01"
                  value={track.pan}
                  onChange={e => updateTrackControl(trackId, 'pan', parseFloat(e.target.value))}
                  className="w-full h-2"
                />
                <div className="text-xs text-center text-gray-300">
                  {track.pan > 0 ? 'R' : track.pan < 0 ? 'L' : 'C'}
                </div>
              </div>

              {/* Mute/Solo */}
              <div className="flex gap-1">
                <button
                  onClick={() => muteTrack(trackId)}
                  className={`flex-1 px-2 py-1 rounded text-xs font-bold ${
                    track.muted
                      ? 'bg-lcars-red text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  MUTE
                </button>
                <button
                  onClick={() => soloTrack(trackId)}
                  className={`flex-1 px-2 py-1 rounded text-xs font-bold ${
                    track.solo
                      ? 'bg-lcars-orange text-black'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  SOLO
                </button>
              </div>

              {/* Effects */}
              <div className="space-y-2">
                <div>
                  <label className="text-lcars-purple text-xs">REVERB</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={track.reverb}
                    onChange={e => updateTrackControl(trackId, 'reverb', parseInt(e.target.value))}
                    className="w-full h-1"
                  />
                </div>
                <div>
                  <label className="text-lcars-purple text-xs">DELAY</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={track.delay}
                    onChange={e => updateTrackControl(trackId, 'delay', parseInt(e.target.value))}
                    className="w-full h-1"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TrackMixer
