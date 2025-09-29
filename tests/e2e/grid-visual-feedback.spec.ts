import { test, expect } from '@playwright/test'

test.describe('Grid Visual Feedback', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Enable audio context
    await page.click('body')
    await page.waitForTimeout(500)
  })

  test('should show visual feedback for normal click (toggle active/inactive)', async ({
    page,
  }) => {
    const cell = page.locator('[data-testid="grid-cell-5-3"]')

    // Initial state should be inactive (gray)
    await expect(cell).toHaveClass(/bg-gray-700/)
    await expect(cell).not.toHaveClass(/bg-lcars-orange/)

    // Click to activate - should show orange (default velocity 0.7)
    await cell.click()
    await page.waitForTimeout(100)

    await expect(cell).toHaveClass(/bg-lcars-orange/)
    await expect(cell).not.toHaveClass(/bg-gray-700/)

    // Click again to deactivate - should go back to gray
    await cell.click()
    await page.waitForTimeout(100)

    await expect(cell).toHaveClass(/bg-gray-700/)
    await expect(cell).not.toHaveClass(/bg-lcars-orange/)
  })

  test('should show visual feedback for shift+click (cycle through velocities)', async ({
    page,
  }) => {
    const cell = page.locator('[data-testid="grid-cell-7-5"]')

    // Initial state should be inactive (gray)
    await expect(cell).toHaveClass(/bg-gray-700/)

    // Shift+click on inactive cell should activate with default velocity (orange)
    await cell.click({ modifiers: ['Shift'] })
    await page.waitForTimeout(100)

    await expect(cell).toHaveClass(/bg-lcars-orange/)

    // Shift+click to cycle to high velocity (red)
    await cell.click({ modifiers: ['Shift'] })
    await page.waitForTimeout(100)

    await expect(cell).toHaveClass(/bg-red-500/)

    // Shift+click to cycle to low velocity (blue)
    await cell.click({ modifiers: ['Shift'] })
    await page.waitForTimeout(100)

    await expect(cell).toHaveClass(/bg-lcars-blue/)

    // Shift+click to cycle back to normal velocity (orange)
    await cell.click({ modifiers: ['Shift'] })
    await page.waitForTimeout(100)

    await expect(cell).toHaveClass(/bg-lcars-orange/)
  })

  test('should maintain visual state during playback', async ({ page }) => {
    const cell = page.locator('[data-testid="grid-cell-10-0"]')

    // Activate a cell with normal click
    await cell.click()
    await page.waitForTimeout(100)

    await expect(cell).toHaveClass(/bg-lcars-orange/)

    // Start playback
    await page.locator('[data-testid="play-button"]').click()
    await page.waitForTimeout(2000) // Let it play through a few cycles

    // Cell should still show as active even during playback
    await expect(cell).toHaveClass(/bg-lcars-orange/)

    // Stop playback
    await page.locator('[data-testid="play-button"]').click()

    // Cell should still be active after stopping
    await expect(cell).toHaveClass(/bg-lcars-orange/)
  })
})
