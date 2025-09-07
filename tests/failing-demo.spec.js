import { test, expect } from '@playwright/test';

test.describe('AI Demo Tests', () => {
  
  test('flaky network test - should trigger AI retry', async ({ page }) => {
    // Simulate flaky network behavior
    await page.goto('https://httpstat.us/500');
    
    // This will fail and AI should analyze it as network-related
    await expect(page.locator('body')).toContainText('200 OK');
  });

  test('selector issue - should trigger AI analysis', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc');
    
    // Wrong selector to trigger AI analysis
    await page.fill('.non-existent-selector', 'test');
  });
});