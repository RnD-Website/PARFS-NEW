import { expect, test } from "@playwright/test";
import { addAeroRunnerToCart } from "./helpers";

test("size is required before adding a sized product", async ({ page }) => {
  await page.goto("/products/aero-runner-x");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.locator("#main").getByRole("alert")).toContainText("Please choose a size");
});

test("add to cart, change quantity, remove", async ({ page }) => {
  await addAeroRunnerToCart(page);
  await page.goto("/cart");
  await expect(page.getByRole("heading", { level: 1, name: "Cart (1)" })).toBeVisible();
  await expect(page.getByText("Volt Orange / 42")).toBeVisible();
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Cart (2)" })).toBeVisible();
  await expect(page.getByText("৳30,960").first()).toBeVisible();
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Your cart is empty" })).toBeVisible();
});

test("quick add from a product card opens the cart drawer", async ({ page }) => {
  await page.goto("/shop/beauty");
  await page.getByRole("button", { name: "Add Glow Ritual Serum Set to cart" }).click();
  const drawer = page.getByRole("dialog", { name: /Your cart \(1\)/ });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText("Glow Ritual Serum Set")).toBeVisible();
});

test("wishlist saves products on this device", async ({ page }) => {
  await page.goto("/shop/home-living");
  await page.getByRole("button", { name: "Save Cocoa Lounge Chair to wishlist" }).click();
  await page.goto("/wishlist");
  await expect(page.getByRole("link", { name: "Cocoa Lounge Chair" })).toBeVisible();
});
