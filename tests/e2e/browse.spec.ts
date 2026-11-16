import { expect, test } from "@playwright/test";

test("homepage shows the key sections from the design", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /Everything you love/ })).toBeVisible();
  for (const name of ["Find your next favourite", "Shop smarter with your personal AI assistant.", "Best sellers this week", "The receipts don’t lie.", /Frequently asked/, /best quality/, /Join the list/]) {
    await expect(page.getByRole("heading", { name })).toBeVisible();
  }
  await expect(page.getByText("GASENOS AI").first()).toBeVisible();
  await expect(page.getByText(/BRAND/)).toHaveCount(0);
});

test("best-seller tabs filter by category", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("section", { has: page.getByRole("heading", { name: "Best sellers this week" }) });
  await section.getByRole("button", { name: "Beauty", exact: true }).click();
  await expect(section.getByRole("article")).toHaveCount(1);
  await expect(section.getByText("Glow Ritual Serum Set")).toBeVisible();
});

test("shop → category → product page", async ({ page }) => {
  await page.goto("/shop");
  await expect(page.getByText("10 products").first()).toBeVisible();
  await page.getByRole("link", { name: /^Footwear/ }).first().click();
  await expect(page).toHaveURL(/\/shop\/footwear/);
  await expect(page.getByRole("heading", { level: 1, name: "Footwear" })).toBeVisible();
  await page.getByRole("link", { name: "Cloud Stride 2" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Cloud Stride 2" })).toBeVisible();
});

test("price filter and sort update the listing", async ({ page }) => {
  await page.goto("/shop");
  await page.getByLabel("Minimum price in taka").fill("20000");
  await page.getByRole("button", { name: "Apply price" }).click();
  await expect(page).toHaveURL(/min=20000/);
  await expect(page.getByText("3 products").first()).toBeVisible();
  await page.getByLabel("Sort products").selectOption("price-desc");
  await expect(page).toHaveURL(/sort=price-desc/);
  await expect(page.getByRole("article").first()).toContainText("Cocoa Lounge Chair");
});

test("keyword search finds products", async ({ page }) => {
  await page.goto("/search?q=headphones");
  await expect(page.getByRole("heading", { name: /matching product/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Studio Max Headphones" }).first()).toBeVisible();
});

test("unknown pages return the branded 404", async ({ page }) => {
  const res = await page.goto("/products/does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "This page wandered off." })).toBeVisible();
});
