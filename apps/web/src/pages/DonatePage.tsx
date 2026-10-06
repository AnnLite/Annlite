import { ArrowRight, ArrowUpRight, CreditCard, HeartHandshake, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, PageHeading, Panel, StatusBadge } from "../components/ui";
import { sanitizeDonationAmount, validateDonationAmount, type DonationMethod } from "../lib/paymentSandbox";
import { useApp } from "../state/AppProvider";

const CELOHT_URL = "https://app.celoht.com/";
const presetAmounts = [10, 25, 50, 100];
const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function DonatePage() {
  const { t } = useApp();
  const [selectedMethod, setSelectedMethod] = useState<DonationMethod>("celoht");
  const [amount, setAmount] = useState("25");
  const [validationMessage, setValidationMessage] = useState("");

  const sanitizedAmount = useMemo(() => sanitizeDonationAmount(amount), [amount]);
  const selectedAmount = sanitizedAmount > 0 ? currencyFormatter.format(sanitizedAmount) : "$0.00";

  const handleContinue = () => {
    const result = validateDonationAmount(amount);

    if (!result.valid) {
      setValidationMessage(result.message);
      return;
    }

    if (selectedMethod === "celoht") {
      setValidationMessage(t("donate.celoSelected"));
      window.open(CELOHT_URL, "_blank", "noopener,noreferrer");
      return;
    }

    setValidationMessage(t("donate.cardComingSoon"));
  };

  const summaryStatus = selectedMethod === "card" ? t("donate.statusPending") : t("donate.statusExternal");

  return (
    <div className="app-page donate-page">
      <PageHeading title={t("page.donate.title")} description={t("page.donate.description")} />

      <div className="donate-grid">
        <Panel className="donate-panel donate-panel--primary">
          <div className="donate-header">
            <p className="eyebrow">{t("donate.heroTitle")}</p>
            <h2>{t("donate.heroTitle")}</h2>
            <p>{t("donate.heroCopy")}</p>
          </div>

          <div className="donate-amount-block">
            <p className="eyebrow">{t("donate.amountTitle")}</p>
            <div className="donate-amount-grid" role="group" aria-label={t("donate.amountTitle")}>
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`donate-amount-option${Number(amount) === preset ? " is-selected" : ""}`}
                  onClick={() => {
                    setAmount(String(preset));
                    setValidationMessage("");
                  }}
                  aria-pressed={Number(amount) === preset}
                >
                  {currencyFormatter.format(preset)}
                </button>
              ))}
            </div>
            <label className="field-label" htmlFor="donation-amount">{t("donate.amountCustom")}</label>
            <input
              id="donation-amount"
              type="number"
              min={1}
              max={10000}
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setValidationMessage("");
              }}
              aria-invalid={Boolean(validationMessage)}
            />
            <p className="donate-helper-text">{t("donate.amountPreset")}</p>
          </div>

          <div className="donate-methods" aria-label={t("donate.amountTitle")}>
            <button
              type="button"
              className={`donate-method-option${selectedMethod === "card" ? " is-selected" : ""}`}
              onClick={() => setSelectedMethod("card")}
              aria-pressed={selectedMethod === "card"}
            >
              <span className="donate-method-option__icon" aria-hidden="true"><CreditCard size={18} /></span>
              <span className="donate-method-option__copy">
                <strong>{t("donate.cardPayment")}</strong>
                <small>{t("donate.cardMethodCopy")}</small>
              </span>
              <StatusBadge status="development" />
            </button>

            <a
              href={CELOHT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`donate-method-option donate-method-option--external${selectedMethod === "celoht" ? " is-selected" : ""}`}
              onClick={() => setSelectedMethod("celoht")}
            >
              <span className="donate-method-option__icon" aria-hidden="true"><HeartHandshake size={18} /></span>
              <span className="donate-method-option__copy">
                <strong>{t("donate.celoTitle")}</strong>
                <small>{t("donate.celoCopy")}</small>
              </span>
              <StatusBadge status="soon" />
            </a>
          </div>

          {validationMessage && (
            <p className="form-status form-status--error" role="alert" aria-live="assertive">
              {validationMessage}
            </p>
          )}

          <div className="donate-actions">
            <Button type="button" variant="primary" onClick={handleContinue} disabled={selectedMethod === "card"}>
              {selectedMethod === "card" ? t("donate.cardDisabled") : t("donate.continue")}
            </Button>
            <Link to="/charity" className="button button--secondary">{t("nav.charity")}</Link>
          </div>
        </Panel>

        <Panel className="donate-panel donate-panel--summary">
          <div className="donate-summary-card">
            <p className="eyebrow">{t("donate.reviewTitle")}</p>
            <h3>{selectedAmount}</h3>
            <dl className="donate-summary-list">
              <div>
                <dt>{t("donate.reviewMethod")}</dt>
                <dd>{selectedMethod === "card" ? t("donate.cardPayment") : t("donate.celoTitle")}</dd>
              </div>
              <div>
                <dt>{t("donate.reviewStatus")}</dt>
                <dd>{summaryStatus}</dd>
              </div>
            </dl>

            <p className="donate-summary-note">
              {selectedMethod === "card" ? t("donate.cardComingSoon") : t("donate.reviewNote")}
            </p>
          </div>

          <div className="donate-security-box">
            <span className="donate-security-box__icon" aria-hidden="true"><ShieldCheck size={18} /></span>
            <div>
              <strong>{t("donate.privacyTitle")}</strong>
              <p>{t("donate.privacyCopy")}</p>
            </div>
          </div>

          <div className="donate-transparency-box">
            <span className="donate-security-box__icon" aria-hidden="true"><ArrowUpRight size={18} /></span>
            <div>
              <strong>{t("donate.transparencyTitle")}</strong>
              <p>{t("donate.transparency")}</p>
            </div>
          </div>
        </Panel>
      </div>

      <p className="transparency-note"><ShieldCheck size={17} aria-hidden="true" />{t("donate.transparency")}</p>
      <p className="donation-footer-link">
        <Link to="/charity" className="inline-link">{t("nav.charity")}<ArrowRight size={16} aria-hidden="true" /></Link>
      </p>
    </div>
  );
}