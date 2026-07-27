import {
  CarFront,
  Clock3,
  LogOut,
  Phone,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiRequest } from "../api/client";
import { Alert, EmptyState, SectionLoader } from "../components/Feedback";
import PageHeader from "../components/PageHeader";
import { formatDateTime, formatDuration } from "../utils/formatters";

function ExitModal({ entry, onClose, onConfirm, processing }) {
  return (
    <div className="modal-layer" role="presentation">
      <button className="modal-backdrop" aria-label="Cancel exit" onClick={onClose} />
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="exit-title">
        <div className="modal__header">
          <span className="modal__icon"><LogOut size={22} /></span>
          <button className="icon-button" aria-label="Close" onClick={onClose}><X size={20} /></button>
        </div>
        <h2 id="exit-title">Confirm vehicle exit</h2>
        <p>This will release the parking slot and retain the entry in your audit history.</p>
        <div className="exit-summary">
          <div><small>Vehicle</small><strong>{entry.vehicleNumber}</strong></div>
          <div><small>Parking slot</small><strong>{entry.slotType === "VIP" ? "V" : "N"}-{String(entry.slotNumber).padStart(2, "0")}</strong></div>
          <div><small>Time parked</small><strong>{formatDuration(entry.entryAt, true)}</strong></div>
          <div><small>Entered</small><strong>{formatDateTime(entry.entryAt)}</strong></div>
        </div>
        <div className="modal__note"><ShieldCheck size={17} />This action is logged with your administrator account.</div>
        <div className="modal__actions">
          <button className="button button--secondary" onClick={onClose}>Keep parked</button>
          <button className="button button--danger" onClick={onConfirm} disabled={processing}>
            {processing ? <><span className="spinner spinner--light" />Processing</> : <><LogOut size={17} />Confirm exit</>}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function ExitPage() {
  const location = useLocation();
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState(location.state?.vehicleNumber || "");
  const [type, setType] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [processing, setProcessing] = useState(false);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await apiRequest("/parking/entries");
      setEntries(payload.entries);
    } catch (requestError) {
      setFeedback({ type: "error", message: requestError.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const filteredEntries = useMemo(() => {
    const term = search.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesType = type === "ALL" || entry.slotType === type;
      const matchesSearch =
        !term ||
        entry.vehicleNumber.toLowerCase().includes(term) ||
        entry.phoneNumber.toLowerCase().includes(term);
      return matchesType && matchesSearch;
    });
  }, [entries, search, type]);

  const confirmExit = async () => {
    setProcessing(true);
    setFeedback(null);
    try {
      const payload = await apiRequest(`/parking/entries/${selectedEntry._id}/exit`, {
        method: "POST",
      });
      setFeedback({ type: "success", message: payload.message });
      setSelectedEntry(null);
      await loadEntries();
    } catch (requestError) {
      setFeedback({ type: "error", message: requestError.message });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Exit gate"
        title="Vehicle exit"
        description="Find an active vehicle and release its parking space."
      />

      {feedback && <Alert type={feedback.type}>{feedback.message}</Alert>}

      <section className="panel">
        <div className="list-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search vehicle or phone..." />
          </div>
          <div className="filter-tabs">
            {["ALL", "NORMAL", "VIP"].map((filter) => (
              <button className={type === filter ? "active" : ""} onClick={() => setType(filter)} key={filter}>
                {filter === "ALL" ? "All parking" : filter}
              </button>
            ))}
          </div>
          <span className="result-count">{filteredEntries.length} active</span>
        </div>

        {loading ? (
          <SectionLoader label="Loading active vehicles" />
        ) : filteredEntries.length ? (
          <div className="vehicle-exit-list">
            {filteredEntries.map((entry) => (
              <article className="exit-row" key={entry._id}>
                <div className="exit-row__vehicle">
                  <span><CarFront size={20} /></span>
                  <div><strong>{entry.vehicleNumber}</strong><small>{entry.vehicleType.toLowerCase()}</small></div>
                </div>
                <div className="exit-row__detail">
                  <small>Parking space</small>
                  <strong><span className={`type-dot type-dot--${entry.slotType.toLowerCase()}`} />{entry.slotType === "VIP" ? "V" : "N"}-{String(entry.slotNumber).padStart(2, "0")}</strong>
                </div>
                <div className="exit-row__detail">
                  <small>Entry time</small>
                  <strong><Clock3 size={15} />{formatDateTime(entry.entryAt)}</strong>
                </div>
                <div className="exit-row__detail">
                  <small>Phone</small>
                  <strong><Phone size={15} />{entry.phoneNumber}</strong>
                </div>
                <div className="exit-row__duration">
                  <small>Parked for</small>
                  <strong>{formatDuration(entry.entryAt, true)}</strong>
                </div>
                <button className="button button--exit" onClick={() => setSelectedEntry(entry)}>
                  <LogOut size={17} />Process exit
                </button>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No matching active vehicles" description="Try a different search or parking filter." />
        )}
      </section>

      {selectedEntry && (
        <ExitModal
          entry={selectedEntry}
          onClose={() => !processing && setSelectedEntry(null)}
          onConfirm={confirmExit}
          processing={processing}
        />
      )}
    </div>
  );
}
