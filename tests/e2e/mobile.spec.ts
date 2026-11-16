import { expect, test } from "@playwright/test";

test("mobile menu, search and tab bar work", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.getByRole("dialog", { name: "Menu" });
  await menu.getByRole("link", { name: "Deals" }).click();
  await expect(page).toHaveURL(/\/deals/);
  await expect(page.getByRole("heading", { level: 1, name: "Deals" })).toBeVisible();

  await page.getByRole("button", { name: "Search or ask GASENOS AI" }).click();
  await page.getByRole("searchbox").fill("speaker");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/search\?q=speaker/);
  await expect(page.getByRole("link", { name: "Halo Bluetooth Speaker" }).first()).toBeVisible();

  await page.getByRole("navigation", { name: "Quick navigation" }).getByRole("link", { name: "Shop" }).click();
  await expect(page).toHaveURL(/\/shop$/);
});

test("mobile filters open as a bottom sheet", async ({ page }) => {
  await page.goto("/shop");
  await page.getByRole("button", { name: "Filters" }).click();
  const sheet = page.getByRole("dialog", { name: "Filters" });
  await sheet.getByRole("link", { name: /^Audio/ }).click();
  await expect(page).toHaveURL(/\/shop\/audio/);
});

test("no horizontal scrolling on key pages", async ({ page }) => {
  for (const path of ["/", "/shop", "/products/aero-runner-x", "/checkout", "/account/login"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, path).toBeLessThanOrEqual(1);
  }
});
