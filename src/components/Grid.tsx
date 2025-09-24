import { useSequencer } from '../context/SequencerContext'

const Grid = () => {
  const { grid, toggleCell, currentStep } = useSequencer()

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
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={(e) => toggleCell(rowIndex, colIndex, e.shiftKey)}
              className={`
                w-8 h-8 rounded-sm transition-all duration-150
                ${getVelocityColor(cell)}
                ${colIndex === currentStep
                  ? 'ring-2 ring-lcars-yellow'
                  : ''
                }
              `}
            />
          ))
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