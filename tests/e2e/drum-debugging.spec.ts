import { test, expect } from '@playwright/test'

test.describe('Drum Debugging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Enable audio context
    await page.click('body')
    await page.waitForTimeout(500)
  })

  test('should reproduce drum synthesis error when enabling drums', async ({ page }) => {
    // Monitor ALL console messages, warnings, and errors
    const consoleMessages: { type: string; text: string }[] = []
    const jsErrors: Error[] = []

    // Capture ALL console output
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
      })
    })

    // Capture JavaScript runtime errors
    page.on('pageerror', error => {
      jsErrors.push(error)
      console.log('❌ PAGE ERROR:', error.message)
    })

    // Capture unhandled promise rejections
    page.on('response', response => {
      if (!response.ok()) {
        console.log(`❌ HTTP ERROR: ${response.status()} ${response.url()}`)
      }
    })

    // Start by pressing play first
    await page.locator('[data-testid="play-button"]').click({ force: true })
    await page.waitForTimeout(1000)

    // Enable drums
    await page.locator('button:has-text("DRUMS OFF")').click({ force: true })
    await page.waitForTimeout(2000)

    // Filter and analyze all captured issues
    const errors = consoleMessages.filter(msg => msg.type === 'error')
    const warnings = consoleMessages.filter(msg => msg.type === 'warning')

    // Check for the specific drum synthesis error
    const hasSetValueAtTimeError = errors.some(
      error =>
        error.text.includes('Invalid argument(s) to setValueAtTime') && error.text.includes('null')
    )

    // Check for the scale/key onSelect error
    const hasOnSelectError = errors.some(error => error.text.includes('onSelect is not a function'))

    // Log comprehensive error analysis
    console.log('\n=== COMPREHENSIVE ERROR ANALYSIS ===')
    console.log(`Total console messages: ${consoleMessages.length}`)
    console.log(`JavaScript errors: ${jsErrors.length}`)
    console.log(`Console errors: ${errors.length}`)
    console.log(`Console warnings: ${warnings.length}`)

    if (hasSetValueAtTimeError) {
      console.log('❌ FOUND: setValueAtTime null error')
    } else {
      console.log('✅ No setValueAtTime errors')
    }

    if (hasOnSelectError) {
      console.log('❌ FOUND: onSelect function error')
    } else {
      console.log('✅ No onSelect errors')
    }

    // Log all errors and warnings for debugging
    if (errors.length > 0) {
      console.log('\n--- CONSOLE ERRORS ---')
      errors.forEach((error, i) => console.log(`${i + 1}. ${error.text}`))
    }

    if (warnings.length > 0) {
      console.log('\n--- CONSOLE WARNINGS ---')
      warnings.forEach((warning, i) => console.log(`${i + 1}. ${warning.text}`))
    }

    if (jsErrors.length > 0) {
      console.log('\n--- JAVASCRIPT ERRORS ---')
      jsErrors.forEach((error, i) => console.log(`${i + 1}. ${error.message}\n${error.stack}`))
    }

    // Assert that there are no JavaScript errors
    expect(jsErrors).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('should test drum synthesis with different drum patterns', async ({ page }) => {
    // Add some drum patterns first
    await page.locator('[data-testid="grid-cell-0-0"]').click({ force: true }) // Kick on beat 1
    await page.locator('[data-testid="grid-cell-0-4"]').click({ force: true }) // Kick on beat 5
    await page.locator('[data-testid="grid-cell-1-2"]').click({ force: true }) // Snare on beat 3
    await page.locator('[data-testid="grid-cell-1-6"]').click({ force: true }) // Snare on beat 7

    // Monitor console for errors
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Enable drums first, then play
    await page.locator('button:has-text("DRUMS OFF")').click({ force: true })
    await page.waitForTimeout(500)

    // Start playback
    await page.locator('[data-testid="play-button"]').click({ force: true })
    await page.waitForTimeout(3000)

    // Log results
    if (consoleErrors.length > 0) {
      console.log('❌ Errors found with drum patterns:', consoleErrors)
    } else {
      console.log('✅ No errors with drum patterns')
    }
  })

  test('should test scale and key changes during playback', async ({ page }) => {
    // Monitor ALL console messages, warnings, and errors
    const consoleMessages: { type: string; text: string }[] = []
    const jsErrors: Error[] = []

    // Capture ALL console output
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
      })
    })

    // Capture JavaScript runtime errors
    page.on('pageerror', error => {
      jsErrors.push(error)
      console.log('❌ PAGE ERROR during scale/key test:', error.message)
    })

    // Start playback first
    await page.locator('[data-testid="play-button"]').click({ force: true })
    await page.waitForTimeout(1000)

    // Change scale
    const scaleButtons = page.locator('[data-testid="synth-controls"] button:has-text("MAJOR")')
    if ((await scaleButtons.count()) > 0) {
      await scaleButtons.first().click({ force: true })
      await page.waitForTimeout(500)
    }

    // Change key
    const keyButtons = page.locator('[data-testid="synth-controls"] button:has-text("D")')
    if ((await keyButtons.count()) > 0) {
      await keyButtons.first().click({ force: true })
      await page.waitForTimeout(500)
    }

    // Try different scale
    const minorButtons = page.locator('[data-testid="synth-controls"] button:has-text("MINOR")')
    if ((await minorButtons.count()) > 0) {
      await minorButtons.first().click({ force: true })
      await page.waitForTimeout(1000)
    }

    // Filter and analyze all captured issues
    const errors = consoleMessages.filter(msg => msg.type === 'error')
    const warnings = consoleMessages.filter(msg => msg.type === 'warning')

    // Check for the scale/key onSelect error specifically
    const hasOnSelectError = errors.some(error => error.text.includes('onSelect is not a function'))

    // Log comprehensive error analysis
    console.log('\n=== SCALE/KEY CHANGE ERROR ANALYSIS ===')
    console.log(`Total console messages: ${consoleMessages.length}`)
    console.log(`JavaScript errors: ${jsErrors.length}`)
    console.log(`Console errors: ${errors.length}`)
    console.log(`Console warnings: ${warnings.length}`)

    if (hasOnSelectError) {
      console.log('❌ FOUND: onSelect function error in scale/key controls')
    } else {
      console.log('✅ No onSelect errors in scale/key controls')
    }

    // Log all errors and warnings for debugging
    if (errors.length > 0) {
      console.log('\n--- SCALE/KEY CONSOLE ERRORS ---')
      errors.forEach((error, i) => console.log(`${i + 1}. ${error.text}`))
    }

    if (warnings.length > 0) {
      console.log('\n--- SCALE/KEY CONSOLE WARNINGS ---')
      warnings.forEach((warning, i) => console.log(`${i + 1}. ${warning.text}`))
    }

    if (jsErrors.length > 0) {
      console.log('\n--- SCALE/KEY JAVASCRIPT ERRORS ---')
      jsErrors.forEach((error, i) => console.log(`${i + 1}. ${error.message}\n${error.stack}`))
    }

    // Assert that there are no JavaScript errors
    expect(jsErrors).toHaveLength(0)
    expect(errors).toHaveLength(0)
  })

  test('should test combined drum and scale changes', async ({ page }) => {
    // Add some notes to the grid
    await page.locator('[data-testid="grid-cell-15-0"]').click({ force: true })
    await page.locator('[data-testid="grid-cell-15-4"]').click({ force: true })

    // Add drum patterns
    await page.locator('[data-testid="grid-cell-0-0"]').click({ force: true })
    await page.locator('[data-testid="grid-cell-1-2"]').click({ force: true })

    // Monitor console for errors
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Enable drums
    await page.locator('button:has-text("DRUMS OFF")').click({ force: true })
    await page.waitForTimeout(500)

    // Start playback
    await page.locator('[data-testid="play-button"]').click({ force: true })
    await page.waitForTimeout(1000)

    // Change scale while playing
    const scaleButtons = page.locator('[data-testid="synth-controls"] button:has-text("BLUES")')
    if ((await scaleButtons.count()) > 0) {
      await scaleButtons.first().click({ force: true })
      await page.waitForTimeout(1000)
    }

    // Change key while playing
    const keyButtons = page.locator('[data-testid="synth-controls"] button:has-text("F")')
    if ((await keyButtons.count()) > 0) {
      await keyButtons.first().click({ force: true })
      await page.waitForTimeout(1000)
    }

    // Log results
    if (consoleErrors.length > 0) {
      console.log('❌ Errors found with combined drum and scale changes:', consoleErrors)
    } else {
      console.log('✅ No errors with combined changes')
    }
  })
})
