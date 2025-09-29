import { useState } from 'react'
import App from './App'

function AppWithTimingToggleFixed(): React.JSX.Element {
  const [useImprovedTiming, setUseImprovedTiming] = useState(true)

  return (
    <>
      {/* Timing Toggle Button */}
      <div className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur p-2 rounded-lg border border-blue-500">
        <button
          onClick={() => setUseImprovedTiming(!useImprovedTiming)}
          className={`px-4 py-2 rounded transition-colors ${
            useImprovedTiming
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          Timing: {useImprovedTiming ? 'IMPROVED ✓' : 'ORIGINAL'}
        </button>
        <div className="text-xs text-gray-400 mt-1">
          {useImprovedTiming ? 'Using lookahead scheduling' : 'Using basic scheduling'}
        </div>
        <div className="text-xs text-yellow-400 mt-1">
          Note: Currently showing original timing only. Improved timing implementation in progress.
        </div>
      </div>

      {/* For now, just show the original app */}
      <App />
    </>
  )
}

export default AppWithTimingToggleFixed
