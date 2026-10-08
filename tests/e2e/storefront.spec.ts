import { test, expect } from "@playwright/test";
import { mockApi, openStore, product } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
  await openStore(page);
});

test("home, navigation, theme and catalog filtering work", async ({ page }) => {
  await expect(page.getByText("BUILT FOR AUTOMATION.")).toBeVisible();
  await page.getByRole("button", { name: "Use light mode" }).click();
  await expect(page.locator("main")).not.toHaveClass(/dark-mode/);

  await page.getByRole("button", { name: "SHOP", exact: true }).click();
  await expect(page.getByRole("heading", { name: "ALL PRODUCTS" })).toBeVisible();
  await expect(page.getByText(product.name)).toBeVisible();
  await page.locator(".shopbar").getByRole("button", { name: "HOODIES" }).click();
  await expect(page.getByText(product.name)).toBeHidden();
  await page.locator(".shopbar").getByRole("button", { name: "T-SHIRTS" }).click();
  await expect(page.getByText(product.name)).toBeVisible();
});

test("search opens a result and product controls work", async ({ page }) => {
  await page.getByRole("button", { name: "Search" }).click();
  await page.getByPlaceholder("SEARCH PRODUCTS...").fill("Automation");
  await page.locator(".search-result").click();
  await expect(page.getByRole("heading", { name: product.name })).toBeVisible();

  await page.getByRole("button", { name: /SIZE GUIDE/ }).first().click();
  await expect(page.getByText("Relaxed test fit.")).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();

  await page.getByRole("button", { name: /ADD TO BAG/ }).click();
  await expect(page.getByText("Added to your bag")).toBeVisible();
  await page.getByRole("button", { name: /ADD TO WISHLIST/ }).click();
  await page.getByRole("button", { name: "Wishlist" }).click();
  await expect(page.getByText(product.name)).toBeVisible();
});

test("cart quantity, discount and removal work", async ({ page }) => {
  await page.getByRole("button", { name: "SHOP", exact: true }).click();
  await page.locator(".shop-grid .pic").click();
  await page.getByRole("button", { name: /ADD TO BAG/ }).click();
  await page.getByRole("button", { name: "Cart" }).click();
  await expect(page.getByRole("heading", { name: /SHOPPING BAG/ })).toBeVisible();

  await page.getByPlaceholder("ENTER CODE").fill("SAVE10");
  await page.getByRole("button", { name: /APPLY/ }).click();
  await expect(page.getByText("10% discount applied")).toBeVisible();
  await expect(page.getByText(/−80 EGP|-80 EGP/)).toBeVisible();

  await page.getByRole("button", { name: /REMOVE/ }).click();
  await expect(page.getByText("Your bag is empty.")).toBeVisible();
});
