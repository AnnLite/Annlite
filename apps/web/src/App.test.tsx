import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, test, vi } from "vitest";
import { t, type Locale } from "./i18n";
import App from "./App";

async function renderAt(path = "/") {
  window.history.replaceState({}, "", path);
  const view = render(<App />);
  await screen.findByRole("navigation", { name: "Main navigation" });
  return view;
}

describe("AnnLite web experience", () => {
  test("primary product copy is translated in all supported locales", () => {
    const keys = ["nav.home", "nav.learn", "nav.pray", "nav.discover", "page.bible.title", "page.pray.title", "page.charity.title", "charity.noPayments", "profile.localOnly"] as const;
    const locales: Locale[] = ["fr", "ht"];

    for (const locale of locales) {
      for (const key of keys) expect(t(locale, key)).not.toBe(t("en", key));
    }
  });

  test("home offers working Bible navigation and has no basic axe violations", async () => {
    const user = userEvent.setup();
    await renderAt();

    expect(screen.getByRole("heading", { level: 1, name: "Faith for everyday life." })).toBeInTheDocument();
    const results = await axe.run(document.body, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    });
    expect(results.violations).toEqual([]);

    await user.click(screen.getByRole("link", { name: "Explore the Bible" }));
    expect(await screen.findByRole("heading", { level: 1, name: "A quieter way to read" })).toBeInTheDocument();
  });

  test("language and theme preferences update the experience", async () => {
    const user = userEvent.setup();
    await renderAt();

    await user.selectOptions(screen.getByRole("combobox", { name: "Language" }), "fr");
    expect(screen.getByRole("heading", { level: 1, name: "La foi au quotidien." })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Passer au thème sombre" }));
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  test("daily journey progress can be toggled without a streak mechanic", async () => {
    const user = userEvent.setup();
    await renderAt();
    const step = screen.getByRole("button", { name: "Read today's verse" });

    await user.click(step);
    expect(step).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("1 of 5 moments")).toBeInTheDocument();
    await user.click(step);
    expect(step).toHaveAttribute("aria-pressed", "false");
  });

  test("local progress updates do not retrigger route-change scrolling", async () => {
    const user = userEvent.setup();
    const scroll = vi.spyOn(window, "scrollTo");
    await renderAt();
    const routeChangeScrolls = scroll.mock.calls.length;

    await user.click(screen.getByRole("button", { name: "Read today's verse" }));
    expect(scroll).toHaveBeenCalledTimes(routeChangeScrolls);
  });

  test("Bible search opens cited public-domain text and saves a bookmark locally", async () => {
    const user = userEvent.setup();
    await renderAt("/bible");

    await user.type(screen.getByRole("searchbox", { name: "Search this selection" }), "mercy");
    const passage = screen.getByRole("button", { name: /Micah 6:8/ });
    await user.click(passage);
    expect(screen.getByText(/act justly, to love mercy/, { selector: "blockquote" })).toBeInTheDocument();
    const save = screen.getByRole("button", { name: "Save verse" });
    await user.click(save);
    expect(save).toHaveAttribute("aria-pressed", "true");
  });

  test("Bible references in the URL prefill search for shared navigation links", async () => {
    await renderAt("/bible?query=Micah%206%3A8");
    expect(screen.getByRole("searchbox", { name: "Search this selection" })).toHaveValue("Micah 6:8");
    expect(screen.getByRole("button", { name: /Micah 6:8/ })).toBeInTheDocument();
  });

  test("a Bible reflection link includes its cited verse in the private journal", async () => {
    await renderAt("/pray?reflection=micah-6-8");
    expect(screen.getByText("Micah 6:8")).toBeInTheDocument();
    expect(screen.getByText(/act justly, to love mercy/)).toBeInTheDocument();
    expect(screen.getAllByText(/They are not sent to AnnLite/).length).toBeGreaterThan(0);
  });

  test("prayer journal stores an entry locally and exposes delete controls", async () => {
    const user = userEvent.setup();
    await renderAt("/pray");

    await user.selectOptions(screen.getByRole("combobox", { name: "Choose a topic" }), "pray.gratitude");
    await user.type(screen.getByRole("textbox", { name: "Prayer or reflection" }), "Thankful for a quiet morning.");
    await user.click(screen.getByRole("button", { name: "Save privately" }));

    expect(screen.getByText("Thankful for a quiet morning.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete entry: Gratitude" })).toBeInTheDocument();
    expect(localStorage.getItem("annlite.journal")).toContain("Thankful for a quiet morning.");
  });

  test("quiz checks the cited passage without creating a public leaderboard", async () => {
    const user = userEvent.setup();
    await renderAt("/quiz");

    await user.click(screen.getByRole("radio", { name: "Act justly, love mercy, and walk humbly with God" }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("status")).toHaveTextContent("That matches the passage.");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  test("charity does not present payments or project data as live", async () => {
    await renderAt("/charity");
    expect(screen.getByText("Charity projects are being prepared.")).toBeInTheDocument();
    expect(screen.getByText("Donations are not currently being accepted through AnnLite.")).toBeInTheDocument();
    expect(screen.getByText(/Production verification is not connected/)).toBeInTheDocument();
    expect(screen.queryByText(/\$[0-9]/)).not.toBeInTheDocument();
  });

  test("mobile menu exposes the full site navigation", async () => {
    const user = userEvent.setup();
    await renderAt();
    const menu = screen.getByRole("button", { name: "Open navigation menu" });

    await user.click(menu);
    expect(menu).toHaveAttribute("aria-expanded", "true");
    const menuNav = screen.getAllByRole("navigation", { name: "Main navigation" }).at(-1);
    expect(within(menuNav!).getByRole("link", { name: "Community" })).toBeInTheDocument();
    expect(within(menuNav!).getByRole("link", { name: "Charity" })).toBeInTheDocument();
  });

  test("all primary navigation destinations load their matching page", async () => {
    const user = userEvent.setup();
    await renderAt();
    const mainNav = screen.getByRole("navigation", { name: "Main navigation" });
    const destinations = [
      ["Bible", "A quieter way to read"],
      ["Learn", "Learn at your own pace"],
      ["Pray", "Take a moment to pray"],
      ["Discover", "Meaningful things to explore"],
      ["Community", "A safer community, in time"],
      ["Charity", "Faith becomes action"],
      ["About", "A place for faith and everyday life"],
    ];

    for (const [label, heading] of destinations) {
      await user.click(within(mainNav).getByRole("link", { name: label }));
      expect(await screen.findByRole("heading", { level: 1, name: heading })).toBeInTheDocument();
    }
    await user.click(screen.getAllByRole("link", { name: "Your space" })[0]);
    expect(await screen.findByRole("heading", { level: 1, name: "Your private space" })).toBeInTheDocument();
  });

  test("profile can delete locally stored data after confirmation", async () => {
    const user = userEvent.setup();
    localStorage.setItem("annlite.bookmarks", JSON.stringify(["micah-6-8"]));
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    await renderAt("/profile");

    expect(screen.getByText("Micah 6:8")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete local data" }));
    expect(confirm).toHaveBeenCalledOnce();
    expect(await screen.findByText("Local data deleted.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Micah 6:8" })).not.toBeInTheDocument();
  });
});