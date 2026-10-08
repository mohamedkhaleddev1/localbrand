import { test, expect } from "@playwright/test";
import { mockApi, openStore, product } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
  await openStore(page);
});

test("customer can place a cash-on-delivery order", async ({ page }) => {
  await page.getByRole("button", { name: "SHOP", exact: true }).click();
  await page.locator(".shop-grid .pic").click();
  await page.getByRole("button", { name: /ADD TO BAG/ }).click();
  await page.getByRole("button", { name: "Cart" }).click();
  await page.getByRole("button", { name: /CHECKOUT/ }).click();

  await page.getByPlaceholder("EMAIL ADDRESS").fill("buyer@example.com");
  await page.getByPlaceholder("FIRST NAME").fill("Buyer");
  await page.getByPlaceholder("LAST NAME").fill("Test");
  await page.getByPlaceholder("PHONE NUMBER (+20)").fill("01000000000");
  await page.locator('select[name="governorate"]').selectOption("GIZA");
  await page.getByPlaceholder("AREA / DISTRICT").fill("Dokki");
  await page.getByPlaceholder("STREET, BUILDING, FLOOR, APARTMENT").fill("1 Test Street");
  await page.getByRole("button", { name: /PLACE ORDER/ }).click();

  await expect(page.getByRole("heading", { name: "YOUR ORDER WAS PLACED SUCCESSFULLY" })).toBeVisible();
  await expect(page.getByText(/#4242/)).toBeVisible();
});

test("contact form submits and reports success", async ({ page }) => {
  await page.locator(".menu-trigger").click();
  await page.locator("header").getByRole("button", { name: "CONTACT US" }).click();
  await page.getByLabel("FULL NAME *").fill("Test User");
  await page.getByLabel("EMAIL *").fill("test@example.com");
  await page.getByLabel("SUBJECT *").selectOption({ label: "PRODUCT QUESTION" });
  await page.getByLabel("MESSAGE *").fill("Is this item available?");
  await page.getByRole("button", { name: "SEND MESSAGE" }).click();
  await expect(page.getByRole("status")).toHaveText("MESSAGE SENT SUCCESSFULLY.");
});

test("footer opens privacy policy", async ({ page }) => {
  await page.getByRole("button", { name: "PRIVACY POLICY" }).click();
  await expect(page.getByRole("heading", { name: "PRIVACY POLICY" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "PAYMENTS" })).toBeVisible();
});
