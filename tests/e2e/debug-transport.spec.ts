import { test } from '@playwright/test'

test.describe('Debug Transport Issues', () => {
  test('should debug play button and transport functionality', async ({ page }) => {
    // Listen for console messages
    const consoleMessages: Array<{ type: string; text: string; timestamp: string }> = []
    page.on('console', msg => {
      const message = {
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString(),
      }
      consoleMessages.push(message)
      console.log(`CONSOLE [${msg.type()}]: ${msg.text()}`)
    })

    // Listen for page errors
    page.on('pageerror', error => {
      console.log(`PAGE ERROR: ${error.message}`)
      console.log(`STACK: ${error.stack}`)
    })

    // Navigate to the application
    console.log('=== NAVIGATING TO APPLICATION ===')
    await page.goto('/')

    // Wait for page to load completely
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Take initial screenshot
    await page.screenshot({ path: 'debug-initial-state.png', fullPage: true })

    // Check if the application loaded properly
    const title = await page.title()
    console.log(`Page title: ${title}`)

    // Look for the play button using the expected test ID
    console.log('=== LOOKING FOR PLAY BUTTON ===')
    const playButton = page.locator('[data-testid="play-button"]')
    const playButtonExists = (await playButton.count()) > 0
    console.log(`Play button exists: ${playButtonExists}`)

    if (playButtonExists) {
      const buttonText = await playButton.textContent()
      const isVisible = await playButton.isVisible()
      const isEnabled = await playButton.isEnabled()
      console.log(`Play button text: "${buttonText}"`)
      console.log(`Play button visible: ${isVisible}`)
      console.log(`Play button enabled: ${isEnabled}`)

      if (isVisible && isEnabled) {
        console.log('=== CLICKING PLAY BUTTON ===')

        // Clear console messages before clicking
        consoleMessages.length = 0

        await playButton.click({ force: true })
        console.log('Play button clicked')

        // Wait for any async operations
        await page.waitForTimeout(3000)

        // Check for Tone.js context initialization logs
        console.log('=== CHECKING FOR TONE.JS LOGS ===')
        const toneContextLogs = consoleMessages.filter(
          msg =>
            msg.text.toLowerCase().includes('tone') ||
            msg.text.toLowerCase().includes('context') ||
            msg.text.toLowerCase().includes('starting')
        )
        console.log(`Found ${toneContextLogs.length} Tone.js related logs:`)
        toneContextLogs.forEach(log => console.log(`  - [${log.type}] ${log.text}`))

        // Take screenshot after clicking play
        await page.screenshot({ path: 'debug-after-play-click.png', fullPage: true })
      }
    } else {
      console.log('Play button not found, looking for alternatives...')
      const allButtons = page.locator('button')
      const buttonCount = await allButtons.count()
      console.log(`Found ${buttonCount} buttons total`)

      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const btn = allButtons.nth(i)
        const text = await btn.textContent()
        console.log(`Button ${i}: "${text}"`)
      }
    }

    // Check for transport position indicator
    console.log('=== CHECKING TRANSPORT POSITION INDICATOR ===')
    const positionIndicator = page.locator('[data-testid="position-indicator"]')
    const indicatorExists = (await positionIndicator.count()) > 0
    console.log(`Position indicator exists: ${indicatorExists}`)

    if (indicatorExists) {
      const indicatorStyle = await positionIndicator.getAttribute('style')
      console.log(`Position indicator style: ${indicatorStyle}`)
    }

    // Test grid cell functionality
    console.log('=== TESTING GRID CELLS ===')
    const gridCell00 = page.locator('[data-testid="grid-cell-0-0"]')
    const gridCellExists = (await gridCell00.count()) > 0
    console.log(`Grid cell 0-0 exists: ${gridCellExists}`)

    if (gridCellExists) {
      console.log('Clicking grid cell 0-0')
      await gridCell00.click({ force: true })
      await page.waitForTimeout(500)

      // Check if cell got activated (might have visual feedback)
      const cellClasses = await gridCell00.getAttribute('class')
      console.log(`Grid cell 0-0 classes after click: ${cellClasses}`)
    }

    // Check for any error messages
    console.log('=== CHECKING FOR ERRORS ===')
    const errorLogs = consoleMessages.filter(msg => msg.type === 'error')
    const warningLogs = consoleMessages.filter(msg => msg.type === 'warning')

    console.log(`Found ${errorLogs.length} error logs:`)
    errorLogs.forEach(log => console.log(`  - ERROR: ${log.text}`))

    console.log(`Found ${warningLogs.length} warning logs:`)
    warningLogs.forEach(log => console.log(`  - WARNING: ${log.text}`))

    // Check if the development server is running properly
    console.log('=== CHECKING DEV SERVER ===')
    const response = await page.goto('/')
    console.log(`Response status: ${response?.status()}`)

    // Final summary
    console.log('\n=== FINAL SUMMARY ===')
    console.log(`Total console messages: ${consoleMessages.length}`)
    console.log(`Play button found: ${playButtonExists}`)
    console.log(`Position indicator found: ${indicatorExists}`)
    console.log(`Grid cells found: ${gridCellExists}`)
    console.log(`Errors: ${errorLogs.length}`)
    console.log(`Warnings: ${warningLogs.length}`)

    // Look specifically for "Starting Tone.js context..." message
    const startingToneLogs = consoleMessages.filter(msg =>
      msg.text.includes('Starting Tone.js context')
    )
    console.log(`"Starting Tone.js context" logs: ${startingToneLogs.length}`)

    if (startingToneLogs.length === 0) {
      console.log('❌ ISSUE: No "Starting Tone.js context..." log found!')
    } else {
      console.log('✅ Found Tone.js context initialization log')
    }
  })
})
