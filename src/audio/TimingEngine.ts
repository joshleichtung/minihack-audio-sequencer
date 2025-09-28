import * as Tone from 'tone'

export class TimingEngine {
  private lookaheadTime = 0.1 // 100ms lookahead
  private scheduleInterval = 25 // Check every 25ms
  private intervalId: number | null = null
  private nextStepTime = 0
  private currentStep = 0
  private isRunning = false

  // Callbacks
  private onStep: ((step: number) => void) | null = null

  constructor() {
    // Bind methods to ensure correct context
    this.scheduler = this.scheduler.bind(this)
  }

  start(
    tempo: number,
    onStep: (step: number) => void
  ): void {
    this.onStep = onStep

    // Reset timing
    this.currentStep = 0
    this.nextStepTime = Tone.Transport.immediate()
    this.isRunning = true

    // Start the scheduler
    this.intervalId = window.setInterval(this.scheduler, this.scheduleInterval)

    // Start transport
    Tone.Transport.bpm.value = tempo
    Tone.Transport.start()
  }

  stop(): void {
    this.isRunning = false

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    Tone.Transport.stop()
    Tone.Transport.cancel()

    // Reset to beginning
    this.currentStep = 0
  }

  private scheduler(): void {
    if (!this.isRunning) return

    // Schedule all notes that fall within the lookahead window
    while (this.nextStepTime < Tone.Transport.seconds + this.lookaheadTime) {
      this.scheduleStep(this.currentStep, this.nextStepTime)
      this.advanceStep()
    }
  }

  private scheduleStep(step: number, time: number): void {
    // Schedule UI update slightly before the audio to ensure visual sync
    const drawTime = Math.max(0, time - 0.016) // 16ms before audio (1 frame at 60fps)

    Tone.Draw.schedule(() => {
      if (this.onStep) {
        this.onStep(step)
      }
    }, drawTime)

    // Notify callbacks to schedule their audio at the precise time
    // The actual note/drum scheduling happens in SequencerContext
    // This ensures all audio events are scheduled with proper lookahead
  }

  private advanceStep(): void {
    const secondsPerStep = 60.0 / (Tone.Transport.bpm.value * 4) // 16th notes
    this.nextStepTime += secondsPerStep
    this.currentStep = (this.currentStep + 1) % 16
  }

  updateTempo(tempo: number): void {
    Tone.Transport.bpm.value = tempo
  }

  getCurrentStep(): number {
    return this.currentStep
  }

  // Method to get the next scheduled time for external synchronization
  getNextStepTime(): number {
    return this.nextStepTime
  }

  // Method to check if we should schedule a note (used by SequencerContext)
  shouldScheduleStep(step: number): { shouldSchedule: boolean; time: number } {
    const currentTransportTime = Tone.Transport.seconds
    const stepTime = this.nextStepTime + (step - this.currentStep) * (60.0 / (Tone.Transport.bpm.value * 4))

    if (stepTime < currentTransportTime + this.lookaheadTime && stepTime >= currentTransportTime) {
      return { shouldSchedule: true, time: stepTime }
    }

    return { shouldSchedule: false, time: 0 }
  }
}

// Singleton instance
export const timingEngine = new TimingEngine()