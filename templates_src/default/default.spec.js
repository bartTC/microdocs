/**
 * Playwright checks for the default template using a real microdocs build output.
 */
import { expect, test } from '@playwright/test';

const OUTPUT_PAGE = 'default.html';

test.describe('default template microdocs output', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(OUTPUT_PAGE);
  });

  test('renders generated markdown content', async ({page}) => {
    const readmeHeading = page.locator('section#readme article h1', {
      hasText: 'Default Template Playwright Test',
    });
    await expect(readmeHeading).toBeVisible();
    await expect(
        page.getByText('This README is used to verify the default template output for Playwright.')
    ).toBeVisible();
    await expect(page.locator('section#readme pre code').first()).toContainText('greet');
  });

  test('supports navigation between sections', async ({page}) => {
    const guideTab = page.getByRole('button', {name: 'GUIDE'});

    await expect(page.locator('section#readme')).toBeVisible();
    await guideTab.click();

    await expect(page.locator('section#guide')).toBeVisible();
    await expect(page.locator('section#readme')).toBeHidden();
    await expect(guideTab).toHaveClass(/font-semibold/);
  });

  test('builds the table of contents per section', async ({page}) => {
    await page.waitForSelector('.toc-readme .toc-link');
    await expect(page.locator('.toc-readme .toc-link', {hasText: 'Overview'})).toBeVisible();
    await expect(page.locator('.toc-readme .toc-link', {hasText: 'Code Sample'})).toBeVisible();

    await page.getByRole('button', {name: 'GUIDE'}).click();
    await page.waitForSelector('.toc-guide .toc-link');

    await expect(page.locator('.toc-guide .toc-link', {hasText: 'Setup'})).toBeVisible();
    await expect(page.locator('.toc-guide .toc-link', {hasText: 'Navigation'})).toBeVisible();
    await expect(page.locator('.toc-readme')).toBeHidden();
  });

  test('internal links switch to the target section', async ({page}) => {
    await page.getByRole('link', {name: /usage guide/i}).click();
    await expect(page.locator('section#guide')).toBeVisible();
    await expect(page.getByRole('heading', {name: 'Usage Guide'})).toBeVisible();
  });

  test('TOC links navigate within the current section, not across sections', async ({page}) => {
    // Navigate to GUIDE section
    await page.getByRole('button', {name: 'GUIDE'}).click();
    await expect(page.locator('section#guide')).toBeVisible();

    // Click the "Deep Dive" TOC link in GUIDE section
    const deepDiveTocLink = page.locator('.toc-guide .toc-link', {hasText: 'Deep Dive'});
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

  test('desktop: burger menu not shown, navigation visible by default', async ({page}) => {
    await page.setViewportSize({width: 1024, height: 768});

    const burgerButton = page.locator('button[aria-label="Toggle navigation"]');
    const navigationContainer = page.locator('nav#main-nav').locator('..');

    // Burger button should not be visible on desktop
    await expect(burgerButton).toBeHidden();

    // Navigation should be visible by default
    await expect(navigationContainer).toBeVisible();
    await expect(page.getByRole('button', {name: 'README'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'GUIDE'})).toBeVisible();
  });

  test('mobile: burger menu button is visible', async ({page}) => {
    await page.setViewportSize({width: 375, height: 667});

    const burgerButton = page.locator('button[aria-label="Toggle navigation"]');

    // Burger button should be visible on mobile
    await expect(burgerButton).toBeVisible();
  });

  test('mobile: menu hidden by default, toggles on burger click', async ({page}) => {
    await page.setViewportSize({width: 375, height: 667});

    const burgerButton = page.locator('button[aria-label="Toggle navigation"]');
    const navigationContainer = page.locator('nav#main-nav').locator('..');

    // Navigation should be hidden by default on mobile
    await expect(navigationContainer).toBeHidden();

    // Click burger to open menu
    await burgerButton.click();
    await expect(navigationContainer).toBeVisible();

    // Click burger again to close menu
    await burgerButton.click();
    await expect(navigationContainer).toBeHidden();
  });

  test('mobile: menu closes after section link click, burger resets', async ({page}) => {
    await page.setViewportSize({width: 375, height: 667});

    const burgerButton = page.locator('button[aria-label="Toggle navigation"]');
    const navigationContainer = page.locator('nav#main-nav').locator('..');
    const guideTab = page.getByRole('button', {name: 'GUIDE'});

    // Open menu
    await burgerButton.click();
    await expect(navigationContainer).toBeVisible();

    // Click on GUIDE section link
    await guideTab.click();

    // Menu should close automatically
    await expect(navigationContainer).toBeHidden();

    // GUIDE section should be active and visible
    await expect(page.locator('section#guide')).toBeVisible();
    await expect(page.locator('section#readme')).toBeHidden();

    // Burger should be in closed state (can be clicked to open again)
    await expect(burgerButton).toBeVisible();

    // Reopen menu to verify GUIDE is still active
    await burgerButton.click();
    await expect(navigationContainer).toBeVisible();
    await expect(guideTab).toHaveClass(/font-semibold/);
  });

})
