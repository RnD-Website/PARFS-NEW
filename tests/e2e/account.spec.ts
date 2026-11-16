import { expect, test } from "@playwright/test";
import { addAeroRunnerToCart, uniqueEmail } from "./helpers";

test("register, save an address, order, sign out and sign back in", async ({ page }) => {
  const email = uniqueEmail("acct");
  await page.goto("/account/register");
  await page.getByLabel("Full name").fill("Nadia Rahman");
  await page.getByLabel("Email").fill(email);
  await page.locator('input[name="password"]').fill("secret123");
  await page.locator('input[name="confirmPassword"]').fill("secret123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Hi, Nadia" })).toBeVisible();

  // Address book
  await page.getByRole("navigation", { name: "Account" }).getByRole("link", { name: "Addresses" }).click();
  await page.getByLabel("Full name").fill("Nadia Rahman");
  await page.getByLabel("Mobile number").fill("01812345678");
  await page.getByLabel("Street address").fill("Flat 3B, 22 Lake Road");
  await page.getByLabel("City / upazila").fill("Chattogram");
  await page.getByLabel("District").selectOption("Chattogram");
  await page.getByRole("button", { name: "Save address" }).click();
  await expect(page.getByText("Flat 3B, 22 Lake Road")).toBeVisible();

  // Checkout prefilled from the account
  await addAeroRunnerToCart(page, "40");
  await page.goto("/checkout");
  await expect(page.getByLabel("Email")).toHaveValue(email);
  await expect(page.getByLabel("Street address")).toHaveValue("Flat 3B, 22 Lake Road");
  await page.getByLabel("Mobile number").fill("01812345678");
  await page.getByRole("button", { name: /Place order/ }).click();
  await expect(page.getByRole("heading", { name: /Thank you, Nadia!/ })).toBeVisible();

  // Order history
  await page.goto("/account/orders");
  await expect(page.getByText(/GAS-[A-Z0-9]{6}/).first()).toBeVisible();

  // Sign out / in
  await page.goto("/account");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL("/");
  await page.goto("/account");
  await expect(page).toHaveURL(/\/account\/login/);
  await page.getByLabel("Email").fill(email);
  await page.locator('input[name="password"]').fill("wrongpass1");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator("#main").getByRole("alert")).toContainText("incorrect");
  await page.locator('input[name="password"]').fill("secret123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Hi, Nadia" })).toBeVisible();
});

test("forgot password never reveals whether an email exists", async ({ page }) => {
  await page.goto("/account/forgot-password");
  await page.getByLabel("Email").fill("no-such-user@example.com");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByText(/If an account exists/)).toBeVisible();
});
