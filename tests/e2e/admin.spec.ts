import { test, expect } from "@playwright/test";
import { mockApi, product } from "./fixtures";

test("admin rejects invalid credentials and accepts valid login", async ({ page }) => {
  await mockApi(page);
  await page.goto("/admin");
  await page.getByLabel(/USERNAME/i).fill("wrong");
  await page.getByLabel(/PASSWORD/i).fill("wrong");
  await page.getByRole("button", { name: "SIGN IN" }).click();
  await expect(page.getByText("Invalid credentials")).toBeVisible();

  await page.getByLabel(/USERNAME/i).fill("admin");
  await page.getByLabel(/PASSWORD/i).fill("secret");
  await page.getByRole("button", { name: "SIGN IN" }).click();
  await expect(page.getByText("GOOD MORNING, YOUSSEF.")).toBeVisible();
});

test("authenticated admin can navigate every management section", async ({ page }) => {
  await mockApi(page, { authenticated: true });
  await page.goto("/admin");
  await expect(page.getByText("GOOD MORNING, YOUSSEF.")).toBeVisible();
  await expect(page.getByText(product.name).first()).toBeVisible();

  for (const tab of ["PRODUCTS", "ORDERS", "CUSTOMERS", "COLLECTIONS", "CATEGORIES", "DELIVERY FEES", "DISCOUNTS", "HOMEPAGE", "SETTINGS"]) {
    await page.locator(".admin > aside").getByRole("button", { name: new RegExp(`${tab}$`) }).click();
    await expect(page.locator("section header h1")).toHaveText(tab);
  }

  await page.locator(".admin > aside").getByRole("button", { name: /PRODUCTS$/ }).click();
  await page.getByRole("button", { name: /ADD PRODUCT/ }).first().click();
  await expect(page.getByRole("heading", { name: "ADD NEW PRODUCT" })).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();

  await page.getByRole("button", { name: "LOG OUT" }).click();
  await expect(page.getByRole("button", { name: "SIGN IN" })).toBeVisible();
});
