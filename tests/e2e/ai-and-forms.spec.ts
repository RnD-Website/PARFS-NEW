import { expect, test } from "@playwright/test";
import { uniqueEmail } from "./helpers";

test("GASENOS AI recommends real products and adds one to the cart", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Ask GASENOS AI" }).last().click();
  const panel = page.getByRole("dialog", { name: "GASENOS AI shopping assistant" });
  await expect(panel).toBeVisible();
  await panel.getByLabel("Message GASENOS AI").fill("Running shoes under ৳18,000, I'm EU 42");
  await panel.getByRole("button", { name: "Send" }).click();
  await expect(panel.getByText(/Top pick/)).toBeVisible();
  await expect(panel.getByRole("link", { name: /Aero Runner X Sneaker · EU 42/ })).toBeVisible();
  await panel.getByRole("button", { name: "Add Aero Runner X Sneaker to cart" }).click();
  await expect(page.getByRole("dialog", { name: /Your cart \(1\)/ })).toBeVisible();
});

test("AI prompt chips open the assistant with the prompt", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Best earbuds for the gym" }).first().click();
  const panel = page.getByRole("dialog", { name: "GASENOS AI shopping assistant" });
  await expect(panel.getByText("Best earbuds for the gym")).toBeVisible();
  await expect(panel.getByRole("link", { name: /Pulse Buds Pro/ })).toBeVisible();
});

test("AI answers policy questions", async ({ page }) => {
  await page.goto("/assistant");
  await page.getByLabel("Message GASENOS AI").fill("How long does delivery take?");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText(/2–4 working days/).last()).toBeVisible();
});

test("newsletter subscription", async ({ page }) => {
  await page.goto("/");
  const form = page.locator("section", { has: page.getByRole("heading", { name: /Join the list/ }) });
  await form.getByLabel("Email address").fill(uniqueEmail("nl"));
  await form.getByRole("button", { name: "Subscribe" }).click();
  await expect(form.getByText(/Tick the box|tick the box/i)).toBeVisible();
  await form.getByText("I'd like to hear about deals and new arrivals").click();
  await form.getByRole("button", { name: "Subscribe" }).click();
  await expect(form.getByText("You're on the list!")).toBeVisible();
});

test("contact form sends a message", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Name").fill("Test Person");
  await page.getByLabel("Email").fill(uniqueEmail("contact"));
  await page.getByLabel("Subject").fill("Question about delivery");
  await page.getByLabel("Message").fill("Do you deliver to Sylhet on weekends?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Message sent")).toBeVisible();
});
