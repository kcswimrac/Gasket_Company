import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    // Should have the main heading
    await expect(page.locator("h1")).toBeVisible();
    // Should contain the brand text
    await expect(page.locator("text=Backyard Restoration").first()).toBeVisible();
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/");
    // Check that the nav contains expected links
    const nav = page.locator("header nav, header");
    await expect(nav.locator("a[href='/gaskets']").first()).toBeVisible();
    await expect(nav.locator("a[href='/catalog']").first()).toBeVisible();
  });

  test("'Browse Parts Catalog' button navigates to /catalog", async ({ page }) => {
    await page.goto("/");
    const catalogButton = page.locator("a:has-text('Browse Parts Catalog')").first();
    await expect(catalogButton).toBeVisible();
    await catalogButton.click();
    await expect(page).toHaveURL(/\/catalog/);
  });
});
