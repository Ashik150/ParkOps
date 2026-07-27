import {
  CarFront,
  CircleParking,
  Clock3,
  Crown,
  LogOut,
  Phone,
  RefreshCw,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, EmptyState, SectionLoader } from "../components/Feedback";
import PageHeader from "../components/PageHeader";
import { useSlotMap } from "../hooks/useSlotMap";
import { formatDateTime, formatDuration } from "../utils/formatters";

export default function OccupiedSlotsPage() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const { data, loading, error, refresh } = useSlotMap();

  const occupiedSlots = useMemo(() => {
    if (!data) return [];

    const term = search.trim().toLowerCase();

    return ["VIP", "NORMAL"].flatMap((sectionType) =>
      data.sections[sectionType].slots
        .filter((slot) => slot.status === "OCCUPIED")
        .filter(() => filter === "ALL" || sectionType === filter)
        .filter(
          (slot) =>
            !term ||
            slot.slotCode.toLowerCase().includes(term) ||
            slot.vehicle.vehicleNumber.toLowerCase().includes(term) ||
            slot.vehicle.phoneNumber.toLowerCase().includes(term),
        )
        .map((slot) => ({ ...slot, sectionType })),
    );
  }, [data, filter, search]);

  if (loading && !data) {
    return <SectionLoader label="Loading occupied parking slots" />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Live occupancy"
        title="Occupied parking slots"
        description="See which vehicle is currently assigned to every occupied space."
        action={
          <button className="button button--secondary" onClick={refresh} disabled={loading}>
            <RefreshCw size={17} className={loading ? "icon-spin" : ""} />
            Refresh vehicles
          </button>
        }
      />

      {error && <Alert>{error}</Alert>}

      {data && (
        <>
          <section className="slot-summary-grid">
            <article className="slot-summary-card slot-summary-card--occupied">
              <span><CarFront size={21} /></span>
              <div><small>Total occupied</small><strong>{data.summary.totalOccupied}</strong></div>
              <p>{data.summary.totalFree} spaces free</p>
            </article>
            <article className="slot-summary-card slot-summary-card--vip">
              <span><Crown size={21} /></span>
              <div><small>VIP occupied</small><strong>{data.sections.VIP.occupied}</strong></div>
              <p>of {data.sections.VIP.capacity} spaces</p>
            </article>
            <article className="slot-summary-card slot-summary-card--normal">
              <span><CircleParking size={21} /></span>
              <div><small>Normal occupied</small><strong>{data.sections.NORMAL.occupied}</strong></div>
              <p>of {data.sections.NORMAL.capacity} spaces</p>
            </article>
          </section>

          <section className="panel">
            <div className="list-toolbar occupied-toolbar">
              <div className="search-box">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search slot, vehicle, or phone..."
                />
              </div>
              <div className="filter-tabs">
                {["ALL", "VIP", "NORMAL"].map((type) => (
                  <button
                    className={filter === type ? "active" : ""}
                    onClick={() => setFilter(type)}
                    key={type}
                  >
                    {type === "ALL" ? "All sections" : type}
                  </button>
                ))}
              </div>
              <span className="result-count">{occupiedSlots.length} occupied</span>
            </div>

            {occupiedSlots.length ? (
              <div className="occupied-slot-grid">
                {occupiedSlots.map((slot) => (
                  <article
                    className={`occupied-slot-card occupied-slot-card--${slot.sectionType.toLowerCase()}`}
                    key={slot.slotCode}
                  >
                    <div className="occupied-slot-card__top">
                      <div>
                        <span className={`occupied-slot-card__mark occupied-slot-card__mark--${slot.sectionType.toLowerCase()}`}>
                          {slot.sectionType === "VIP" ? <Crown size={18} /> : <CircleParking size={18} />}
                        </span>
                        <div><small>{slot.sectionType} section</small><strong>{slot.slotCode}</strong></div>
                      </div>
                      <span className="occupied-badge"><i />Occupied</span>
                    </div>

                    <div className="occupied-slot-card__vehicle">
                      <span><CarFront size={21} /></span>
                      <div><small>Current vehicle</small><strong>{slot.vehicle.vehicleNumber}</strong><p>{slot.vehicle.vehicleType.toLowerCase()}</p></div>
                    </div>

                    <div className="occupied-slot-card__details">
                      <div><Phone size={15} /><span><small>Phone number</small><strong>{slot.vehicle.phoneNumber}</strong></span></div>
                      <div><Clock3 size={15} /><span><small>Entry time</small><strong>{formatDateTime(slot.vehicle.entryAt)}</strong></span></div>
                    </div>

                    <div className="occupied-slot-card__footer">
                      <span>Parked for <strong>{formatDuration(slot.vehicle.entryAt, true)}</strong></span>
                      <Link to="/exit" state={{ vehicleNumber: slot.vehicle.vehicleNumber }}>
                        Manage exit <LogOut size={14} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No occupied slots found"
                description="Try another filter, or wait for the next vehicle entry."
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}
