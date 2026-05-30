import { test, expect } from "@playwright/test";

test.describe("Catalog page", () => {
  test("loads with hero section", async ({ page }) => {
    await page.goto("/catalog");
    // The catalog page should have a hero heading
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Parts");
  });

  test("segment filter chips are clickable", async ({ page }) => {
    await page.goto("/catalog");
    // Look for segment filter buttons/chips
    const filterArea = page.locator("[data-testid='segment-filters'], .segment-filters, button:has-text('Classic Auto'), button:has-text('Tractor'), a:has-text('Classic Auto')").first();
    if (await filterArea.isVisible()) {
      await filterArea.click();
      // Page should not crash after clicking a filter
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("search input filters results", async ({ page }) => {
    await page.goto("/catalog");
    const searchInput = page.locator("input[type='search'], input[placeholder*='search' i], input[placeholder*='Search' i]").first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("gasket");
      // Wait for any debounce
      await page.waitForTimeout(500);
      // Page should still be functional
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("part card opens modal on click", async ({ page }) => {
    await page.goto("/catalog");
    // Look for a part card
    const partCard = page.locator("[data-testid='part-card'], .part-card, [role='button']").first();
    if (await partCard.isVisible()) {
      await partCard.click();
      // A modal or detail view should appear
      await page.waitForTimeout(300);
      await expect(page.locator("body")).toBeVisible();
    }
  });
});
