import { AlertCircle, CheckCircle2, Inbox } from "lucide-react";

export function Alert({ type = "error", children }) {
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div className={`alert alert--${type}`} role="status">
      <Icon size={18} />
      <span>{children}</span>
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon">
        <Inbox size={26} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export function SectionLoader({ label = "Loading data" }) {
  return (
    <div className="section-loader">
      <span className="spinner" />
      <span>{label}...</span>
    </div>
  );
}
