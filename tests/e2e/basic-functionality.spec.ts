import { test, expect } from '@playwright/test';

test.describe('VibeLoop Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Enable audio context by clicking somewhere
    await page.click('body');
    await page.waitForTimeout(500); // Allow audio context to initialize
  });

  test('should load the main interface', async ({ page }) => {
    // Check for main title
    await expect(page.locator('h1')).toContainText('VIBELOOP');

    // Check for key components
    await expect(page.locator('[data-testid="grid"]')).toBeVisible();
    await expect(page.locator('[data-testid="transport"]')).toBeVisible();
    await expect(page.locator('[data-testid="synth-controls"]')).toBeVisible();
    await expect(page.locator('[data-testid="drum-controls"]')).toBeVisible();
  });

  test('should be able to start and stop playback', async ({ page }) => {
    const playButton = page.locator('[data-testid="play-button"]');

    // Start playback
    await playButton.click({ force: true });
    await expect(playButton).toHaveAttribute('aria-pressed', 'true');

    // Small delay to ensure state update completes
    await page.waitForTimeout(100);

    // Stop playback
    await playButton.click({ force: true });
    await expect(playButton).toHaveAttribute('aria-pressed', 'false');
  });

  test('should handle spacebar for play/pause', async ({ page }) => {
    const playButton = page.locator('[data-testid="play-button"]');

    // Test spacebar functionality
    await page.keyboard.press('Space');
    await expect(playButton).toHaveAttribute('aria-pressed', 'true');

    // Small delay to ensure state update completes
    await page.waitForTimeout(100);

    await page.keyboard.press('Space');
    await expect(playButton).toHaveAttribute('aria-pressed', 'false');
  });

  test('should allow clicking grid cells to toggle notes', async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip(); // Mobile touch interaction issues in test environment
    }
    const firstCell = page.locator('[data-testid="grid-cell-0-0"]');

    // Initially should be inactive
    await expect(firstCell).toHaveAttribute('data-testid-active', 'false');

    // Click to activate (off → normal velocity)
    await firstCell.click({ force: true });
    await expect(firstCell).toHaveAttribute('data-testid-active', 'true');

    // Click through velocity states to deactivate (normal → emphasis → quiet → off)
    await firstCell.click({ force: true }); // emphasis
    await firstCell.click({ force: true }); // quiet
    await firstCell.click({ force: true }); // off
    await expect(firstCell).toHaveAttribute('data-testid-active', 'false');
  });

  test('should show visual feedback during playback', async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip(); // Mobile audio context initialization issues in test environment
    }
    // Start playback
    await page.locator('[data-testid="play-button"]').click({ force: true });

    // Wait for position indicator to appear
    await page.waitForSelector('[data-testid="position-indicator"]', { timeout: 5000 });

    // Check that position indicator is moving
    const indicator = page.locator('[data-testid="position-indicator"]');
    const initialPosition = await indicator.getAttribute('style');

    await page.waitForTimeout(500); // Wait for movement (increased for slower browsers)

    const newPosition = await indicator.getAttribute('style');
    expect(newPosition).not.toBe(initialPosition);
  });

  test('should maintain responsive layout on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Check that mobile layout adaptations are present
      await expect(page.locator('.min-h-screen')).toBeVisible();

      // Verify touch-friendly sizing
      const buttons = page.locator('button');
      const firstButton = buttons.first();
      const buttonBox = await firstButton.boundingBox();

      // Touch targets should be at least 44px
      expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
    }
  });
});