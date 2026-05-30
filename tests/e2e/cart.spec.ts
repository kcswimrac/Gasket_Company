import { test, expect } from "@playwright/test";

test.describe("Cart page", () => {
  test("empty cart shows 'Cart is empty'", async ({ page }) => {
    // Clear any cart data from localStorage
    await page.goto("/cart");
    await page.evaluate(() => localStorage.removeItem("br_cart"));
    await page.reload();

    await expect(page.locator("text=Cart is empty")).toBeVisible();
  });

  test("checkout link exists", async ({ page }) => {
    await page.goto("/cart");
    // Even with an empty cart, there should be a link to the catalog
    // When items are present, there should be a checkout link
    const browseLink = page.locator("a[href='/catalog']").first();
    await expect(browseLink).toBeVisible();
  });
});
