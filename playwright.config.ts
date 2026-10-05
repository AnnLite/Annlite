import { defineConfig, devices } from "@playwright/test";

const desktopViewports = [
  { name: "1366", width: 1366, height: 768 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
];
const mobileViewports = [
  { name: "375", width: 375, height: 812 },
  { name: "390", width: 390, height: 844 },
  { name: "412", width: 412, height: 915 },
];
const tabletViewports = [
  { name: "768", width: 768, height: 1024 },
  { name: "820", width: 820, height: 1180 },
  { name: "1024", width: 1024, height: 1366 },
];

const browserProject = (name: string, browserName: "chromium" | "firefox" | "webkit", viewport: { width: number; height: number }, options: object = {}) => ({
  name,
  use: { ...options, browserName, viewport },
});

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  timeout: 90_000,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  outputDir: "test-results",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    serviceWorkers: "block",
  },
  projects: [
    ...desktopViewports.map(({ name, width, height }) => browserProject(`chromium-desktop-${name}`, "chromium", { width, height })),
    browserProject("firefox-desktop-1440", "firefox", { width: 1440, height: 900 }),
    browserProject("webkit-desktop-1440", "webkit", { width: 1440, height: 900 }),
    ...mobileViewports.flatMap(({ name, width, height }) => [
      browserProject(`chromium-mobile-${name}`, "chromium", { width, height }, { ...devices["Pixel 7"], isMobile: true, hasTouch: true }),
      browserProject(`webkit-mobile-${name}`, "webkit", { width, height }, { ...devices["iPhone 13"], isMobile: true, hasTouch: true }),
    ]),
    ...tabletViewports.flatMap(({ name, width, height }) => [
      browserProject(`chromium-tablet-${name}`, "chromium", { width, height }, { ...devices["iPad (gen 7)"], isMobile: true, hasTouch: true }),
      browserProject(`webkit-tablet-${name}`, "webkit", { width, height }, { ...devices["iPad (gen 7)"], isMobile: true, hasTouch: true }),
    ]),
  ],
  webServer: {
    command: "corepack pnpm --dir apps/web exec vite --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});