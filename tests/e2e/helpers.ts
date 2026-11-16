import { expect, type Page } from "@playwright/test";

export const uniqueEmail = (tag: string) => `e2e-${tag}-${Date.now()}-${Math.floor(Math.random() * 1e4)}@example.com`;

export async function addAeroRunnerToCart(page: Page, size = "42") {
  await page.goto("/products/aero-runner-x");
  await page.getByRole("button", { name: `Size ${size}`, exact: true }).click();
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByRole("dialog", { name: /Your cart/ })).toBeVisible();
  await page.keyboard.press("Escape");
}

export async function fillCheckout(page: Page, email: string, payment: "Cash on delivery" | "bKash" | "Nagad" | "Credit / debit card" = "Cash on delivery") {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mobile number").fill("01712345678");
  await page.getByLabel("Full name").fill("Test Shopper");
  await page.getByLabel("Street address").fill("House 12, Road 5");
  await page.getByLabel("City / upazila").fill("Dhaka");
  await page.getByLabel("District").selectOption("Dhaka");
  await page.getByRole("radio", { name: new RegExp(payment) }).check();
}
