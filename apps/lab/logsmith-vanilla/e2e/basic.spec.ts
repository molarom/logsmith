import { test, expect } from "@playwright/test";

test("loads and filters", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "LogSmith (Vanilla)" })).toBeVisible();
  const input = page.getByPlaceholder("Filter (e.g. ERROR, user:123)");
  await input.fill("ERROR");
  // rows render virtually; check some content exists after filter
  const metrics = page.locator("#metrics");
  await expect(metrics).toBeVisible();
});
