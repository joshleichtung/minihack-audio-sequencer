import * as Tone from 'tone'

export class MobileAudioManager {
  private static instance: MobileAudioManager
  private isAudioUnlocked = false
  private unlockPromise: Promise<void> | null = null

  private constructor() {}

  static getInstance(): MobileAudioManager {
    if (!MobileAudioManager.instance) {
      MobileAudioManager.instance = new MobileAudioManager()
    }
    return MobileAudioManager.instance
  }

  /**
   * Detect if we're on a mobile device that requires user interaction
   */
  isMobileDevice(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

    return (
      /android/i.test(userAgent) ||
      /iPad|iPhone|iPod/.test(userAgent) ||
      /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)
    )
  }

  /**
   * Check if audio context needs to be unlocked
   */
  needsUnlock(): boolean {
    return Tone.context.state !== 'running' && this.isMobileDevice()
  }

  /**
   * Initialize audio context with mobile-specific handling
   */
  async initializeAudio(): Promise<void> {
    if (this.isAudioUnlocked) {
      return Promise.resolve()
    }

    if (this.unlockPromise) {
      return this.unlockPromise
    }

    this.unlockPromise = this.performAudioUnlock()
    return this.unlockPromise
  }

  private async performAudioUnlock(): Promise<void> {
    try {
      // Start Tone.js context
      await Tone.start()

      // For mobile devices, play a silent buffer to fully unlock audio
      if (this.isMobileDevice()) {
        await this.playSilentBuffer()
      }

      this.isAudioUnlocked = true
      console.log('Audio context unlocked successfully')
    } catch (error) {
      console.error('Failed to unlock audio context:', error)
      throw error
    }
  }

  private async playSilentBuffer(): Promise<void> {
    return new Promise((resolve) => {
      // Create a silent buffer
      const buffer = Tone.context.createBuffer(1, 1, Tone.context.sampleRate)
      const source = Tone.context.createBufferSource()
      source.buffer = buffer
      source.connect(Tone.context.rawContext.destination)

      // Play the silent buffer
      source.start(0)
      source.onended = () => resolve()

      // Fallback timeout
      setTimeout(resolve, 100)
    })
  }

  /**
   * Add touch event listeners to unlock audio on first user interaction
   */
  addUnlockListeners(): void {
    if (this.isAudioUnlocked || !this.needsUnlock()) {
      return
    }

    const unlockEvents = ['touchstart', 'touchend', 'mousedown', 'keydown']

    const unlockHandler = async () => {
      try {
        await this.initializeAudio()

        // Remove listeners after successful unlock
        unlockEvents.forEach(event => {
          document.removeEventListener(event, unlockHandler, true)
        })
      } catch (error) {
        console.error('Audio unlock failed:', error)
      }
    }

    // Add listeners with capture=true to catch events early
    unlockEvents.forEach(event => {
      document.addEventListener(event, unlockHandler, true)
    })

    console.log('Mobile audio unlock listeners added')
  }

  /**
   * Remove all unlock listeners (cleanup)
   */
  removeUnlockListeners(): void {
    // This is handled automatically in unlockHandler, but provided for manual cleanup
  }

  /**
   * Check current audio context state
   */
  getAudioState(): {
    isUnlocked: boolean
    contextState: AudioContextState
    isMobile: boolean
    needsUnlock: boolean
  } {
    return {
      isUnlocked: this.isAudioUnlocked,
      contextState: Tone.context.state,
      isMobile: this.isMobileDevice(),
      needsUnlock: this.needsUnlock()
    }
  }
}

// Export singleton instance
export const mobileAudioManager = MobileAudioManager.getInstance()