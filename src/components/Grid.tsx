import { useSequencer } from '../context/SequencerContext'
import { useEffect, useState } from 'react'

const Grid = () => {
  const { grid, toggleCell, currentStep } = useSequencer()
  const [sparkleSquares, setSparkleSquares] = useState<Set<string>>(new Set())

  // Trigger sparkle animation for active squares when step changes
  useEffect(() => {
    if (currentStep !== undefined) {
      const activeSquares = new Set<string>()
      grid.forEach((row, rowIndex) => {
        if (row[currentStep]?.active) {
          activeSquares.add(`${rowIndex}-${currentStep}`)
        }
      })

      setSparkleSquares(activeSquares)

      // Clear sparkles after animation
      if (activeSquares.size > 0) {
        const timeout = setTimeout(() => {
          setSparkleSquares(new Set())
        }, 200)
        return () => clearTimeout(timeout)
      }
    }
  }, [currentStep, grid])

  const getVelocityColor = (cell: { active: boolean; velocity: number }) => {
    if (!cell.active) return 'bg-gray-700 hover:bg-gray-600'

    if (cell.velocity === 1.0) {
      // Emphasis - bright red
      return 'bg-red-500 shadow-lg shadow-red-500/50'
    } else if (cell.velocity === 0.8) {
      // Normal - orange
      return 'bg-lcars-orange shadow-lg shadow-lcars-orange/50'
    } else if (cell.velocity === 0.5) {
      // Quiet - blue/purple
      return 'bg-lcars-blue shadow-lg shadow-lcars-blue/50'
    }

    return 'bg-gray-700'
  }

  return (
    <div className="bg-gray-900 p-4 rounded-lg border-2 border-lcars-blue">
      <div className="grid grid-cols-16 gap-1">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const squareKey = `${rowIndex}-${colIndex}`
            const isSparkle = sparkleSquares.has(squareKey)

            return (
              <button
                key={squareKey}
                onClick={(e) => toggleCell(rowIndex, colIndex, e.shiftKey)}
                className={`
                  w-8 h-8 rounded-sm transition-all duration-150 relative overflow-hidden
                  ${getVelocityColor(cell)}
                  ${colIndex === currentStep
                    ? 'ring-2 ring-lcars-yellow'
                    : ''
                  }
                  ${isSparkle ? 'animate-pulse' : ''}
                `}
              >
                {isSparkle && (
                  <div className="absolute inset-0 bg-white opacity-50 animate-ping rounded-sm"></div>
                )}
                {isSparkle && (
                  <div className="absolute inset-0 bg-lcars-yellow opacity-30 animate-bounce rounded-sm"></div>
                )}
              </button>
            )
          })
        )}
      </div>

      {/* Velocity Legend */}
      <div className="mt-2 flex gap-2 text-xs text-gray-300">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-lcars-orange rounded-sm"></div>
          <span>NORMAL</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
          <span>EMPHASIS</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-lcars-blue rounded-sm"></div>
          <span>QUIET</span>
        </div>
        <div className="ml-auto text-gray-400">
          SHIFT+CLICK TO TOGGLE
        </div>
      </div>
    </div>
  )
}

export default Grid