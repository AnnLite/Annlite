import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const criticalRoutes = [
  "/",
  "/bible",
  "/pray",
  "/prayer",
  "/reflections",
  "/learn",
  "/learn/understanding-the-bible",
  "/learn/christianity-for-beginners/beginnings-faith",
  "/charity",
  "/donate",
  "/founder",
  "/contact",
];

const representativeVisualProjects = new Set([
  "chromium-desktop-1440",
  "chromium-mobile-390",
  "chromium-tablet-820",
]);

async function openFromHome(page: Page, href: string) {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Faith for everyday life." })).toBeVisible();
  const contentLink = page.locator(`#main-content a[href="${href}"]`).first();
  const desktopLink = page.locator(`.desktop-nav a[href="${href}"]`);
  if (await contentLink.isVisible()) await contentLink.click();
  else if (await desktopLink.isVisible()) await desktopLink.click();
  else {
    await page.locator(".menu-toggle").click();
    await page.locator(`#mobile-menu a[href="${href}"]`).click();
  }
  await expect(page).toHaveURL(new RegExp(`${href.replace("/", "\\/")}$`));
}

test("homepage loads cleanly, supports navigation, language, menu, and footer", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Faith for everyday life." })).toBeVisible();
  await expect.poll(() => page.locator("img").evaluateAll((images) => images.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
  await expect(page.locator("footer").getByRole("link", { name: "Give" })).toHaveAttribute("href", "/donate");

  await page.getByLabel("Language").selectOption("fr");
  await expect(page.getByRole("heading", { level: 1, name: "La foi au quotidien." })).toBeVisible();
  await page.getByLabel("Langue").selectOption("ht");
  await expect(page.getByRole("heading", { level: 1, name: "Lafwa pou lavi chak jou." })).toBeVisible();
  await expect(page.locator(".header-give")).toHaveText(/Bay/);

  const menuButton = page.locator(".menu-toggle");
  if (await menuButton.isVisible()) {
    await menuButton.click();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#mobile-menu")).toBeVisible();
    await page.locator("#mobile-menu").getByRole("link", { name: "Solidarite" }).click();
    await expect(page).toHaveURL(/\/charity$/);
    await expect(page.locator("#mobile-menu")).toBeHidden();
  }

  expect(pageErrors).toEqual([]);
});

test("keyboard users can reach the skip link and mobile menu controls", async ({ page }) => {
  await page.goto("/");
  await page.locator(".skip-link").focus();
  await expect(page.locator(".skip-link")).toBeFocused();
  await expect(page.locator(".skip-link")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  const menuButton = page.locator(".menu-toggle");
  if (await menuButton.isVisible()) {
    await menuButton.focus();
    await expect(menuButton).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#mobile-menu")).toBeVisible();
  }
});

test("Bible journey searches, opens a passage, tracks history, and handles empty results", async ({ page }) => {
  await openFromHome(page, "/bible");
  await expect(page.getByRole("heading", { level: 1, name: "A quieter way to read" })).toBeVisible();

  const search = page.getByRole("searchbox", { name: "Search this selection" });
  await search.fill("mercy");
  await page.getByRole("button", { name: /Micah 6:8/ }).click();
  await expect(page.locator(".reader-text blockquote")).toContainText("act justly, to love mercy");
  await expect(page.getByRole("heading", { name: "Recently opened" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Micah 6:8", exact: true })).toBeVisible();

  await search.fill("annlite-no-such-scripture");
  await expect(page.locator(".bible-browser").getByRole("heading", { name: "No verses in this small selection match that search." })).toBeVisible();
});

test("prayer journey exposes every category and stores a private entry", async ({ page }) => {
  await openFromHome(page, "/pray");
  await expect(page.getByRole("heading", { level: 1, name: "Take a moment to pray" })).toBeVisible();
  await expect(page.locator(".guided-prayer blockquote")).not.toBeEmpty();

  const category = page.getByLabel("Choose a topic");
  const categories = ["pray.faith", "pray.family", "pray.health", "pray.school", "pray.work", "pray.relationships", "pray.community", "pray.haiti", "pray.world", "pray.gratitude"];
  await expect(category.locator("option")).toHaveCount(categories.length);
  for (const value of categories) await category.selectOption(value);
  await category.selectOption("pray.gratitude");
  await page.getByLabel("Prayer or reflection").fill("A private note of gratitude.");
  await page.getByRole("button", { name: "Save privately" }).click();
  await expect(page.getByRole("status")).toContainText("Saved on this device");
  await expect(page.getByText("A private note of gratitude.")).toBeVisible();
  await expect(page).toHaveURL(/\/pray$/);
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1, name: "Faith for everyday life." })).toBeVisible();
});

test("reflection journey opens cited Scripture and returns through navigation", async ({ page }) => {
  await openFromHome(page, "/reflections");
  const firstReflection = page.locator(".reflection-entry").first();
  await expect(firstReflection.locator("h2")).toBeVisible();
  await expect(firstReflection.locator(".reflection-entry__source")).toContainText("·");
  await firstReflection.getByRole("link", { name: "Read the passage" }).click();
  await expect(page).toHaveURL(/\/bible\?query=/);
  await expect(page.locator(".reader-text blockquote")).toBeVisible();
  await page.goBack();
  await expect(page.locator(".reflection-entry").first()).toBeVisible();
});

test("Learn search and category filters open a course and lesson", async ({ page }) => {
  await openFromHome(page, "/learn");
  const search = page.getByRole("searchbox", { name: "Search courses and lessons" });
  await search.fill("Micah 6:8");
  await expect(page.getByRole("link", { name: "View course: Christian Values" })).toBeVisible();
  await search.clear();
  await expect(search).toHaveValue("");
  await expect(page).not.toHaveURL(/\bq=/);
  await page.getByRole("group", { name: "Filter courses by category" }).getByRole("button", { name: "Prayer" }).click();
  await expect(page.getByRole("heading", { level: 3, name: "How to Pray" }).first()).toBeVisible();
  await page.locator('.learn-results .learn-course-card__action[href="/learn/how-to-pray"]').click();
  await expect(page.getByRole("heading", { level: 1, name: "How to Pray" })).toBeVisible();
  await page.getByRole("link", { name: "Start course" }).click();
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  await expect(page.locator(".learn-reading__content p").first()).not.toBeEmpty();
});

test("Learn quiz scores real answers and course completion reflects completed lessons", async ({ page }) => {
  await page.goto("/learn/christianity-for-beginners/beginnings-faith");
  await expect(page.getByRole("heading", { level: 1, name: "What Christians mean by faith" })).toBeVisible();

  await page.getByRole("radio", { name: "Trust that shapes a way of life" }).check();
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByRole("status")).toContainText("Correct");
  await page.getByRole("button", { name: "Next question" }).click();
  await page.getByRole("radio", { name: /True/ }).check();
  await page.getByRole("button", { name: "Check answer" }).click();
  await page.getByRole("button", { name: "See results" }).click();
  await expect(page.getByRole("heading", { name: "Score: 2/2 (100%)" })).toBeVisible();

  await page.getByRole("button", { name: "Mark lesson as complete" }).click();
  await page.getByRole("link", { name: "Christianity for Beginners" }).first().click();
  await expect(page.locator(".learn-course-score")).toContainText("2/2 (100%)");
  while (await page.getByRole("button", { name: /Mark lesson as complete:/ }).count()) {
    await page.getByRole("button", { name: /Mark lesson as complete:/ }).first().click();
  }
  await expect(page.getByRole("heading", { name: "Course completed" })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Course progress" })).toHaveAttribute("aria-valuenow", "100");
});

test("guest learning progress and bookmarks survive refresh and appear in My Learning", async ({ page }) => {
  await page.goto("/learn/christianity-for-beginners/beginnings-faith");
  await page.getByRole("button", { name: "Bookmark lesson" }).click();
  await page.getByRole("button", { name: "Mark lesson as complete" }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("annlite.learn.progress.v1"))).toContain("beginnings-faith");
  await page.reload();
  await expect(page.getByRole("button", { name: "Completed" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Lesson bookmarked" })).toHaveAttribute("aria-pressed", "true");
  await page.goto("/learn?view=learning");
  await expect(page.getByRole("heading", { level: 1, name: "My Learning" })).toBeVisible();
  await expect(page.getByRole("link", { name: /What Christians mean by faith/ })).toBeVisible();
});

test("charity accurately presents its unavailable campaign and donation data", async ({ page }) => {
  await openFromHome(page, "/charity");
  await expect(page.getByText("Charity projects are being prepared.")).toBeVisible();
  await expect(page.getByText("Donations are not currently being accepted through AnnLite.")).toBeVisible();
  await expect(page.getByText(/Production verification is not connected/)).toBeVisible();
  await expect(page.getByText(/\$\s?\d/)).toHaveCount(0);
  if (await page.locator(".header-give").isVisible()) await page.locator(".header-give").click();
  else {
    await page.locator(".menu-toggle").click();
    await page.locator('#mobile-menu a[href="/donate"]').click();
  }
  await expect(page).toHaveURL(/\/donate$/);
});

test("CeloHT destination is correct and card donation sandbox states are explicit", async ({ page }) => {
  await page.goto("/donate");
  const celoLink = page.getByRole("link", { name: "Donate with CeloHT" });
  await expect(celoLink).toHaveAttribute("href", "https://app.celoht.com/");
  await expect(celoLink).toHaveAttribute("target", "_blank");
  await expect(page.getByRole("button", { name: /CELO|USDm/ })).toHaveCount(0);
  await expect(page.locator(".donation-provider").nth(1).getByText(/This sandbox checkout does not store/)).toBeVisible();
  await expect(page.getByLabel("Card network")).toHaveValue("Visa");
  await expect(page.getByLabel("Card number")).toHaveCount(0);

  const checkout = page.getByRole("button", { name: "Proceed to secure checkout" });
  await checkout.click();
  await expect(page.locator(".checkout-status")).toContainText("pending");
  await page.getByRole("button", { name: "Success" }).click();
  await expect(page.locator(".checkout-status")).toContainText("succeeded");

  await page.reload();
  await checkout.click();
  await page.getByRole("button", { name: "Failure" }).click();
  await expect(page.locator(".checkout-status")).toContainText("failed");

  await page.reload();
  await checkout.click();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.locator(".checkout-status")).toContainText("cancelled");
});

test("founder and contact information are displayed and contact drafts validate locally", async ({ page }) => {
  await openFromHome(page, "/founder");
  await expect(page.getByRole("heading", { level: 1, name: "Berline Britus" })).toBeVisible();
  await expect(page.getByText("Aquin, Southern Department, Haiti")).toBeVisible();
  await expect(page.getByRole("heading", { name: "The Story Behind AnnLite" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "About the Founder" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Skills & Experience" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Faith & Service" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Her Vision for AnnLite" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Contact the Founder" })).toBeVisible();
  await expect(page.locator('a[href="mailto:britusberline46@gmail.com"]').first()).toBeVisible();
  const founderLinkedIn = page.getByRole("link", { name: "Connect with the Founder on LinkedIn" }).first();
  await expect(founderLinkedIn).toHaveAttribute("href", "https://www.linkedin.com/in/britus-berline-86329a441");
  await expect(founderLinkedIn).toHaveAttribute("target", "_blank");
  await expect(founderLinkedIn).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/founder$/);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Berline Britus — Founder of AnnLite/);

  await page.goto("/contact");
  await expect(page.getByText("britusberline46@gmail.com").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Connect with the Founder on LinkedIn" })).toHaveAttribute("href", "https://www.linkedin.com/in/britus-berline-86329a441");
  const name = page.getByLabel("Your name");
  const email = page.getByLabel("Your email address");
  const subject = page.getByLabel("Subject");
  const message = page.getByLabel("Message");
  const submit = page.getByRole("button", { name: "Prepare email" });

  await submit.click();
  await expect(await name.evaluate((element) => (element as HTMLInputElement).validity.valueMissing)).toBe(true);
  await name.focus();
  await page.keyboard.type("E2E Guest");
  await email.fill("not-an-email");
  await subject.fill("Hello");
  await message.fill("A test message");
  await submit.click();
  await expect(await email.evaluate((element) => (element as HTMLInputElement).validity.typeMismatch)).toBe(true);
  await email.fill("guest@example.com");
  await submit.click();
  await expect(page.getByRole("link", { name: "Open your email app" })).toHaveAttribute("href", /^mailto:britusberline46@gmail\.com\?/);
  await expect(page.getByText(/has not been sent by this website/)).toBeVisible();
});

test("supported languages translate navigation, learning, donation, and contact UI", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/");
  const language = page.getByLabel("Language");
  await language.selectOption("fr");
  await expect(page.locator(".header-give")).toContainText("Donner");
  await page.goto("/learn");
  await expect(page.getByRole("heading", { level: 1, name: "Apprendre à votre rythme" })).toBeVisible();
  await page.goto("/donate");
  await expect(page.getByRole("heading", { name: "Donner avec CeloHT" })).toBeVisible();
  await page.goto("/contact");
  await expect(page.getByLabel("Votre nom")).toBeVisible();
  await page.goto("/founder");
  await expect(page.getByRole("heading", { name: "L’histoire derrière AnnLite" })).toBeVisible();
  await expect(page.getByText("Aquin, département du Sud, Haïti")).toBeVisible();

  await page.getByLabel("Langue").selectOption("ht");
  await expect(page.locator(".header-give")).toContainText("Bay");
  await page.goto("/learn");
  await expect(page.getByRole("heading", { level: 1, name: "Aprann nan ritm pa w" })).toBeVisible();
  await page.goto("/donate");
  await expect(page.getByRole("heading", { name: "Bay avèk CeloHT" })).toBeVisible();
  await page.goto("/contact");
  await expect(page.getByLabel("Non ou")).toBeVisible();
  await page.goto("/founder");
  await expect(page.getByRole("heading", { name: "Istwa ki dèyè AnnLite" })).toBeVisible();
  await expect(page.getByText("Aken, Depatman Sid, Ayiti")).toBeVisible();

  const untranslatedKey = /\b(?:page|nav|home|pray|learn|donate|charity|founder|contact)\.[a-z][\w.]*/i;
  for (const route of ["/", "/learn", "/donate", "/contact", "/founder"]) {
    await page.goto(route);
    await expect(page.locator("body")).not.toContainText(untranslatedKey);
  }
});

test("invalid routes and corrupted local learning data fail gracefully", async ({ page }) => {
  await page.goto("/this-route-does-not-exist");
  await expect(page.getByRole("heading", { level: 2, name: "This page is not here yet" })).toBeVisible();
  await page.goto("/admin");
  await expect(page.getByRole("heading", { level: 2, name: "This page is not here yet" })).toBeVisible();

  await page.goto("/learn");
  await page.evaluate(() => localStorage.setItem("annlite.learn.progress.v1", "{"));
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Learn at your own pace" })).toBeVisible();

  await page.context().setOffline(true);
  await expect(page.getByRole("status")).toContainText("You are offline");
  await page.context().setOffline(false);
  await expect(page.getByRole("status")).toHaveCount(0);
});

test("critical routes fit the configured desktop, mobile, and tablet viewport", async ({ page }) => {
  test.setTimeout(90_000);
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  for (const route of criticalRoutes) {
    await page.goto(route);
    await expect(page.getByRole("main").getByRole("heading", { level: 1 }).first(), `${route} should render its primary heading`).toBeVisible();
    const dimensions = await page.evaluate(() => ({ documentWidth: document.documentElement.scrollWidth, viewportWidth: window.innerWidth }));
    expect(dimensions.documentWidth, `${route} has horizontal overflow at ${dimensions.viewportWidth}px`).toBeLessThanOrEqual(dimensions.viewportWidth);
  }
  expect(pageErrors).toEqual([]);
});

test("key routes pass automated WCAG accessibility scans", async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  test.skip(!representativeVisualProjects.has(testInfo.project.name), "Accessibility scans run on one representative desktop, mobile, and tablet viewport.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of ["/", "/bible", "/pray", "/reflections", "/learn", "/learn/understanding-the-bible", "/learn/christianity-for-beginners/beginnings-faith", "/charity", "/donate", "/founder", "/contact"]) {
    await page.goto(route);
    await expect(page.getByRole("main").getByRole("heading", { level: 1 }).first()).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(results.violations, `${route}: ${results.violations.map((violation) => violation.id).join(", ")}`).toEqual([]);
  }
});

test("attach visual review screenshots for critical pages on representative devices", async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  test.skip(!representativeVisualProjects.has(testInfo.project.name), "Screenshots are attached for representative desktop, mobile, and tablet projects.");
  const screenshots = ["/", "/learn", "/learn/understanding-the-bible", "/learn/christianity-for-beginners/beginnings-faith", "/donate", "/charity", "/founder", "/contact"];
  for (const route of screenshots) {
    await page.goto(route);
    await expect(page.getByRole("main").getByRole("heading", { level: 1 }).first()).toBeVisible();
    await testInfo.attach(`visual-${route.replaceAll(/[^a-z0-9]+/gi, "-") || "home"}`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  }
});