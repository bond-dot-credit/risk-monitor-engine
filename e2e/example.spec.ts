import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1, h2, h3')).toHaveCount(1);
});
