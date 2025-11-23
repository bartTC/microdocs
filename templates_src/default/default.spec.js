/**
 * Playwright checks for the default template using a real microdocs build output.
 */
import { expect, test } from '@playwright/test';

const OUTPUT_PAGE = 'default.html';

test.describe('default template microdocs output', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(OUTPUT_PAGE);
  });

  test('renders generated markdown content', async ({ page }) => {
    const readmeHeading = page.locator('section#readme article h1', {
      hasText: 'Default Template Playwright Test',
    });
    await expect(readmeHeading).toBeVisible();
    await expect(
      page.getByText('This README is used to verify the default template output for Playwright.')
    ).toBeVisible();
    await expect(page.locator('section#readme pre code').first()).toContainText('greet');
  });

  test('supports navigation between sections', async ({ page }) => {
    const guideTab = page.getByRole('button', { name: 'GUIDE' });

    await expect(page.locator('section#readme')).toBeVisible();
    await guideTab.click();

    await expect(page.locator('section#guide')).toBeVisible();
    await expect(page.locator('section#readme')).toBeHidden();
    await expect(guideTab).toHaveClass(/font-semibold/);
  });

  test('builds the table of contents per section', async ({ page }) => {
    await page.waitForSelector('.toc-readme .toc-link');
    await expect(page.locator('.toc-readme .toc-link', { hasText: 'Overview' })).toBeVisible();
    await expect(page.locator('.toc-readme .toc-link', { hasText: 'Code Sample' })).toBeVisible();

    await page.getByRole('button', { name: 'GUIDE' }).click();
    await page.waitForSelector('.toc-guide .toc-link');

    await expect(page.locator('.toc-guide .toc-link', { hasText: 'Setup' })).toBeVisible();
    await expect(page.locator('.toc-guide .toc-link', { hasText: 'Navigation' })).toBeVisible();
    await expect(page.locator('.toc-readme')).toBeHidden();
  });

  test('internal links switch to the target section', async ({ page }) => {
    await page.getByRole('link', { name: /usage guide/i }).click();
    await expect(page.locator('section#guide')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Usage Guide' })).toBeVisible();
  });
});
