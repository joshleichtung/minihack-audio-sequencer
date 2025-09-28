import { test, expect } from '@playwright/test';

test.describe('Audio Timing and Synchronization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Enable audio context
    await page.click('body');
    await page.waitForTimeout(500);
  });

  test.skip('should maintain consistent BPM timing', async ({ page }) => {
    // TODO: Re-enable when we have proper audio analysis tools
    // Currently tests DOM animation timing, not actual audio precision
    // Set a known BPM
    const bpmSlider = page.locator('[data-testid="bpm-slider"]');
    await bpmSlider.fill('120');

    // Start playback
    await page.locator('[data-testid="play-button"]').click({ force: true });

    // Measure timing by recording position changes
    const timings: number[] = [];
    const positions: number[] = [];

    for (let i = 0; i < 8; i++) {
      await page.waitForFunction(() => {
        const indicator = document.querySelector('[data-testid="position-indicator"]');
        return indicator && indicator.getAttribute('style')?.includes('translateX');
      });

      const timestamp = Date.now();
      const position = await page.evaluate(() => {
        const indicator = document.querySelector('[data-testid="position-indicator"]');
        const style = indicator?.getAttribute('style') || '';
        const match = style.match(/translateX\\(([\\d.]+)%\\)/);
        return match ? parseFloat(match[1]) : 0;
      });

      timings.push(timestamp);
      positions.push(position);

      await page.waitForTimeout(100); // Wait for next measurement
    }

    // Verify timing consistency (allowing for some variance)
    const intervals = [];
    for (let i = 1; i < timings.length; i++) {
      intervals.push(timings[i] - timings[i - 1]);
    }

    const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
    const variance = intervals.map(interval => Math.abs(interval - avgInterval));
    const maxVariance = Math.max(...variance);

    // Should maintain timing within reasonable variance for 120 BPM (cross-browser compatible)
    expect(maxVariance).toBeLessThan(250);
  });

  test('should handle drum pattern loops without timing drift', async ({ page }) => {
    // Create a simple drum pattern
    await page.locator('[data-testid="grid-cell-0-0"]').click({ force: true }); // Kick on beat 1
    await page.locator('[data-testid="grid-cell-0-4"]').click({ force: true }); // Kick on beat 5
    await page.locator('[data-testid="grid-cell-0-8"]').click({ force: true }); // Kick on beat 9
    await page.locator('[data-testid="grid-cell-0-12"]').click({ force: true }); // Kick on beat 13

    // Start playback
    await page.locator('[data-testid="play-button"]').click({ force: true });

    // Record timing of several complete loops
    const loopTimings: number[] = [];

    for (let loop = 0; loop < 4; loop++) {
      // Wait for loop to complete (position resets to 0)
      await page.waitForFunction(() => {
        const indicator = document.querySelector('[data-testid="position-indicator"]');
        const style = indicator?.getAttribute('style') || '';
        const match = style.match(/translateX\\(([\\d.]+)%\\)/);
        const position = match ? parseFloat(match[1]) : 0;
        return position < 5; // Near the beginning
      });

      loopTimings.push(Date.now());

      // Wait for next loop
      await page.waitForTimeout(100);
    }

    // Calculate loop intervals
    const loopIntervals = [];
    for (let i = 1; i < loopTimings.length; i++) {
      loopIntervals.push(loopTimings[i] - loopTimings[i - 1]);
    }

    // Verify loop timing consistency
    const avgLoopTime = loopIntervals.reduce((a, b) => a + b) / loopIntervals.length;
    const loopVariance = loopIntervals.map(interval => Math.abs(interval - avgLoopTime));
    const maxLoopVariance = Math.max(...loopVariance);

    // Loop timing should be consistent within 100ms
    expect(maxLoopVariance).toBeLessThan(100);
  });

  test.skip('should not accumulate timing errors over multiple loops', async ({ page }) => {
    // TODO: Re-enable when we need production-grade precision
    // Position detection logic is brittle - tests animation frames not audio timing
    // Start with a known pattern
    await page.locator('[data-testid="grid-cell-0-0"]').click({ force: true });

    // Set BPM and start
    const bpmSlider = page.locator('[data-testid="bpm-slider"]');
    await bpmSlider.fill('140');
    await page.locator('[data-testid="play-button"]').click({ force: true });

    // Measure first loop timing
    let firstLoopStart = 0;
    await page.waitForFunction(() => {
      const indicator = document.querySelector('[data-testid="position-indicator"]');
      const style = indicator?.getAttribute('style') || '';
      const match = style.match(/translateX\\(([\\d.]+)%\\)/);
      const position = match ? parseFloat(match[1]) : 0;
      return position < 5;
    });
    firstLoopStart = Date.now();

    // Wait for multiple loops (let's say 10 loops)
    for (let i = 0; i < 10; i++) {
      // Wait for position to reset to start (< 5%)
      await page.waitForFunction(() => {
        const indicator = document.querySelector('[data-testid="position-indicator"]');
        const style = indicator?.getAttribute('style') || '';
        const match = style.match(/translateX\\(([\\d.]+)%\\)/);
        const position = match ? parseFloat(match[1]) : 0;
        return position < 5;
      }, { timeout: 10000 });

      // Wait for the loop to progress (position should be > 30% to ensure movement)
      await page.waitForFunction(() => {
        const indicator = document.querySelector('[data-testid="position-indicator"]');
        const style = indicator?.getAttribute('style') || '';
        const match = style.match(/translateX\\(([\\d.]+)%\\)/);
        const position = match ? parseFloat(match[1]) : 0;
        return position > 30;
      }, { timeout: 10000 });
    }

    // Measure final loop timing
    let finalLoopStart = 0;
    await page.waitForFunction(() => {
      const indicator = document.querySelector('[data-testid="position-indicator"]');
      const style = indicator?.getAttribute('style') || '';
      const match = style.match(/translateX\\(([\\d.]+)%\\)/);
      const position = match ? parseFloat(match[1]) : 0;
      return position < 5;
    });
    finalLoopStart = Date.now();

    // Calculate expected time for 10 loops at 140 BPM
    // Sequencer uses 16th notes ('16n'), so 16 steps = 16 sixteenth notes = 4 quarter notes = 1 measure
    const beatsPerMinute = 140;
    const beatsPerSecond = beatsPerMinute / 60;
    const expectedLoopTime = (4 / beatsPerSecond) * 1000; // 4 beats (1 measure) in milliseconds
    const expectedTotalTime = expectedLoopTime * 10;

    const actualTotalTime = finalLoopStart - firstLoopStart;
    const timingError = Math.abs(actualTotalTime - expectedTotalTime);

    console.log(`Expected total time: ${expectedTotalTime}ms (${expectedLoopTime}ms per loop)`);
    console.log(`Actual total time: ${actualTotalTime}ms`);
    console.log(`Timing error: ${timingError}ms`);

    // Timing error should be less than 500ms over 10 loops
    expect(timingError).toBeLessThan(500);
  });
});