import { CarFront } from "lucide-react";

export default function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? "brand--compact" : ""}`}>
      <span className="brand__mark">
        <CarFront size={23} strokeWidth={2.2} />
      </span>
      <span className="brand__text">
        <strong>ParkOps</strong>
        {!compact && <small>Gate control system</small>}
      </span>
    </div>
  );
}
