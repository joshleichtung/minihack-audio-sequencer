import { test, expect } from '@playwright/test'

test.describe('Scale and Key Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Enable audio context
    await page.click('body')
    await page.waitForTimeout(500)
  })

  test('should show visual feedback for selected scale and key', async ({ page }) => {
    // Monitor console for errors
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Check that PENTATONIC button is initially selected (default)
    const pentatonicButton = page.locator('[data-testid="synth-controls"] button:has-text("PENTATONIC")')
    await expect(pentatonicButton).toHaveClass(/bg-lcars-blue/)

    // Check that C button is initially selected (default) - use exact match
    const cButton = page.locator('[data-testid="synth-controls"] button').filter({ hasText: /^C$/ })
    await expect(cButton).toHaveClass(/bg-lcars-orange/)

    // Test scale change
    const majorButton = page.locator('[data-testid="synth-controls"] button').filter({ hasText: /^MAJOR$/ })
    await majorButton.click({ force: true })
    await page.waitForTimeout(500)

    // Verify MAJOR is now selected
    await expect(majorButton).toHaveClass(/bg-lcars-blue/)
    await expect(pentatonicButton).not.toHaveClass(/bg-lcars-blue/)

    // Test key change
    const dButton = page.locator('[data-testid="synth-controls"] button').filter({ hasText: /^D$/ })
    await dButton.click({ force: true })
    await page.waitForTimeout(500)

    // Verify D is now selected
    await expect(dButton).toHaveClass(/bg-lcars-orange/)
    await expect(cButton).not.toHaveClass(/bg-lcars-orange/)

    // Ensure no console errors occurred
    expect(consoleErrors).toHaveLength(0)
  })

  test('should change notes when scale and key are changed', async ({ page }) => {
    // Add some notes to the grid first
    await page.locator('[data-testid="grid-cell-15-0"]').click({ force: true }) // Top row (highest note)
    await page.locator('[data-testid="grid-cell-0-0"]').click({ force: true })   // Bottom row (lowest note)
    await page.waitForTimeout(500)

    // Start playback to hear the notes
    await page.locator('[data-testid="play-button"]').click({ force: true })
    await page.waitForTimeout(1000)

    // Change to BLUES scale
    await page.locator('[data-testid="synth-controls"] button').filter({ hasText: /^BLUES$/ }).click({ force: true })
    await page.waitForTimeout(1000)

    // Change to F key
    await page.locator('[data-testid="synth-controls"] button').filter({ hasText: /^F$/ }).click({ force: true })
    await page.waitForTimeout(1000)

    // Stop playback
    await page.locator('[data-testid="play-button"]').click({ force: true })

    // Verify the buttons show correct selection
    const bluesButton = page.locator('[data-testid="synth-controls"] button').filter({ hasText: /^BLUES$/ })
    const fButton = page.locator('[data-testid="synth-controls"] button').filter({ hasText: /^F$/ })

    await expect(bluesButton).toHaveClass(/bg-lcars-blue/)
    await expect(fButton).toHaveClass(/bg-lcars-orange/)
  })

  test('should work with different scale combinations', async ({ page }) => {
    const testCombinations = [
      { scale: 'MINOR', key: 'A' },
      { scale: 'DORIAN', key: 'G' },
      { scale: 'CHROMATIC', key: 'C#' }
    ]

    for (const combo of testCombinations) {
      // Select scale
      const scaleButton = page.locator('[data-testid="synth-controls"] button').filter({ hasText: new RegExp(`^${combo.scale}$`) })
      await scaleButton.click({ force: true })
      await page.waitForTimeout(300)

      // Select key
      const keyButton = page.locator('[data-testid="synth-controls"] button').filter({ hasText: new RegExp(`^${combo.key}$`) })
      await keyButton.click({ force: true })
      await page.waitForTimeout(300)

      // Verify selection
      await expect(scaleButton).toHaveClass(/bg-lcars-blue/)
      await expect(keyButton).toHaveClass(/bg-lcars-orange/)
    }
  })
})