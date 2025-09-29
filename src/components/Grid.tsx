import { useSequencer } from '../context/SequencerContextImproved'
import { useEffect, useState } from 'react'
import type { Scale, Key } from '../utils/scales'
import { getDisplayNoteForRow } from '../utils/scales'

type CellData = { active: boolean; velocity: number }

const getVelocityColor = (cell: CellData): string => {
  if (!cell.active) return 'bg-gray-700 hover:bg-gray-600'

  if (cell.velocity === 1.0) {
    return 'bg-red-500 shadow-lg shadow-red-500/50'
  } else if (cell.velocity === 0.7) {
    return 'bg-lcars-orange shadow-lg shadow-lcars-orange/50'
  } else if (cell.velocity === 0.3) {
    return 'bg-lcars-blue shadow-lg shadow-lcars-blue/50'
  }

  return 'bg-gray-700'
}

const getGridCellClassName = (
  cell: CellData,
  isCurrentStep: boolean,
  isSparkle: boolean
): string => {
  const baseClasses =
    'aspect-square rounded-sm transition-all duration-150 relative overflow-hidden touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] cursor-pointer border border-transparent'
  const velocityClasses = getVelocityColor(cell)
  const currentStepClasses = isCurrentStep ? 'ring-2 ring-lcars-yellow' : ''
  const sparkleClasses = isSparkle ? 'animate-pulse' : ''

  return [baseClasses, velocityClasses, currentStepClasses, sparkleClasses]
    .filter(Boolean)
    .join(' ')
}

const GridCell = ({
  cell,
  rowIndex,
  colIndex,
  isCurrentStep,
  isSparkle,
  onToggle,
}: {
  cell: CellData
  rowIndex: number
  colIndex: number
  isCurrentStep: boolean
  isSparkle: boolean
  onToggle: (rowIndex: number, colIndex: number, shiftKey: boolean) => void
}): JSX.Element => {
  const cellKey = `${rowIndex}-${colIndex}`

  return (
    <button
      key={cellKey}
      data-testid={`grid-cell-${rowIndex}-${colIndex}`}
      onClick={(e): void => onToggle(rowIndex, colIndex, e.shiftKey)}
      className={getGridCellClassName(cell, isCurrentStep, isSparkle)}
      data-testid-active={cell.active ? 'true' : 'false'}
    >
      {isSparkle && (
        <>
          <div className="absolute inset-0 bg-white opacity-50 animate-ping rounded-sm"></div>
          <div className="absolute inset-0 bg-lcars-yellow opacity-30 animate-bounce rounded-sm"></div>
        </>
      )}
    </button>
  )
}

const NoteLabels = ({
  currentScale,
  currentKey,
}: {
  currentScale: Scale
  currentKey: Key
}): JSX.Element => (
  <div className="flex flex-col justify-between h-full py-1">
    {Array.from({ length: 16 }, (_, i) => (
      <div
        key={i}
        className="flex items-center justify-center text-xs text-lcars-blue font-mono min-h-[44px] sm:min-h-[25px] w-8"
      >
        {getDisplayNoteForRow(i, currentScale, currentKey)}
      </div>
    ))}
  </div>
)

const VelocityLegend = (): JSX.Element => (
  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-300">
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
    <div className="sm:ml-auto text-gray-400 text-xs">SHIFT+CLICK TO TOGGLE</div>
  </div>
)

const useSparkleEffect = (grid: CellData[][], currentStep: number | undefined): Set<string> => {
  const [sparkleSquares, setSparkleSquares] = useState<Set<string>>(new Set())

  useEffect((): (() => void) | void => {
    if (currentStep !== undefined) {
      const activeSquares = new Set<string>()

      grid.forEach((row, rowIndex): void => {
        const stepIndex = currentStep
        if (stepIndex >= 0 && stepIndex < row.length) {
          const currentCell = row.at(stepIndex)
          if (currentCell?.active) {
            activeSquares.add(`${rowIndex}-${stepIndex}`)
          }
        }
      })

      setSparkleSquares(activeSquares)

      if (activeSquares.size > 0) {
        const timeout = setTimeout((): void => {
          setSparkleSquares(new Set())
        }, 200)
        return (): void => clearTimeout(timeout)
      }
    }
  }, [currentStep, grid])

  return sparkleSquares
}

const renderGridCells = (
  grid: CellData[][],
  sparkleSquares: Set<string>,
  currentStep: number | undefined,
  toggleCell: (rowIndex: number, colIndex: number, shiftKey: boolean) => void
): JSX.Element[] => {
  return grid
    .map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        const cellKey = `${rowIndex}-${colIndex}`
        const isSparkle = sparkleSquares.has(cellKey)
        const isCurrentStep = colIndex === currentStep

        return (
          <GridCell
            key={cellKey}
            cell={cell}
            rowIndex={rowIndex}
            colIndex={colIndex}
            isCurrentStep={isCurrentStep}
            isSparkle={isSparkle}
            onToggle={toggleCell}
          />
        )
      })
    )
    .flat()
}

const Grid = (): JSX.Element => {
  const { grid, toggleCell, currentStep, currentScale, currentKey } = useSequencer()
  const sparkleSquares = useSparkleEffect(grid, currentStep)

  const positionIndicatorStyle = {
    transform: `translateX(${(currentStep ?? 0) * 6.25}%)`,
    transition: 'transform 0.1s ease-out',
  }

  return (
    <div
      className="bg-gray-900 p-2 sm:p-4 rounded-lg border-2 border-lcars-blue"
      data-testid="grid"
    >
      <div className="flex gap-2">
        {currentScale && currentKey && (
          <NoteLabels currentScale={currentScale} currentKey={currentKey} />
        )}
        <div className="relative flex-1">
          <div
            className="absolute top-0 w-[6.25%] h-1 bg-lcars-yellow rounded-full z-10"
            data-testid="position-indicator"
            style={positionIndicatorStyle}
          />
          <div className="grid grid-cols-16 gap-1 w-full max-w-[85vw] lg:max-w-[480px] xl:max-w-[580px] 2xl:max-w-[700px] mx-auto aspect-square min-h-[400px] lg:min-h-[420px] xl:min-h-[480px] 2xl:min-h-[550px]">
            {renderGridCells(grid, sparkleSquares, currentStep, toggleCell)}
          </div>
        </div>
      </div>
      <VelocityLegend />
    </div>
  )
}

export default Grid
