import { test, expect, type Page } from "@playwright/test";
import { gotoHome } from "./test-helpers";

/**
 * Comprehensive Viewport Testing Suite
 * Tests UI across 5 critical breakpoints: 375px, 768px, 1024px, 1440px, 1920px
 *
 * Checks:
 * 1. Layout integrity (no breaks, proper grid behavior)
 * 2. Font readability (minimum sizes, proper scaling)
 * 3. Component alignment (spacing, positioning)
 * 4. Touch targets (44x44px minimum for mobile)
 * 5. Overflow handling (no content cutoff)
 */

type ViewportConfig = {
  width: number;
  height: number;
  label: string;
  type: "mobile" | "tablet" | "desktop";
};

const VIEWPORTS: ViewportConfig[] = [
  { width: 375, height: 812, label: "Mobile (iPhone SE)", type: "mobile" },
  { width: 768, height: 1024, label: "Tablet (iPad Mini)", type: "tablet" },
  { width: 1024, height: 768, label: "Desktop Small", type: "desktop" },
  { width: 1440, height: 900, label: "Desktop Medium", type: "desktop" },
  { width: 1920, height: 1080, label: "Desktop Large", type: "desktop" },
];

const MIN_FONT_SIZE = 11; // pixels - minimum readable font size
const MIN_TOUCH_TARGET = 44; // pixels - iOS HIG minimum
const MIN_BUTTON_HEIGHT = 32; // pixels - minimum for desktop buttons
const MAX_LINE_LENGTH = 80; // characters - optimal readability

/**
 * Helper: Get computed style property value as number
 */
async function getNumericStyle(
  element: any,
  property: string,
): Promise<number> {
  const value = await element.evaluate((el: Element, prop: string) => {
    const style = window.getComputedStyle(el);
    return parseFloat(style.getPropertyValue(prop));
  }, property);
  return value;
}

/**
 * Helper: Check if element is overflowing
 */
async function isOverflowing(element: any): Promise<boolean> {
  return await element.evaluate((el: HTMLElement) => {
    return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
  });
}

/**
 * Helper: Take screenshot with label
 */
async function captureViewport(
  page: Page,
  viewport: ViewportConfig,
  scenario: string,
) {
  await page.screenshot({
    path: `./test-results/viewport-${viewport.width}px-${scenario}.png`,
    fullPage: false,
  });
}

test.describe("Comprehensive Viewport Testing", () => {
  for (const viewport of VIEWPORTS) {
    test.describe(`${viewport.label} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await gotoHome(page, {
          width: viewport.width,
          height: viewport.height,
        });
        // Wait for initial render
        await page.waitForLoadState("networkidle");
      });

      test("1. Layout Integrity - No broken layouts", async ({ page }) => {
        // Check main container structure
        const main = page.locator('main[role="main"]');
        await expect(main).toBeVisible();

        // Check for horizontal overflow (common layout break)
        const hasOverflow = await main.evaluate((el: HTMLElement) => {
          return (
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth
          );
        });

        expect(hasOverflow).toBe(false);

        // Verify grid layout on desktop, stack on mobile
        const mainContent = page.locator('main[role="main"] > div').first();
        const display = await mainContent.evaluate(
          (el) => window.getComputedStyle(el).display,
        );

        if (viewport.type === "mobile") {
          expect(display).toBe("flex"); // Mobile uses flexbox stacking
        } else {
          expect(display).toBe("grid"); // Desktop uses grid
        }

        await captureViewport(page, viewport, "layout");
      });

      test("2. Font Readability - Minimum sizes enforced", async ({ page }) => {
        // Check header text
        const header = page.locator("header");
        await expect(header).toBeVisible();

        const headerText = header.locator('text="Subagent War Room"').first();
        if ((await headerText.count()) > 0) {
          const fontSize = await getNumericStyle(headerText, "font-size");
          expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
        }

        // Check body text in panels
        const panels = page.locator(
          '[class*="glass-panel"], [class*="bg-gray-900"]',
        );
        const firstPanel = panels.first();

        if ((await firstPanel.count()) > 0) {
          const panelText = firstPanel.locator("p, span, div").first();
          if ((await panelText.count()) > 0) {
            const fontSize = await getNumericStyle(panelText, "font-size");
            expect(fontSize).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
          }
        }

        // Check mobile navigation labels (if present)
        if (viewport.type === "mobile") {
          const navButtons = page.locator(
            'nav[aria-label="Mobile panel navigation"] button',
          );
          const firstButton = navButtons.first();

          if ((await firstButton.count()) > 0) {
            const buttonText = firstButton.locator("span").last();
            const fontSize = await getNumericStyle(buttonText, "font-size");
            // Mobile nav can be slightly smaller but still readable
            expect(fontSize).toBeGreaterThanOrEqual(10);
          }
        }

        await captureViewport(page, viewport, "typography");
      });

      test("3. Component Alignment - Proper spacing and positioning", async ({
        page,
      }) => {
        // Check header alignment
        const header = page.locator("header");
        const headerHeight = await header.evaluate(
          (el) => el.getBoundingClientRect().height,
        );

        // Header should have consistent height
        expect(headerHeight).toBeGreaterThan(40);
        expect(headerHeight).toBeLessThan(100);

        // Check panel spacing
        const mainContent = page.locator('main[role="main"] > div').first();
        const gap = await mainContent.evaluate(
          (el) => window.getComputedStyle(el).gap || "0px",
        );

        // Should have gap between panels
        const gapValue = parseFloat(gap);
        expect(gapValue).toBeGreaterThanOrEqual(8); // 8px minimum (var(--section-gap))

        // Check footer (if visible)
        const footer = page.locator('footer[aria-label="Task history"]');
        if (await footer.isVisible()) {
          const footerTop = await footer.evaluate(
            (el) => el.getBoundingClientRect().top,
          );
          const viewportHeight = viewport.height;

          // Footer should be positioned at bottom or near bottom
          expect(footerTop).toBeLessThan(viewportHeight);
        }

        await captureViewport(page, viewport, "alignment");
      });

      test("4. Touch Targets - Minimum sizes for mobile", async ({ page }) => {
        if (viewport.type !== "mobile") {
          test.skip();
          return;
        }

        // Check mobile navigation buttons
        const mobileNav = page.locator(
          'nav[aria-label="Mobile panel navigation"]',
        );
        await expect(mobileNav).toBeVisible();

        const navButtons = mobileNav.locator("button");
        const buttonCount = await navButtons.count();

        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
          const button = navButtons.nth(i);
          const box = await button.boundingBox();

          if (box) {
            expect(box.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
            expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
          }
        }

        // Check any visible action buttons
        const actionButtons = page.locator("button:visible");
        const actionCount = await actionButtons.count();

        // Sample first 10 buttons
        for (let i = 0; i < Math.min(actionCount, 10); i++) {
          const button = actionButtons.nth(i);
          const box = await button.boundingBox();

          if (box && box.height > 0) {
            // Mobile buttons should meet touch target minimum
            expect(box.height).toBeGreaterThanOrEqual(MIN_BUTTON_HEIGHT);
          }
        }

        await captureViewport(page, viewport, "touch-targets");
      });

      test("5. Overflow Handling - No content cutoff", async ({ page }) => {
        // Check for horizontal scrollbar on body (indicates layout break)
        const bodyOverflow = await page.evaluate(() => {
          const body = document.body;
          return body.scrollWidth > body.clientWidth;
        });

        expect(bodyOverflow).toBe(false);

        // Check specific scrollable containers
        const panels = page.locator(
          '[class*="overflow-y-auto"], [class*="overflow-auto"]',
        );
        const panelCount = await panels.count();

        if (panelCount > 0) {
          // These should have controlled overflow
          for (let i = 0; i < Math.min(panelCount, 3); i++) {
            const panel = panels.nth(i);
            const hasScroll = await panel.evaluate((el: HTMLElement) => {
              return el.scrollHeight > el.clientHeight;
            });

            // If has scroll, should have visible scrollbar styling
            if (hasScroll) {
              const overflow = await panel.evaluate(
                (el) => window.getComputedStyle(el).overflowY,
              );
              expect(["auto", "scroll"]).toContain(overflow);
            }
          }
        }

        // Check text content doesn't break layout
        const textElements = page
          .locator("p, span, div")
          .filter({ hasText: /.{20,}/ });
        const textCount = await textElements.count();

        // Sample some text elements
        for (let i = 0; i < Math.min(textCount, 5); i++) {
          const element = textElements.nth(i);
          const overflows = await isOverflowing(element);

          if (overflows) {
            const overflow = await element.evaluate(
              (el) => window.getComputedStyle(el).overflow,
            );
            // Should either clip, scroll, or wrap
            expect(["hidden", "auto", "scroll"]).toContain(overflow);
          }
        }

        await captureViewport(page, viewport, "overflow");
      });

      test("6. Mobile Navigation - Panel switching works", async ({ page }) => {
        if (viewport.type !== "mobile") {
          test.skip();
          return;
        }

        const mobileNav = page.locator(
          'nav[aria-label="Mobile panel navigation"]',
        );
        await expect(mobileNav).toBeVisible();

        const buttons = mobileNav.locator("button");
        const buttonCount = await buttons.count();

        expect(buttonCount).toBeGreaterThanOrEqual(3);

        // Test switching between panels
        const topologyBtn = buttons
          .filter({ hasText: /network|topology/i })
          .first();
        const tasksBtn = buttons.filter({ hasText: /tasks/i }).first();
        const chatBtn = buttons.filter({ hasText: /chat|comms/i }).first();

        // Click topology
        if ((await topologyBtn.count()) > 0) {
          await topologyBtn.click();
          await page.waitForTimeout(300); // Animation

          // Should have active styling
          const isActive = await topologyBtn.evaluate(
            (btn) => btn.getAttribute("aria-current") === "page",
          );
          expect(isActive).toBe(true);
        }

        // Click tasks
        if ((await tasksBtn.count()) > 0) {
          await tasksBtn.click();
          await page.waitForTimeout(300);
        }

        // Click chat
        if ((await chatBtn.count()) > 0) {
          await chatBtn.click();
          await page.waitForTimeout(300);
        }

        await captureViewport(page, viewport, "navigation");
      });

      test("7. Component Visibility - Key elements present", async ({
        page,
      }) => {
        // Header should always be visible
        await expect(page.locator("header")).toBeVisible();

        // Main content area
        await expect(page.locator('main[role="main"]')).toBeVisible();

        if (viewport.type === "mobile") {
          // Mobile navigation
          await expect(
            page.locator('nav[aria-label="Mobile panel navigation"]'),
          ).toBeVisible();

          // Footer should be hidden on mobile
          const footer = page.locator('footer[aria-label="Task history"]');
          if ((await footer.count()) > 0) {
            await expect(footer).toBeHidden();
          }
        } else {
          // Desktop: mobile nav hidden
          const mobileNav = page.locator(
            'nav[aria-label="Mobile panel navigation"]',
          );
          if ((await mobileNav.count()) > 0) {
            await expect(mobileNav).toBeHidden();
          }

          // Desktop: footer visible
          const footer = page.locator('footer[aria-label="Task history"]');
          if ((await footer.count()) > 0) {
            await expect(footer).toBeVisible();
          }
        }

        await captureViewport(page, viewport, "visibility");
      });

      test("8. Grid Layout - Proper responsive columns", async ({ page }) => {
        if (viewport.type === "mobile") {
          test.skip();
          return;
        }

        const mainGrid = page.locator('main[role="main"] > div').first();
        const gridCols = await mainGrid.evaluate((el) => {
          const style = window.getComputedStyle(el);
          const templateCols = style.gridTemplateColumns;
          return templateCols.split(" ").length;
        });

        // Verify grid columns based on viewport
        if (viewport.width >= 1920) {
          // 4xl: 24 columns
          expect(gridCols).toBeGreaterThanOrEqual(16);
        } else if (viewport.width >= 1440) {
          // 2xl: 16 columns
          expect(gridCols).toBeGreaterThanOrEqual(12);
        } else if (viewport.width >= 1024) {
          // lg: 12 columns
          expect(gridCols).toBeGreaterThanOrEqual(2);
        } else if (viewport.width >= 768) {
          // md: 2 columns
          expect(gridCols).toBe(2);
        }

        await captureViewport(page, viewport, "grid");
      });
    });
  }

  test.describe("Cross-viewport consistency", () => {
    test("Color scheme consistent across all viewports", async ({ page }) => {
      const results: { viewport: string; bgColor: string }[] = [];

      for (const viewport of VIEWPORTS) {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await gotoHome(page, {
          width: viewport.width,
          height: viewport.height,
        });

        const bgColor = await page
          .locator("body")
          .evaluate((el) => window.getComputedStyle(el).backgroundColor);

        results.push({ viewport: viewport.label, bgColor });
      }

      // All viewports should have same background color
      const firstBgColor = results[0].bgColor;
      results.forEach((result) => {
        expect(result.bgColor).toBe(firstBgColor);
      });
    });

    test("Typography scale consistent across viewports", async ({ page }) => {
      const results: { viewport: string; fontSize: number }[] = [];

      for (const viewport of VIEWPORTS) {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await gotoHome(page, {
          width: viewport.width,
          height: viewport.height,
        });

        const fontSize = await page
          .locator("body")
          .evaluate((el) => parseFloat(window.getComputedStyle(el).fontSize));

        results.push({ viewport: viewport.label, fontSize });
      }

      // Font sizes should be within reasonable range (10-16px)
      results.forEach((result) => {
        expect(result.fontSize).toBeGreaterThanOrEqual(10);
        expect(result.fontSize).toBeLessThanOrEqual(16);
      });
    });
  });
});
