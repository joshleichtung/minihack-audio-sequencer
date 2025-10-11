import * as Tone from 'tone'

interface MidiEvent {
  note: number
  velocity: number
  timestamp: number
}

export class MidiController {
  private midiAccess: MIDIAccess | null = null
  private eventQueue: MidiEvent[] = []
  private isInitialized = false

  constructor() {
    void this.initializeMidi()
  }

  private async initializeMidi(): Promise<void> {
    try {
      this.midiAccess = await navigator.requestMIDIAccess()
      this.setupInputHandlers()
      this.isInitialized = true
    } catch {
      // MIDI initialization failed - silently continue
      this.isInitialized = false
    }
  }

  private setupInputHandlers(): void {
    if (!this.midiAccess) return

    for (const input of this.midiAccess.inputs.values()) {
      input.onmidimessage = this.handleMidiMessage.bind(this)
    }
  }

  private handleMidiMessage(event: MIDIMessageEvent): void {
    const data = event.data
    if (!data || data.length < 3) return

    const command = data[0]
    const note = data[1]
    const velocity = data[2]

    // CRITICAL ISSUE: Race condition here - audio context may not be ready
    // Line 45 referenced in CodeRabbit comment
    if (command === 144 && velocity > 0) {
      this.eventQueue.push({
        note,
        velocity,
        timestamp: Tone.now(),
      })
      // TODO: Implement note triggering - currently just logging events
    }
  }

  public getEventQueue(): MidiEvent[] {
    return [...this.eventQueue]
  }

  public clearQueue(): void {
    this.eventQueue = []
  }
}
