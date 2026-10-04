import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { useApp } from "../state/AppProvider";
import { Button, PageHeading, Panel } from "../components/ui";

const FOUNDER_EMAIL = "britusberline46@gmail.com";

export default function ContactPage() {
  const { t } = useApp();
  const [draftLink, setDraftLink] = useState("");

  const prepareEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = String(form.get("topic") ?? "").trim();
    const body = [
      `${t("contact.name")}: ${String(form.get("name") ?? "").trim()}`,
      `${t("contact.email")}: ${String(form.get("email") ?? "").trim()}`,
      "",
      String(form.get("message") ?? "").trim(),
    ].join("\n");
    setDraftLink(`mailto:${FOUNDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <div className="app-page">
      <PageHeading title={t("page.contact.title")} description={t("page.contact.description")} />
      <Panel className="contact-panel">
        <form className="contact-form" onSubmit={prepareEmail}>
          <label className="field-label" htmlFor="contact-name">{t("contact.name")}</label>
          <input id="contact-name" name="name" autoComplete="name" maxLength={120} required />
          <label className="field-label" htmlFor="contact-email">{t("contact.email")}</label>
          <input id="contact-email" name="email" type="email" autoComplete="email" maxLength={254} required />
          <label className="field-label" htmlFor="contact-topic">{t("contact.topic")}</label>
          <input id="contact-topic" name="topic" maxLength={160} required />
          <label className="field-label" htmlFor="contact-message">{t("contact.message")}</label>
          <textarea id="contact-message" name="message" rows={7} maxLength={5000} required />
          <div className="contact-submit-row">
            <Button type="submit" variant="secondary"><Mail size={16} />{t("contact.prepare")}</Button>
            {draftLink && <a className="button button--primary" href={draftLink}>{t("contact.openEmail")}</a>}
          </div>
          <p className="privacy-note" role="note">{t("contact.notSent")}</p>
          <p className="contact-direct"><a href={`mailto:${FOUNDER_EMAIL}`}>{t("contact.emailLabel")}</a></p>
        </form>
      </Panel>
    </div>
  );
}