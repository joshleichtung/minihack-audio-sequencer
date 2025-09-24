import { useEffect, useState } from 'react'
import { useSequencer } from '../context/SequencerContext'

interface VisualizerProps {
  side: 'left' | 'right'
}

const Visualizer = ({ side }: VisualizerProps) => {
  const { isPlaying, currentStep, synthParams } = useSequencer()
  const [bars, setBars] = useState<number[]>([])

  useEffect(() => {
    // Create animated bars based on music parameters
    const barCount = 12
    const newBars = Array.from({ length: barCount }, (_, i) => {
      if (!isPlaying) return 0

      // Create different patterns for left and right
      const offset = side === 'left' ? 0 : Math.PI
      const frequency = side === 'left' ? 0.5 : 0.7

      // Animate based on current step and synth params
      const stepInfluence = Math.sin((currentStep + i) * 0.3 + offset) * 0.5 + 0.5
      const brightnessInfluence = synthParams.brightness / 100
      const textureInfluence = (synthParams.texture / 100) * 0.3

      return Math.min(100, (stepInfluence * 60 + brightnessInfluence * 30 + textureInfluence * 10))
    })

    setBars(newBars)
  }, [currentStep, isPlaying, side, synthParams.brightness, synthParams.texture])

  const getBarColor = (height: number, index: number) => {
    if (height < 20) return 'bg-gray-800'
    if (height < 40) return 'bg-lcars-blue'
    if (height < 70) return 'bg-lcars-purple'
    return 'bg-lcars-orange'
  }

  return (
    <div className="flex flex-col-reverse items-center h-96 w-8 gap-1">
      {bars.map((height, index) => (
        <div
          key={index}
          className={`
            w-full transition-all duration-150 rounded-sm
            ${getBarColor(height, index)}
            ${isPlaying ? 'animate-pulse' : ''}
          `}
          style={{
            height: `${Math.max(4, height)}%`,
            opacity: isPlaying ? 0.8 : 0.3
          }}
        />
      ))}
    </div>
  )
}

export default Visualizer