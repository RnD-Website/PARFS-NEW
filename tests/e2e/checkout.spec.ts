import { expect, test } from "@playwright/test";
import { addAeroRunnerToCart, fillCheckout, uniqueEmail } from "./helpers";

test("guest checkout with cash on delivery, then track the order", async ({ page }) => {
  const email = uniqueEmail("cod");
  await addAeroRunnerToCart(page, "41");
  await page.goto("/checkout");
  await fillCheckout(page, email);
  await page.getByRole("button", { name: /Place order/ }).click();
  await expect(page.getByRole("heading", { name: /Thank you, Test!/ })).toBeVisible();
  const orderNumber = (await page.getByText(/GAS-[A-Z0-9]{6}/).first().textContent())!.match(/GAS-[A-Z0-9]{6}/)![0];
  await expect(page.getByText("Confirmed").first()).toBeVisible();

  // Cart is cleared after ordering.
  await page.goto("/cart");
  await expect(page.getByRole("heading", { level: 1, name: "Your cart is empty" })).toBeVisible();

  // Guest tracking with order number + email.
  await page.goto("/track-order");
  await page.getByLabel("Order number").fill(orderNumber);
  await page.getByLabel("Email used at checkout").fill(email);
  await page.getByRole("button", { name: "Track order" }).click();
  await expect(page.getByRole("heading", { name: `Order ${orderNumber}` })).toBeVisible();
  await expect(page.locator("#main").getByText("Cash on delivery")).toBeVisible();
});

test("tracking refuses the wrong email", async ({ page }) => {
  await page.goto("/track-order");
  await page.getByLabel("Order number").fill("GAS-ZZZZZZ");
  await page.getByLabel("Email used at checkout").fill("nobody@example.com");
  await page.getByRole("button", { name: "Track order" }).click();
  await expect(page.locator("#main").getByRole("alert")).toContainText("couldn't find");
});

test("online payment (test mode) succeeds and marks the order paid", async ({ page }) => {
  await addAeroRunnerToCart(page, "43");
  await page.goto("/checkout");
  await fillCheckout(page, uniqueEmail("bkash"), "bKash");
  await page.getByRole("button", { name: /^Pay / }).click();
  await expect(page.getByRole("heading", { name: /Simulated bKash payment/ })).toBeVisible();
  await page.getByRole("button", { name: "Simulate successful payment" }).click();
  await expect(page.getByRole("heading", { name: /Thank you/ })).toBeVisible();
  await expect(page.getByText("Paid", { exact: true })).toBeVisible();
});

test("failed online payment keeps the cart and cancels the order", async ({ page }) => {
  await addAeroRunnerToCart(page, "44");
  await page.goto("/checkout");
  await fillCheckout(page, uniqueEmail("fail"), "Credit / debit card");
  await page.getByRole("button", { name: /^Pay / }).click();
  await page.getByRole("button", { name: "Simulate failed payment" }).click();
  await expect(page.getByRole("heading", { name: "Payment didn’t go through" })).toBeVisible();
  await page.getByRole("link", { name: "Try again" }).click();
  await expect(page.getByText("Aero Runner X Sneaker").first()).toBeVisible();
});

test("checkout validates required fields", async ({ page }) => {
  await addAeroRunnerToCart(page, "39");
  await page.goto("/checkout");
  await page.getByRole("button", { name: /Place order/ }).click();
  await expect(page.getByText("Enter a valid email address")).toBeVisible();
  await expect(page.getByText(/valid Bangladeshi mobile number/)).toBeVisible();
  await expect(page.getByText("Select your district")).toBeVisible();
});
