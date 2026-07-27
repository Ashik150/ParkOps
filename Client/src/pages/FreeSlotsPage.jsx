import {
  ArrowRight,
  CircleParking,
  Crown,
  MapPinned,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert, EmptyState, SectionLoader } from "../components/Feedback";
import PageHeader from "../components/PageHeader";
import { useSlotMap } from "../hooks/useSlotMap";
import { formatDateTime } from "../utils/formatters";

const sectionOrder = ["VIP", "NORMAL"];

function FreeSection({ section }) {
  const freeSlots = section.slots.filter((slot) => slot.status === "FREE");
  const isVip = section.slotType === "VIP";

  return (
    <section className="panel slot-section">
      <div className="slot-section__header">
        <div className={`slot-section__mark slot-section__mark--${section.slotType.toLowerCase()}`}>
          {isVip ? <Crown size={21} /> : <CircleParking size={21} />}
        </div>
        <div>
          <h2>{isVip ? "VIP section" : "Normal section"}</h2>
          <p>{freeSlots.length} of {section.capacity} spaces available</p>
        </div>
        <span className="slot-section__availability">{section.free} free</span>
      </div>

      {freeSlots.length ? (
        <div className="free-slot-grid">
          {freeSlots.map((slot) => (
            <Link
              className={`free-slot-card free-slot-card--${section.slotType.toLowerCase()}`}
              to="/entry"
              state={{
                slotType: section.slotType,
                slotNumber: slot.slotNumber,
              }}
              key={slot.slotCode}
            >
              <span className="free-slot-card__status"><i />Available</span>
              <strong>{slot.slotCode}</strong>
              <small>{isVip ? "VIP parking" : "Normal parking"}</small>
              <span className="free-slot-card__action">Assign <ArrowRight size={14} /></span>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title={`No free ${isVip ? "VIP" : "Normal"} slots`}
          description="A space will appear here as soon as a vehicle exits."
        />
      )}
    </section>
  );
}

export default function FreeSlotsPage() {
  const [filter, setFilter] = useState("ALL");
  const { data, loading, error, refresh } = useSlotMap();

  if (loading && !data) {
    return <SectionLoader label="Loading free parking slots" />;
  }

  const visibleSections = sectionOrder.filter(
    (section) => filter === "ALL" || section === filter,
  );

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Live slot map"
        title="Free parking slots"
        description="See every available space by section and assign it directly."
        action={
          <button className="button button--secondary" onClick={refresh} disabled={loading}>
            <RefreshCw size={17} className={loading ? "icon-spin" : ""} />
            Refresh slots
          </button>
        }
      />

      {error && <Alert>{error}</Alert>}

      {data && (
        <>
          <section className="slot-summary-grid">
            <article className="slot-summary-card slot-summary-card--total">
              <span><MapPinned size={21} /></span>
              <div><small>All free spaces</small><strong>{data.summary.totalFree}</strong></div>
              <p>of {data.summary.totalCapacity} total</p>
            </article>
            <article className="slot-summary-card slot-summary-card--vip">
              <span><Sparkles size={21} /></span>
              <div><small>VIP available</small><strong>{data.sections.VIP.free}</strong></div>
              <p>{data.sections.VIP.occupied} occupied</p>
            </article>
            <article className="slot-summary-card slot-summary-card--normal">
              <span><CircleParking size={21} /></span>
              <div><small>Normal available</small><strong>{data.sections.NORMAL.free}</strong></div>
              <p>{data.sections.NORMAL.occupied} occupied</p>
            </article>
          </section>

          <div className="slot-view-toolbar">
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
            <span>Last updated {formatDateTime(data.generatedAt)}</span>
          </div>

          <div className="slot-sections">
            {visibleSections.map((section) => (
              <FreeSection section={data.sections[section]} key={section} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
