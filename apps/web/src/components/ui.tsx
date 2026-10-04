import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../state/AppProvider";

type PageHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PageHeading({ eyebrow, title, description, action }: PageHeadingProps) {
  return (
    <header className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-heading__description">{description}</p>}
      </div>
      {action && <div className="page-heading__action">{action}</div>}
    </header>
  );
}

export function SectionHeading({ title, description, action }: PageHeadingProps) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet" | "danger";
};

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  return <button className={`button button--${variant} ${className}`.trim()} {...props} />;
}

type LinkButtonProps = {
  to: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "quiet";
  className?: string;
  onClick?: () => void;
};

export function LinkButton({ to, children, variant = "primary", className = "", onClick }: LinkButtonProps) {
  return <Link className={`button button--${variant} ${className}`.trim()} to={to} onClick={onClick}>{children}</Link>;
}

export function StatusBadge({ status }: { status: "available" | "soon" | "development" }) {
  const { t } = useApp();
  const label = status === "available" ? t("common.available") : status === "soon" ? t("common.comingSoon") : t("common.underDevelopment");
  return <span className={`status-badge status-badge--${status}`}>{label}</span>;
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <span className="progress-track__fill" style={{ width: `${value}%` }} />
    </div>
  );
}

export function Panel({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={`panel ${className}`.trim()} {...props} />;
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">{icon}</span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="visually-hidden">{children}</span>;
}