type AnalyticsEvent = {
  path: string;
  locale: string;
  title: string;
  description: string;
  url: string;
};

const isProduction = import.meta.env.PROD;

export function trackPageView(event: AnalyticsEvent) {
  if (!isProduction) return;

  const payload = {
    name: "page_view",
    path: event.path,
    locale: event.locale,
    title: event.title,
    description: event.description,
    url: event.url,
    timestamp: new Date().toISOString(),
  };

  window.dispatchEvent(
    new CustomEvent("annlite:analytics", {
      detail: payload,
    }),
  );

  if (typeof window !== "undefined") {
    const existing = window.localStorage.getItem("annlite.analytics.events");
    const events = existing ? JSON.parse(existing) : [];
    events.push(payload);
    window.localStorage.setItem("annlite.analytics.events", JSON.stringify(events.slice(-50)));
  }
}
