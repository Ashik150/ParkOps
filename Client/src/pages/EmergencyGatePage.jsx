import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  DoorClosed,
  DoorOpen,
  History,
  LockKeyhole,
  RefreshCw,
  ShieldAlert,
  Siren,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { Alert, EmptyState, SectionLoader } from "../components/Feedback";
import PageHeader from "../components/PageHeader";
import { actionLabel, formatDateTime } from "../utils/formatters";

function GateConfirmation({
  action,
  processing,
  onCancel,
  onConfirm,
}) {
  const opening = action === "OPEN";

  return (
    <div className="modal-layer" role="presentation">
      <button
        className="modal-backdrop"
        aria-label="Cancel emergency gate command"
        onClick={onCancel}
      />
      <section
        className="modal emergency-confirmation"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gate-confirm-title"
      >
        <div className="modal__header">
          <span className={`modal__icon ${opening ? "modal__icon--warning" : "modal__icon--safe"}`}>
            {opening ? <AlertTriangle size={22} /> : <LockKeyhole size={22} />}
          </span>
          <button className="icon-button" aria-label="Close" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>
        <h2 id="gate-confirm-title">
          {opening ? "Open emergency gate?" : "Close emergency gate?"}
        </h2>
        <p>
          {opening
            ? "Only open this gate for an authorized emergency or evacuation."
            : "Confirm the emergency route is clear before returning the gate to its secure state."}
        </p>
        <div className={`gate-command-preview gate-command-preview--${opening ? "open" : "closed"}`}>
          {opening ? <DoorOpen size={20} /> : <DoorClosed size={20} />}
          <div>
            <small>New gate state</small>
            <strong>{opening ? "OPEN" : "CLOSED"}</strong>
          </div>
        </div>
        <div className="modal__note">
          <ShieldAlert size={17} />
          Your administrator identity and the exact command time will be logged.
        </div>
        <div className="modal__actions">
          <button className="button button--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`button ${opening ? "button--danger" : "button--primary"}`}
            onClick={onConfirm}
            disabled={processing}
          >
            {processing ? (
              <><span className="spinner spinner--light" />Sending command</>
            ) : (
              <>{opening ? <Siren size={17} /> : <LockKeyhole size={17} />}
                Confirm {opening ? "open" : "close"}
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function EmergencyGatePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [processing, setProcessing] = useState(false);

  const loadGate = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true);
    setError("");

    try {
      const payload = await apiRequest("/gates/emergency");
      setData(payload);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGate();
  }, [loadGate]);

  const sendCommand = async () => {
    const action = pendingAction;
    setProcessing(true);
    setFeedback(null);

    try {
      const payload = await apiRequest(
        `/gates/emergency/${action === "OPEN" ? "open" : "close"}`,
        { method: "POST" },
      );
      setFeedback({ type: "success", message: payload.message });
      setPendingAction(null);
      await loadGate({ quiet: true });
    } catch (requestError) {
      setFeedback({ type: "error", message: requestError.message });
      setPendingAction(null);
    } finally {
      setProcessing(false);
    }
  };

  if (loading && !data) {
    return <SectionLoader label="Loading emergency gate state" />;
  }

  const gateOpen = data?.gate.status === "OPEN";

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Emergency control"
        title="Emergency gate"
        description="Control the emergency access state with full administrator accountability."
        action={
          <button
            className="button button--secondary"
            onClick={() => loadGate()}
            disabled={loading}
          >
            <RefreshCw size={17} className={loading ? "icon-spin" : ""} />
            Refresh status
          </button>
        }
      />

      {error && <Alert>{error}</Alert>}
      {feedback && <Alert type={feedback.type}>{feedback.message}</Alert>}

      {data && (
        <div className="emergency-layout">
          <section className={`emergency-gate-card emergency-gate-card--${gateOpen ? "open" : "closed"}`}>
            <div className="emergency-gate-card__header">
              <div>
                <span className="emergency-gate-card__icon">
                  {gateOpen ? <DoorOpen size={23} /> : <DoorClosed size={23} />}
                </span>
                <div>
                  <small>Current gate state</small>
                  <strong>{gateOpen ? "Gate is open" : "Gate is secured"}</strong>
                </div>
              </div>
              <span className={`gate-state-badge gate-state-badge--${gateOpen ? "open" : "closed"}`}>
                <i />{gateOpen ? "OPEN" : "CLOSED"}
              </span>
            </div>

            <div className={`gate-visual gate-visual--${gateOpen ? "open" : "closed"}`} aria-hidden="true">
              <span className="gate-visual__post gate-visual__post--left" />
              <span className="gate-visual__arm"><i /><i /><i /><i /></span>
              <span className="gate-visual__post gate-visual__post--right" />
              <span className="gate-visual__road"><i /><i /><i /></span>
            </div>

            <div className="emergency-gate-card__copy">
              <h2>{gateOpen ? "Emergency route is accessible" : "Emergency route is secured"}</h2>
              <p>
                {gateOpen
                  ? "Close the gate when the authorized emergency movement is complete."
                  : "Opening creates an immediate operational command and a permanent audit event."}
              </p>
            </div>

            <div className="gate-metadata">
              <div><Clock3 size={16} /><span><small>Last state change</small><strong>{formatDateTime(data.gate.lastChangedAt)}</strong></span></div>
              <div><ShieldAlert size={16} /><span><small>Changed by</small><strong>{data.gate.lastChangedBy?.name || "System initialization"}</strong></span></div>
              <div><History size={16} /><span><small>Command version</small><strong>#{data.gate.commandVersion}</strong></span></div>
            </div>

            <div className="emergency-gate-card__actions">
              <div>
                <ShieldAlert size={18} />
                <span><strong>Administrator confirmation required</strong><small>Every change is timestamped and logged.</small></span>
              </div>
              {gateOpen ? (
                <button className="button button--primary gate-action-button" onClick={() => setPendingAction("CLOSED")}>
                  <LockKeyhole size={18} />Close emergency gate
                </button>
              ) : (
                <button className="button button--danger gate-action-button" onClick={() => setPendingAction("OPEN")}>
                  <Siren size={18} />Open emergency gate
                </button>
              )}
            </div>
          </section>

          <aside className="panel gate-activity-panel">
            <div className="panel__header">
              <div><h2>Emergency gate history</h2><p>Latest state-change commands</p></div>
              <History size={18} />
            </div>
            {data.recentActivity.length ? (
              <div className="gate-activity-list">
                {data.recentActivity.map((activity) => {
                  const opened = activity.action === "EMERGENCY_GATE_OPENED";
                  return (
                    <div className="gate-activity-item" key={activity._id}>
                      <span className={`gate-activity-item__icon gate-activity-item__icon--${opened ? "open" : "closed"}`}>
                        {opened ? <DoorOpen size={16} /> : <CheckCircle2 size={16} />}
                      </span>
                      <div>
                        <strong>{actionLabel(activity.action)}</strong>
                        <p>{activity.actor.name}</p>
                        <small>{formatDateTime(activity.createdAt)}</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No gate commands yet"
                description="The first open or close action will appear here."
              />
            )}
          </aside>
        </div>
      )}

      {pendingAction && (
        <GateConfirmation
          action={pendingAction}
          processing={processing}
          onCancel={() => !processing && setPendingAction(null)}
          onConfirm={sendCommand}
        />
      )}
    </div>
  );
}
