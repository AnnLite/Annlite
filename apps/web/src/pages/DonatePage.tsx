import { ArrowRight, ArrowUpRight, CreditCard, HeartHandshake, ShieldCheck } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button, PageHeading, Panel, StatusBadge } from "../components/ui";
import { completeSandboxPayment, createSandboxPaymentIntent, cancelSandboxPayment, failSandboxPayment, type CardNetwork, sanitizeDonationAmount, markSandboxPaymentPending } from "../lib/paymentSandbox";
import { useApp } from "../state/AppProvider";

const CELOHT_URL = "https://app.celoht.com/";
const cardNetworks: CardNetwork[] = ["Mastercard", "Visa"];

export default function DonatePage() {
  const { t } = useApp();
  const [amount, setAmount] = useState("25");
  const [network, setNetwork] = useState<CardNetwork>("Visa");
  const [status, setStatus] = useState<"created" | "pending" | "succeeded" | "failed" | "cancelled">("created");
  const [payment, setPayment] = useState(() => createSandboxPaymentIntent({ amount: 25, network: "Visa" }));
  const [formMessage, setFormMessage] = useState(t("donate.cardCopy"));

  const amountValue = useMemo(() => sanitizeDonationAmount(amount), [amount]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!Number.isFinite(amountValue) || amountValue < 1) {
      setStatus("failed");
      setFormMessage("Please enter a valid donation amount before continuing.");
      return;
    }

    const nextPayment = createSandboxPaymentIntent({ amount: amountValue, network });
    setPayment(nextPayment);
    setStatus("pending");
    setFormMessage(`${t("donate.checkout")}: ${nextPayment.reference}`);
    setPayment(markSandboxPaymentPending(nextPayment));
  };

  const handleApprove = () => {
    const nextPayment = completeSandboxPayment(payment);
    setPayment(nextPayment);
    setStatus("succeeded");
    setFormMessage(`${t("donate.successStatus")}: ${nextPayment.reference}`);
  };

  const handleCancel = () => {
    const nextPayment = cancelSandboxPayment(payment);
    setPayment(nextPayment);
    setStatus("cancelled");
    setFormMessage(`${t("donate.cancelStatus")}: ${nextPayment.reference}`);
  };

  const handleFailure = () => {
    const nextPayment = failSandboxPayment(payment);
    setPayment(nextPayment);
    setStatus("failed");
    setFormMessage(`${t("donate.failureStatus")}: ${nextPayment.reference}`);
  };

  return (
    <div className="app-page">
      <PageHeading title={t("page.donate.title")} description={t("page.donate.description")} />

      <div className="payment-option-grid">
        <Panel className="donation-provider">
          <span className="donation-provider__icon" aria-hidden="true"><HeartHandshake size={23} /></span>
          <div className="donation-provider__copy">
            <div className="donation-provider__heading"><h2>{t("donate.celoTitle")}</h2><StatusBadge status="available" /></div>
            <p>{t("donate.celoCopy")}</p>
            <p className="privacy-note"><ShieldCheck size={15} aria-hidden="true" />{t("donate.externalNotice")}</p>
            <a className="button button--primary donate-external" href={CELOHT_URL} target="_blank" rel="noopener noreferrer">
              {t("donate.celoButton")}<ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
        </Panel>

        <Panel className="donation-provider">
          <span className="donation-provider__icon" aria-hidden="true"><CreditCard size={23} /></span>
          <div className="donation-provider__copy">
            <div className="donation-provider__heading"><h2>{t("donate.cardTitle")}</h2><StatusBadge status="available" /></div>
            <p>{t("donate.cardCopy")}</p>
            <form className="card-donation-form" onSubmit={handleSubmit}>
              <label className="field-label" htmlFor="donation-network">{t("donate.cardNetwork")}</label>
              <select id="donation-network" value={network} onChange={(event) => setNetwork(event.target.value as CardNetwork)}>
                {cardNetworks.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>

              <label className="field-label" htmlFor="donation-amount">{t("donate.amount")}</label>
              <input id="donation-amount" type="number" min={1} max={10000} step={1} value={amount} onChange={(event) => setAmount(event.target.value)} />

              <div className="card-donation-form__actions">
                <Button type="submit" variant="primary">{t("donate.checkout")}</Button>
                {status === "pending" && <Button type="button" variant="secondary" onClick={handleCancel}>{t("donate.cancelStatus")}</Button>}
              </div>
            </form>

            {status !== "created" && (
              <div className="checkout-status" role="status">
                <strong>{t("donate.paymentStatus")}: {status}</strong>
                <span>{formMessage}</span>
                <small>{t("donate.sandboxMode")}</small>
              </div>
            )}

            {status === "pending" && (
              <div className="card-donation-form__actions card-donation-form__actions--secondary">
                <Button type="button" variant="primary" onClick={handleApprove}>{t("donate.successStatus")}</Button>
                <Button type="button" variant="secondary" onClick={handleFailure}>{t("donate.failureStatus")}</Button>
              </div>
            )}

            <ul className="payment-spec-list" aria-label={t("donate.paymentSummary")}>
              <li><strong>{t("donate.paymentIntent")}</strong><span>{payment.id}</span></li>
              <li><strong>{t("donate.checkout")}</strong><span>{payment.checkoutUrl}</span></li>
              <li><strong>{t("donate.successStatus")}</strong><span>{t("donate.successCopy")}</span></li>
              <li><strong>{t("donate.failureStatus")}</strong><span>{t("donate.failureCopy")}</span></li>
              <li><strong>{t("donate.cancelStatus")}</strong><span>{t("donate.cancelCopy")}</span></li>
              <li><strong>{t("donate.webhook")}</strong><span>{t("donate.webhookCopy")}</span></li>
              <li><strong>{t("donate.idempotency")}</strong><span>{payment.idempotencyKey}</span></li>
              <li><strong>{t("donate.audit")}</strong><span>{t("donate.auditCopy")}</span></li>
            </ul>
          </div>
        </Panel>
      </div>

      <p className="transparency-note"><ShieldCheck size={17} aria-hidden="true" />{t("donate.transparency")}</p>
      <p className="donation-footer-link"><Link to="/charity" className="inline-link">{t("nav.charity")}<ArrowRight size={16} aria-hidden="true" /></Link></p>
    </div>
  );
}