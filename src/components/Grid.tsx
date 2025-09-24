import { useSequencer } from '../context/SequencerContext'

const Grid = () => {
  const { grid, toggleCell, currentStep } = useSequencer()

  return (
    <div className="bg-gray-900 p-4 rounded-lg border-2 border-lcars-blue">
      <div className="grid grid-cols-16 gap-1">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => toggleCell(rowIndex, colIndex)}
              className={`
                w-8 h-8 rounded-sm transition-all duration-150
                ${cell.active
                  ? 'bg-lcars-orange shadow-lg shadow-lcars-orange/50'
                  : 'bg-gray-700 hover:bg-gray-600'
                }
                ${colIndex === currentStep
                  ? 'ring-2 ring-lcars-yellow'
                  : ''
                }
              `}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default Grid