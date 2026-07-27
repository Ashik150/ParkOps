import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import Brand from "../components/Brand";
import { Alert } from "../components/Feedback";
import { useAuth } from "../hooks/useAuth";

const initialForm = {
  name: "",
  email: "",
  password: "",
};

export default function LoginPage() {
  const [setupMode, setSetupMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (setupMode) {
        await register(form);
      } else {
        await login({ email: form.email, password: form.password });
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setSetupMode((current) => !current);
    setError("");
    setForm(initialForm);
  };

  return (
    <div className="login-page">
      <section className="login-showcase">
        <Brand />
        <div className="login-showcase__content">
          <span className="login-kicker">Smarter parking operations</span>
          <h1>Every arrival. Every space. Completely under control.</h1>
          <p>
            Run your parking facility from one secure workspace with live slot
            visibility and a complete operational record.
          </p>
          <div className="login-features">
            <div>
              <span><BarChart3 size={20} /></span>
              <p><strong>Live visibility</strong><small>Capacity and occupancy at a glance</small></p>
            </div>
            <div>
              <span><ShieldCheck size={20} /></span>
              <p><strong>Secure by design</strong><small>Protected admin access and audit trails</small></p>
            </div>
          </div>
        </div>
        <div className="login-showcase__footer">
          <CheckCircle2 size={17} />
          Built for reliable gate operations
        </div>
      </section>

      <section className="login-panel">
        <div className="login-panel__mobile-brand"><Brand /></div>
        <form className="auth-card" onSubmit={handleSubmit}>
          <span className="eyebrow">
            {setupMode ? "First-time setup" : "Administrator portal"}
          </span>
          <h2>{setupMode ? "Create your admin" : "Welcome back"}</h2>
          <p className="auth-card__intro">
            {setupMode
              ? "Create the first administrator account for this facility."
              : "Sign in to manage parking and gate activity."}
          </p>

          {error && <Alert>{error}</Alert>}

          {setupMode && (
            <label className="field">
              <span>Full name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={updateField}
                placeholder="Operations administrator"
                autoComplete="name"
                required
              />
            </label>
          )}

          <label className="field">
            <span>Email address</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={updateField}
              placeholder="admin@company.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={updateField}
                placeholder={setupMode ? "8+ secure characters" : "Your password"}
                autoComplete={setupMode ? "new-password" : "current-password"}
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {setupMode && (
            <p className="password-hint">
              Use uppercase, lowercase, and at least one number.
            </p>
          )}

          <button className="button button--primary button--large" disabled={submitting}>
            {submitting ? (
              <><span className="spinner spinner--light" />Please wait</>
            ) : (
              <>{setupMode ? "Create administrator" : "Sign in securely"}<ArrowRight size={18} /></>
            )}
          </button>

          <p className="auth-switch">
            {setupMode ? "Already configured?" : "Setting up for the first time?"}
            <button type="button" onClick={switchMode}>
              {setupMode ? "Return to sign in" : "Create first admin"}
            </button>
          </p>
        </form>
        <p className="login-copyright">© {new Date().getFullYear()} ParkOps</p>
      </section>
    </div>
  );
}
