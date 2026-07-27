import {
  ChevronLeft,
  ChevronRight,
  Download,
  LogIn,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  Siren,
  UserPlus,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { Alert, EmptyState, SectionLoader } from "../components/Feedback";
import PageHeader from "../components/PageHeader";
import { actionLabel, formatDateTime } from "../utils/formatters";

const actionOptions = [
  ["", "All activity"],
  ["PARKING_ENTRY", "Vehicle entries"],
  ["PARKING_EXIT", "Vehicle exits"],
  ["EMERGENCY_GATE_OPENED", "Emergency gate opened"],
  ["EMERGENCY_GATE_CLOSED", "Emergency gate closed"],
  ["AUTH_LOGIN", "Admin logins"],
  ["ADMIN_CREATED", "Admin setup"],
];

const actionIcons = {
  PARKING_ENTRY: LogIn,
  PARKING_EXIT: LogOut,
  EMERGENCY_GATE_OPENED: Siren,
  EMERGENCY_GATE_CLOSED: ShieldCheck,
  AUTH_LOGIN: ShieldCheck,
  ADMIN_CREATED: UserPlus,
};

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLogs = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (action) params.set("action", action);
    if (search) params.set("search", search);

    try {
      const payload = await apiRequest(`/logs?${params}`);
      setLogs(payload.logs);
      setPagination(payload.pagination);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [action, search]);

  useEffect(() => {
    loadLogs(1);
  }, [loadLogs]);

  const handleSearch = (event) => {
    event.preventDefault();
    setSearch(searchInput.trim());
  };

  const exportCsv = () => {
    const headers = ["Time", "Action", "Message", "Administrator"];
    const rows = logs.map((log) => [
      formatDateTime(log.createdAt),
      actionLabel(log.action),
      log.message,
      `${log.actor.name} (${log.actor.email})`,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = `parkops-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Audit trail"
        title="System activity logs"
        description="A permanent record of administrative, parking, and emergency-gate activity."
        action={
          <button className="button button--secondary" onClick={exportCsv} disabled={!logs.length}>
            <Download size={17} />Export current page
          </button>
        }
      />

      {error && <Alert>{error}</Alert>}

      <section className="panel">
        <div className="logs-toolbar">
          <form className="search-box" onSubmit={handleSearch}>
            <Search size={18} />
            <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search vehicle, message, or admin..." />
          </form>
          <select value={action} onChange={(event) => setAction(event.target.value)}>
            {actionOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
          <button className="icon-button" aria-label="Refresh logs" onClick={() => loadLogs(pagination.page)}>
            <RefreshCw size={18} />
          </button>
        </div>

        {loading ? (
          <SectionLoader label="Loading audit logs" />
        ) : logs.length ? (
          <>
            <div className="logs-table-wrap">
              <table className="logs-table">
                <thead><tr><th>Event</th><th>Description</th><th>Administrator</th><th>Date & time</th></tr></thead>
                <tbody>
                  {logs.map((log) => {
                    const Icon = actionIcons[log.action] || ShieldCheck;
                    return (
                      <tr key={log._id}>
                        <td><span className={`log-event log-event--${log.action.toLowerCase()}`}><i><Icon size={16} /></i>{actionLabel(log.action)}</span></td>
                        <td><strong className="log-message">{log.message}</strong>{log.details?.vehicleNumber && <small className="log-detail">Vehicle: {log.details.vehicleNumber}</small>}{log.details?.gateName && <small className="log-detail">Gate: {log.details.gateName} · State: {log.details.newStatus}</small>}</td>
                        <td><span className="admin-cell"><i>{log.actor.name.charAt(0)}</i><span><strong>{log.actor.name}</strong><small>{log.actor.email}</small></span></span></td>
                        <td><span className="date-cell">{formatDateTime(log.createdAt)}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span>Showing page {pagination.page} of {pagination.pages} · {pagination.total} events</span>
              <div>
                <button className="icon-button" aria-label="Previous page" disabled={pagination.page <= 1} onClick={() => loadLogs(pagination.page - 1)}><ChevronLeft size={18} /></button>
                <button className="icon-button" aria-label="Next page" disabled={pagination.page >= pagination.pages} onClick={() => loadLogs(pagination.page + 1)}><ChevronRight size={18} /></button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState title="No log events found" description="Adjust your filters or create a new parking entry." />
        )}
      </section>
    </div>
  );
}
