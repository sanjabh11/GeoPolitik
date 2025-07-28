import { test, expect } from '@playwright/test';

test.describe('Tutorial Flow', () => {
  test('should load tutorial page', async ({ page }) => {
    await page.goto('/tutorial');
    await expect(page).toHaveTitle(/Game Theory Tutorial/i);
    await expect(page.locator('h1')).toContainText(/Game Theory/i);
  });

  test('should display tutorial content', async ({ page }) => {
    await page.goto('/tutorial');
    
    // Wait for content to load
    await expect(page.locator('text=Prisoners Dilemma')).toBeVisible();
    await expect(page.locator('text=Concept Explanation')).toBeVisible();
  });

  test('should allow answer submission', async ({ page }) => {
    await page.goto('/tutorial');
    
    // Wait for options to appear
    await page.waitForSelector('button:has-text("Option")');
    
    // Click first option
    await page.locator('button:has-text("Option")').first().click();
    
    // Submit answer
    await page.locator('button:has-text("Submit Answer")').click();
    
    // Check for result
    await expect(page.locator('text=Correct!')).toBeVisible();
  });

  test('should reset progress', async ({ page }) => {
    await page.goto('/tutorial');
    
    await page.locator('button:has-text("Reset Progress")').click();
    
    // Verify progress reset (implementation specific)
    await expect(page.locator('text=0% Complete')).toBeVisible();
  });
});
