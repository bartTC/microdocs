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

  test('TOC links navigate within the current section, not across sections', async ({ page }) => {
    // Navigate to GUIDE section
    await page.getByRole('button', { name: 'GUIDE' }).click();
    await expect(page.locator('section#guide')).toBeVisible();

    // Click the "Deep Dive" TOC link in GUIDE section
    const deepDiveTocLink = page.locator('.toc-guide .toc-link', { hasText: 'Deep Dive' });
    await deepDiveTocLink.click();

    // Should still be in GUIDE section, not README
    await expect(page.locator('section#guide')).toBeVisible();
    await expect(page.locator('section#readme')).toBeHidden();

    // Verify the URL hash changed to guide-deep-dive (not readme-deep-dive)
    // This proves it navigated to GUIDE's heading, not README's heading
    await expect(page).toHaveURL(/#guide-deep-dive$/);

    // Verify the GUIDE's Deep Dive heading is scrolled into view
    // This is the key test - correct heading should be visible
    const guideDeepDive = page.locator('section#guide h2#guide-deep-dive');
    await expect(guideDeepDive).toBeInViewport();

    // Verify README's Deep Dive is NOT in viewport (would be if navigation was wrong)
    const readmeDeepDive = page.locator('section#readme h2#readme-deep-dive');
    await expect(readmeDeepDive).not.toBeInViewport();
  });

  test('burger menu toggles mobile navigation on small screens', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Initially, the navigation should be hidden on mobile
    const navContainer = page.locator('nav#main-nav').locator('..');
    await expect(navContainer).toHaveClass(/hidden/);

    // Find and click the burger menu button
    const burgerButton = page.locator('button[aria-label="Toggle navigation"]');
    await expect(burgerButton).toBeVisible();
    await burgerButton.click();

    // After clicking, navigation should be visible
    await expect(navContainer).not.toHaveClass(/hidden/);
    await expect(navContainer).toHaveClass(/flex/);

    // Navigation items should be visible
    await expect(page.getByRole('button', { name: 'README' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'GUIDE' })).toBeVisible();

    // Click burger menu again to close
    await burgerButton.click();
    await expect(navContainer).toHaveClass(/hidden/);
  });

  test('mobile navigation closes after selecting a section', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Open mobile menu
    const burgerButton = page.locator('button[aria-label="Toggle navigation"]');
    await burgerButton.click();

    // Navigation should be visible
    const navContainer = page.locator('nav#main-nav').locator('..');
    await expect(navContainer).toHaveClass(/flex/);

    // Click on a navigation item
    const guideButton = page.getByRole('button', { name: 'GUIDE' });
    await guideButton.click();

    // Navigation should close automatically
    await expect(navContainer).toHaveClass(/hidden/);

    // Section should have changed
    await expect(page.locator('section#guide')).toBeVisible();
    await expect(page.locator('section#readme')).toBeHidden();
  });
});
