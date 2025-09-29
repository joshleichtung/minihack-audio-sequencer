import { test } from '@playwright/test'

test.describe('Drum Synthesis Error Reproduction', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console errors
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Store errors on page for access in tests
    await page.addInitScript(() => {
      window.capturedErrors = []
      const originalError = console.error
      console.error = function (...args) {
        window.capturedErrors.push(args.join(' '))
        originalError.apply(console, args)
      }
    })

    await page.goto('http://localhost:5174')

    // Enable audio context by clicking on the page
    await page.click('body')
    await page.waitForTimeout(500)
  })

  test('should reproduce cancelAndHoldAtTime drum synthesis errors', async ({ page }) => {
    // Enable drums first
    const drumsToggle = page.locator('[data-testid="drums-toggle"]').first()
    await drumsToggle.click({ force: true })
    await page.waitForTimeout(100)

    // Test different drum types by clicking grid cells
    const drumTypes = [
      { row: 0, name: 'kick' },
      { row: 1, name: 'snare' },
      { row: 2, name: 'hihat' },
      { row: 3, name: 'openhat' },
    ]

    for (const drumType of drumTypes) {
      console.log(`Testing ${drumType.name} drum synthesis...`)

      // Clear previous patterns
      await page.evaluate(() => {
        // Clear any existing patterns by clicking active cells
        const activeCells = document.querySelectorAll(
          '[data-testid*="grid-cell"][data-active="true"]'
        )
        activeCells.forEach(cell => (cell as HTMLElement).click())
      })

      // Add pattern for this drum type
      for (let step = 0; step < 16; step += 4) {
        const cellSelector = `[data-testid="grid-cell-${drumType.row}-${step}"]`
        await page.locator(cellSelector).click({ force: true })
        await page.waitForTimeout(50)
      }

      // Start playback to trigger synthesis
      const playButton = page.locator('[data-testid="play-button"]')
      await playButton.click({ force: true })
      await page.waitForTimeout(1000) // Let it play for 1 second

      // Stop playback
      await playButton.click({ force: true })
      await page.waitForTimeout(200)

      // Check for errors specific to this drum type
      const errors = await page.evaluate(() => window.capturedErrors || [])

      console.log(`Errors after testing ${drumType.name}:`, errors)

      // Look for the specific cancelAndHoldAtTime error
      const cancelHoldErrors = errors.filter(
        error => error.includes('cancelAndHoldAtTime') && error.includes('null')
      )

      if (cancelHoldErrors.length > 0) {
        console.log(`FOUND cancelAndHoldAtTime errors for ${drumType.name}:`, cancelHoldErrors)
      }
    }

    // Get all captured errors
    const allErrors = await page.evaluate(() => window.capturedErrors || [])
    console.log('All captured errors:', allErrors)

    // Check for the specific error pattern we're looking for
    const targetErrors = allErrors.filter(
      error =>
        error.includes('cancelAndHoldAtTime') ||
        error.includes('Invalid argument') ||
        error.includes('DrumSynthesis.ts:45')
    )

    if (targetErrors.length > 0) {
      console.log('TARGET ERRORS FOUND:', targetErrors)
    }

    // Print the stack trace information
    console.log('Test completed - check console output for detailed error information')
  })

  test('should test 808 vs 909 drum kit synthesis errors', async ({ page }) => {
    // Test both drum kits
    const drumKits = ['808', '909']

    for (const kit of drumKits) {
      console.log(`Testing ${kit} drum kit...`)

      // Switch to the drum kit (if there's a kit selector)
      const kitSelector = page.locator(`[data-testid="kit-${kit}"]`).first()
      if ((await kitSelector.count()) > 0) {
        await kitSelector.click({ force: true })
        await page.waitForTimeout(100)
      }

      // Enable drums
      const drumsToggle = page.locator('[data-testid="drums-toggle"]').first()
      await drumsToggle.click({ force: true })
      await page.waitForTimeout(100)

      // Add a complex pattern to stress test
      for (let row = 0; row < 4; row++) {
        for (let step = 0; step < 16; step += 2) {
          const cellSelector = `[data-testid="grid-cell-${row}-${step}"]`
          await page.locator(cellSelector).click({ force: true })
          await page.waitForTimeout(20)
        }
      }

      // Start playback
      const playButton = page.locator('[data-testid="play-button"]')
      await playButton.click({ force: true })
      await page.waitForTimeout(2000) // Let it play longer for stress test

      // Stop playback
      await playButton.click({ force: true })
      await page.waitForTimeout(200)

      // Check for errors
      const errors = await page.evaluate(() => window.capturedErrors || [])
      console.log(`Errors for ${kit} kit:`, errors)

      // Clear pattern for next kit
      await page.evaluate(() => {
        const activeCells = document.querySelectorAll(
          '[data-testid*="grid-cell"][data-active="true"]'
        )
        activeCells.forEach(cell => (cell as HTMLElement).click())
      })
    }
  })

  test('should capture detailed error stack traces', async ({ page }) => {
    // Enhanced error capture with stack traces
    await page.addInitScript(() => {
      window.detailedErrors = []

      // Override console.error to capture stack traces
      const originalError = console.error
      console.error = function (...args) {
        const errorInfo = {
          message: args.join(' '),
          stack: new Error().stack,
          timestamp: Date.now(),
        }
        window.detailedErrors.push(errorInfo)
        originalError.apply(console, args)
      }

      // Also capture uncaught errors
      window.addEventListener('error', event => {
        window.detailedErrors.push({
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: (event.error as Error)?.stack || 'No stack trace available',
          timestamp: Date.now(),
        })
      })
    })

    // Enable drums and create pattern
    const drumsToggle = page.locator('[data-testid="drums-toggle"]').first()
    await drumsToggle.click({ force: true })

    // Add kicks on every beat
    for (let step = 0; step < 16; step++) {
      await page.locator(`[data-testid="grid-cell-0-${step}"]`).click({ force: true })
      await page.waitForTimeout(20)
    }

    // Start/stop multiple times to trigger errors
    for (let i = 0; i < 3; i++) {
      await page.locator('[data-testid="play-button"]').click({ force: true })
      await page.waitForTimeout(500)
      await page.locator('[data-testid="play-button"]').click({ force: true })
      await page.waitForTimeout(200)
    }

    // Get detailed error information
    const detailedErrors = await page.evaluate(() => window.detailedErrors || [])

    console.log('=== DETAILED ERROR ANALYSIS ===')
    detailedErrors.forEach((error, index) => {
      console.log(`Error ${index + 1}:`)
      console.log(`  Message: ${error.message}`)
      console.log(`  File: ${error.filename}:${error.lineno}:${error.colno}`)
      console.log(`  Stack: ${error.stack}`)
      console.log(`  Time: ${new Date(error.timestamp).toISOString()}`)
      console.log('---')
    })

    // Look for the specific DrumSynthesis.ts:45 error
    const drumSynthErrors = detailedErrors.filter(
      error =>
        error.message.includes('cancelAndHoldAtTime') || error.stack?.includes('DrumSynthesis.ts')
    )

    if (drumSynthErrors.length > 0) {
      console.log('=== DRUM SYNTHESIS ERRORS FOUND ===')
      drumSynthErrors.forEach(error => {
        console.log('DrumSynthesis Error:', error)
      })
    }
  })
})

// Extend Window interface for TypeScript
declare global {
  interface Window {
    capturedErrors: string[]
    detailedErrors: Array<{
      message: string
      stack?: string
      filename?: string
      lineno?: number
      colno?: number
      timestamp: number
    }>
  }
}
