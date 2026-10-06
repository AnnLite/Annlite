import { render, screen, within, waitFor } from "@testing-library/react";
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

  test("Founder profile keeps its verified origin, localized story, and exact contact links", async () => {
    const user = userEvent.setup();
    localStorage.setItem("annlite.locale", JSON.stringify("en"));
    await renderAt("/founder");

    expect(screen.getByRole("heading", { level: 1, name: "Berline Britus" })).toBeInTheDocument();
    expect(screen.getByText("Aquin, Southern Department, Haiti")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The Story Behind AnnLite" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Skills & Experience" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Faith & Service" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Her Vision for AnnLite" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Email the Founder" }).every((link) => link.getAttribute("href") === "mailto:britusberline46@gmail.com")).toBe(true);
    const linkedIn = screen.getAllByRole("link", { name: "Connect with the Founder on LinkedIn" });
    expect(linkedIn[0]).toHaveAttribute("href", "https://www.linkedin.com/in/britus-berline-86329a441");
    expect(linkedIn[0]).toHaveAttribute("rel", "noopener noreferrer");

    await user.selectOptions(screen.getByRole("combobox", { name: "Language" }), "fr");
    expect(screen.getByRole("heading", { name: "L’histoire derrière AnnLite" })).toBeInTheDocument();
    expect(screen.getByText("Aquin, département du Sud, Haïti")).toBeInTheDocument();
    expect(document.title).toContain("Rencontrer la fondatrice");

    await user.selectOptions(screen.getByRole("combobox", { name: "Langue" }), "ht");
    expect(screen.getByRole("heading", { name: "Istwa ki dèyè AnnLite" })).toBeInTheDocument();
    expect(screen.getByText("Aken, Depatman Sid, Ayiti")).toBeInTheDocument();
    expect(document.title).toContain("Rankontre fondatris la");
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

  test("donate starts on the honest external-provider path instead of a fake card flow", async () => {
    await renderAt("/donate");
    expect(screen.getAllByRole("heading", { name: "Give to AnnLite" }).length).toBeGreaterThan(0);
    expect(screen.getByText("External provider flow")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
    const cardOption = screen.getByRole("button", { name: /Card payment/i });
    expect(cardOption).toHaveAttribute("aria-pressed", "false");
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

  test("Learn search finds Bible references and category filters narrow courses and lessons", async () => {
    const user = userEvent.setup();
    localStorage.setItem("annlite.locale", JSON.stringify("en"));
    await renderAt("/learn");

    const search = screen.getByRole("searchbox", { name: "Search courses and lessons" });
    await user.type(search, "Micah 6:8");
    expect(screen.getByRole("link", { name: "View course: Christian Values" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Justice and humility/ })).toBeInTheDocument();

    await user.clear(search);
    const filters = screen.getByRole("group", { name: "Filter courses by category" });
    await user.click(within(filters).getByRole("button", { name: "Prayer" }));
    expect(screen.getByRole("heading", { level: 3, name: "How to Pray" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3, name: "Christian Values" })).not.toBeInTheDocument();
  });

  test("Learn deep links show a translated course and lesson", async () => {
    const user = userEvent.setup();
    localStorage.setItem("annlite.locale", JSON.stringify("en"));
    await renderAt("/learn/how-to-pray");
    expect(screen.getByRole("heading", { level: 1, name: "How to Pray" })).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox", { name: "Language" }), "fr");
    expect(screen.getByRole("heading", { level: 1, name: "Comment prier" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Des mots pour prier" })).toBeInTheDocument();
    expect(document.title).toContain("Comment prier");

    await user.selectOptions(screen.getByRole("combobox", { name: "Langue" }), "ht");
    expect(screen.getByRole("heading", { level: 1, name: "Kijan pou priye" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Kòmanse ak senserite/ })).toBeInTheDocument();
  });

  test("course overview starts at the first lesson and supports return navigation", async () => {
    const user = userEvent.setup();
    localStorage.setItem("annlite.locale", JSON.stringify("en"));
    await renderAt("/learn/understanding-the-bible");

    expect(screen.getByRole("heading", { level: 1, name: "Understanding the Bible" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)).toContain("A library of books");
    await user.click(screen.getByRole("link", { name: "Start course" }));
    expect(await screen.findByRole("heading", { level: 1, name: "The Bible as a library" })).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Course overview" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Understanding the Bible" })).toBeInTheDocument();
  });

  test("course completion displays completed modules and a full progress bar", async () => {
    const user = userEvent.setup();
    localStorage.setItem("annlite.locale", JSON.stringify("en"));
    await renderAt("/learn/christianity-for-beginners");

    while (screen.queryAllByRole("button", { name: /Mark lesson as complete/ }).length) {
      await user.click(screen.getAllByRole("button", { name: /Mark lesson as complete/ })[0]);
    }
    expect(screen.getByRole("heading", { name: "Course completed" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Course progress" })).toHaveAttribute("aria-valuenow", "100");
    expect(screen.getByText(/Modules completed: 2\/2/)).toBeInTheDocument();
    expect(screen.getByText(/Completed on/)).toBeInTheDocument();
  });

  test("a mobile-sized lesson quiz validates answers, scores, retries, bookmarks, and completion", async () => {
    const user = userEvent.setup();
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 375 });
    localStorage.setItem("annlite.locale", JSON.stringify("en"));
    localStorage.removeItem("annlite.learn.progress.v1");
    await renderAt("/learn/christianity-for-beginners/beginnings-faith");

    expect(screen.getByRole("heading", { level: 1, name: "What Christians mean by faith" })).toBeInTheDocument();
    expect(screen.getAllByRole("main")).toHaveLength(1);
    const violations = await axe.run(document.getElementById("main-content")!, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    });
    expect(violations.violations).toEqual([]);

    const check = screen.getByRole("button", { name: "Check answer" });
    expect(check).toBeDisabled();
    await user.click(screen.getByRole("radio", { name: "Trust that shapes a way of life" }));
    await user.click(check);
    expect(screen.getByRole("status")).toHaveTextContent("Correct");
    await user.click(screen.getByRole("button", { name: "Next question" }));
    await user.click(screen.getByRole("radio", { name: /True/ }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    await user.click(screen.getByRole("button", { name: "See results" }));
    expect(screen.getByRole("heading", { name: "Score: 2/2 (100%)" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry quiz" }));
    await user.click(screen.getByRole("button", { name: "Bookmark lesson" }));
    expect(screen.getByRole("button", { name: "Lesson bookmarked" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Mark lesson as complete" }));
    expect(screen.getByRole("button", { name: "Completed" })).toBeDisabled();
    expect(localStorage.getItem("annlite.learn.progress.v1")).toContain("beginnings-faith");
    await user.click(screen.getByRole("link", { name: /Next lesson/ }));
    expect(await screen.findByRole("heading", { level: 1, name: "Meet Jesus through the Gospels" })).toBeInTheDocument();
  });

  test("Learn progress and bookmarks appear in My Learning after navigation", async () => {
    const user = userEvent.setup();
    localStorage.setItem("annlite.locale", JSON.stringify("en"));
    localStorage.setItem("annlite.learn.progress.v1", JSON.stringify({
      completedLessons: ["beginnings-faith"],
      bookmarks: ["beginnings-faith"],
      quizAttempts: [{ courseSlug: "christianity-for-beginners", lessonId: "beginnings-faith", score: 1, total: 2, completedAt: "2026-10-04T12:00:00.000Z" }],
      completedAtByCourse: {},
    }));
    await renderAt("/learn?view=learning");

    expect(screen.getByRole("heading", { name: "In progress" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Christianity for Beginners" })).toBeInTheDocument();
    expect(screen.getByText(/1\/2 \(50%\)/)).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Course progress" })).toHaveAttribute("aria-valuenow", "25");

    await user.click(screen.getByRole("link", { name: "My Bookmarks" }));
    expect(await screen.findByRole("heading", { level: 1, name: "My Bookmarks" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /What Christians mean by faith/ })).toBeInTheDocument();
  });

  test("visiting a lesson starts a course and records it as recently studied", async () => {
    localStorage.setItem("annlite.locale", JSON.stringify("en"));
    localStorage.removeItem("annlite.learn.progress.v1");
    const view = await renderAt("/learn/how-to-pray/prayer-start");
    await waitFor(() => expect(localStorage.getItem("annlite.learn.progress.v1")).toContain("prayer-start"));
    view.unmount();

    await renderAt("/learn?view=learning");
    expect(screen.getByRole("heading", { level: 3, name: "How to Pray" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Begin with honesty/ })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Course progress" })).toHaveAttribute("aria-valuenow", "0");
  });

  test("profile can delete locally stored data after confirmation", async () => {
    const user = userEvent.setup();
    localStorage.setItem("annlite.bookmarks", JSON.stringify(["micah-6-8"]));
    localStorage.setItem("annlite.learn.progress.v1", JSON.stringify({ completedLessons: ["beginnings-faith"] }));
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    await renderAt("/profile");

    expect(screen.getByText("Micah 6:8")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete local data" }));
    expect(confirm).toHaveBeenCalledOnce();
    expect(await screen.findByText("Local data deleted.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Micah 6:8" })).not.toBeInTheDocument();
    expect(localStorage.getItem("annlite.learn.progress.v1")).toBeNull();
  });
});