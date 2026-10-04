import { PageHeading, Panel } from "../components/ui";
import { useApp } from "../state/AppProvider";

const privacySections = [
  ["privacy.storageTitle", "privacy.storageCopy"],
  ["privacy.sharedDeviceTitle", "privacy.sharedDeviceCopy"],
  ["privacy.networkTitle", "privacy.networkCopy"],
  ["privacy.controlsTitle", "privacy.controlsCopy"],
] as const;

const termsSections = [
  ["terms.previewTitle", "terms.previewCopy"],
  ["terms.contentTitle", "terms.contentCopy"],
  ["terms.givingTitle", "terms.givingCopy"],
  ["terms.availabilityTitle", "terms.availabilityCopy"],
] as const;

export function PrivacyPage() {
  const { t } = useApp();
  return (
    <div className="app-page legal-page">
      <PageHeading title={t("page.privacy.title")} description={t("page.privacy.description")} />
      <p className="legal-updated">{t("privacy.updated")}</p>
      {privacySections.map(([heading, body]) => (
        <Panel className="legal-section" key={heading}><h2>{t(heading)}</h2><p>{t(body)}</p></Panel>
      ))}
    </div>
  );
}

export function TermsPage() {
  const { t } = useApp();
  return (
    <div className="app-page legal-page">
      <PageHeading title={t("page.terms.title")} description={t("page.terms.description")} />
      <p className="legal-updated">{t("terms.updated")}</p>
      {termsSections.map(([heading, body]) => (
        <Panel className="legal-section" key={heading}><h2>{t(heading)}</h2><p>{t(body)}</p></Panel>
      ))}
    </div>
  );
}