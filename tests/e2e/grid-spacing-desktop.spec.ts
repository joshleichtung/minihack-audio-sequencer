import { test } from '@playwright/test'

test.describe('Grid Spacing Desktop Layout', () => {
  test('should investigate grid spacing at different desktop sizes', async ({ page }) => {
    await page.goto('/')
    await page.click('body') // Enable audio context
    await page.waitForTimeout(500)

    // Test at different desktop sizes
    const sizes = [
      { name: 'Large Desktop', width: 1920, height: 1080 },
      { name: 'Medium Desktop', width: 1440, height: 900 },
      { name: 'Small Desktop', width: 1024, height: 768 },
    ]

    for (const size of sizes) {
      console.log(`Testing ${size.name} (${size.width}x${size.height})`)

      await page.setViewportSize({ width: size.width, height: size.height })
      await page.waitForTimeout(500)

      // Take screenshot to analyze spacing
      await page.screenshot({
        path: `debug-grid-${size.name.toLowerCase().replace(' ', '-')}.png`,
        fullPage: false,
      })

      // Get grid container styles
      const gridContainer = page.locator('[data-testid="grid"] .grid')
      const containerStyles = await gridContainer.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          gap: computed.gap,
          gridTemplateColumns: computed.gridTemplateColumns,
          width: computed.width,
          height: computed.height,
          maxWidth: computed.maxWidth,
          aspectRatio: computed.aspectRatio,
        }
      })

      console.log(`${size.name} Grid Styles:`, containerStyles)

      // Check if grid cells have visible spacing
      const firstCell = page.locator('[data-testid="grid-cell-0-0"]')
      const secondCell = page.locator('[data-testid="grid-cell-0-1"]')

      const cellPositions = await Promise.all([firstCell.boundingBox(), secondCell.boundingBox()])

      if (cellPositions[0] && cellPositions[1]) {
        const spacing = cellPositions[1].x - (cellPositions[0].x + cellPositions[0].width)
        console.log(`${size.name} Cell Spacing: ${spacing}px`)

        // Log whether spacing is visible
        if (spacing < 1) {
          console.log(`⚠️ ${size.name}: No visible spacing between cells`)
        } else {
          console.log(`✅ ${size.name}: ${spacing}px spacing between cells`)
        }
      }
    }
  })

  test('should test scroll behavior and above-the-fold layout', async ({ page }) => {
    await page.goto('/')
    await page.click('body')
    await page.waitForTimeout(500)

    // Set to typical desktop size
    await page.setViewportSize({ width: 1440, height: 900 })

    // Check if main content fits above the fold
    const mainContent = page.locator('[data-testid="grid"]')
    const synthControls = page.locator('[data-testid="synth-controls"]')

    const contentBox = await mainContent.boundingBox()
    const controlsBox = await synthControls.boundingBox()

    console.log('Main Content Bottom:', contentBox?.y + (contentBox?.height || 0))
    console.log('Viewport Height:', 900)
    console.log('Controls Position:', controlsBox?.y)

    // Check if vertical scrolling is needed
    const pageHeight = await page.evaluate(() => document.body.scrollHeight)
    const viewportHeight = await page.evaluate(() => window.innerHeight)

    console.log('Page Height:', pageHeight)
    console.log('Viewport Height:', viewportHeight)
    console.log('Requires Scrolling:', pageHeight > viewportHeight)

    if (pageHeight > viewportHeight) {
      console.log('⚠️ Page requires scrolling - not above the fold')
    } else {
      console.log('✅ All content fits above the fold')
    }
  })
})
