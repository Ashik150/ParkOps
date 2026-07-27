import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CarFront,
  ChevronRight,
  CircleParking,
  Gauge,
  Layers3,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import { Alert, EmptyState, SectionLoader } from "../components/Feedback";
import PageHeader from "../components/PageHeader";
import { actionLabel, formatDateTime } from "../utils/formatters";

const statCards = [
  { key: "totalCapacity", label: "Total capacity", icon: Layers3, tone: "navy" },
  { key: "totalOccupied", label: "Total occupied", icon: CarFront, tone: "orange" },
  { key: "totalFree", label: "Free slots", icon: CircleParking, tone: "green" },
  { key: "utilization", label: "Utilization", icon: Gauge, tone: "purple", suffix: "%" },
];

function ParkingTypeCard({ type, data }) {
  const utilization = data.capacity
    ? Math.round((data.occupied / data.capacity) * 100)
    : 0;

  return (
    <article className={`parking-type-card parking-type-card--${type.toLowerCase()}`}>
      <div className="parking-type-card__header">
        <div>
          <span className="parking-type-card__icon">
            {type === "VIP" ? <Sparkles size={20} /> : <CircleParking size={20} />}
          </span>
          <div>
            <strong>{type === "VIP" ? "VIP parking" : "Normal parking"}</strong>
            <small>{data.capacity} total spaces</small>
          </div>
        </div>
        <span className="availability-pill">{data.free} free</span>
      </div>
      <div className="progress-copy">
        <span>{data.occupied} occupied</span>
        <span>{utilization}% used</span>
      </div>
      <div className="progress-track">
        <span style={{ width: `${utilization}%` }} />
      </div>
      <div className="slot-counts">
        <div><strong>{data.occupied}</strong><small>Occupied</small></div>
        <div><strong>{data.free}</strong><small>Available</small></div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const payload = await apiRequest("/dashboard");
      setData(payload);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) return <SectionLoader label="Loading parking overview" />;

  if (error) {
    return (
      <div className="page-stack">
        <PageHeader title="Parking overview" />
        <Alert>{error}</Alert>
        <button className="button button--secondary button--fit" onClick={loadDashboard}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Live operations"
        title="Parking overview"
        description="A real-time view of capacity, vehicles, and gate activity."
        action={
          <Link className="button button--primary" to="/entry">
            <ArrowDownToLine size={18} /> New entry
          </Link>
        }
      />

      <section className="stats-grid">
        {statCards.map(({ key, label, icon: Icon, tone, suffix = "" }) => (
          <article className="stat-card" key={key}>
            <span className={`stat-card__icon stat-card__icon--${tone}`}>
              <Icon size={21} />
            </span>
            <div>
              <small>{label}</small>
              <strong>{data.summary[key]}{suffix}</strong>
            </div>
            <span className="stat-card__trend">
              {key === "totalFree" ? "Ready now" : "Live"}
            </span>
          </article>
        ))}
      </section>

      <section className="home-grid">
        <div className="panel">
          <div className="panel__header">
            <div>
              <h2>Parking availability</h2>
              <p>Capacity by parking category</p>
            </div>
            <span className="live-indicator"><i /> Live</span>
          </div>
          <div className="parking-types-grid">
            <ParkingTypeCard type="VIP" data={data.parkingTypes.VIP} />
            <ParkingTypeCard type="NORMAL" data={data.parkingTypes.NORMAL} />
          </div>
        </div>

        <div className="panel daily-flow">
          <div className="panel__header">
            <div><h2>Today’s gate flow</h2><p>Since midnight</p></div>
          </div>
          <div className="flow-metric">
            <span className="flow-metric__icon flow-metric__icon--entry"><ArrowDownToLine size={19} /></span>
            <div><small>Vehicle entries</small><strong>{data.summary.entriesToday}</strong></div>
          </div>
          <div className="flow-divider" />
          <div className="flow-metric">
            <span className="flow-metric__icon flow-metric__icon--exit"><ArrowUpFromLine size={19} /></span>
            <div><small>Vehicle exits</small><strong>{data.summary.exitsToday}</strong></div>
          </div>
          <Link to="/logs" className="text-link">
            View complete activity <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      <section className="home-grid home-grid--bottom">
        <div className="panel">
          <div className="panel__header">
            <div><h2>Recently parked</h2><p>Latest active vehicle entries</p></div>
            <Link to="/exit" className="text-link">View all <ChevronRight size={15} /></Link>
          </div>
          {data.recentEntries.length ? (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Vehicle</th><th>Parking</th><th>Slot</th><th>Entry time</th></tr></thead>
                <tbody>
                  {data.recentEntries.map((entry) => (
                    <tr key={entry._id}>
                      <td><span className="vehicle-cell"><i><CarFront size={17} /></i><strong>{entry.vehicleNumber}</strong></span></td>
                      <td><span className={`type-badge type-badge--${entry.slotType.toLowerCase()}`}>{entry.slotType}</span></td>
                      <td><strong>{entry.slotType === "VIP" ? "V" : "N"}-{String(entry.slotNumber).padStart(2, "0")}</strong></td>
                      <td>{formatDateTime(entry.entryAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No active vehicles" description="New vehicle entries will appear here." />
          )}
        </div>

        <div className="panel">
          <div className="panel__header">
            <div><h2>Recent activity</h2><p>Latest gate events</p></div>
          </div>
          {data.recentLogs.length ? (
            <div className="activity-list">
              {data.recentLogs.map((log) => (
                <div className="activity-item" key={log._id}>
                  <span className={`activity-item__icon activity-item__icon--${log.action === "PARKING_EXIT" ? "exit" : "entry"}`}>
                    {log.action === "PARKING_EXIT" ? <ArrowUpFromLine size={16} /> : <ArrowDownToLine size={16} />}
                  </span>
                  <div><strong>{actionLabel(log.action)}</strong><p>{log.message}</p><small>{formatDateTime(log.createdAt)}</small></div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No activity yet" description="Entry and exit events will be shown here." />
          )}
        </div>
      </section>
    </div>
  );
}
