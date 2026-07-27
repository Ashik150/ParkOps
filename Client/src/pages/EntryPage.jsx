import {
  CarFront,
  CheckCircle2,
  CircleParking,
  Crown,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { Alert, SectionLoader } from "../components/Feedback";
import PageHeader from "../components/PageHeader";

const initialForm = {
  slotType: "NORMAL",
  slotNumber: "",
  vehicleNumber: "",
  vehicleType: "SEDAN",
  phoneNumber: "",
};

const vehicleTypes = [
  ["SEDAN", "Sedan"],
  ["SUV", "SUV"],
  ["HATCHBACK", "Hatchback"],
  ["MICROBUS", "Microbus"],
  ["TRUCK", "Truck"],
  ["MOTORCYCLE", "Motorcycle"],
  ["OTHER", "Other"],
];

export default function EntryPage() {
  const [form, setForm] = useState(initialForm);
  const [availability, setAvailability] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadAvailability = useCallback(async (slotType) => {
    setLoadingSlots(true);
    setFeedback(null);

    try {
      const payload = await apiRequest(`/parking/availability?slotType=${slotType}`);
      setAvailability(payload);
    } catch (requestError) {
      setFeedback({ type: "error", message: requestError.message });
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    loadAvailability(form.slotType);
  }, [form.slotType, loadAvailability]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const chooseSlotType = (slotType) => {
    setForm((current) => ({ ...current, slotType, slotNumber: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const payload = await apiRequest("/parking/entries", {
        method: "POST",
        body: form,
      });
      setFeedback({ type: "success", message: payload.message });
      setForm((current) => ({
        ...initialForm,
        slotType: current.slotType,
      }));
      await loadAvailability(form.slotType);
    } catch (requestError) {
      setFeedback({ type: "error", message: requestError.message });
      await loadAvailability(form.slotType);
    } finally {
      setSubmitting(false);
    }
  };

  const noSlots = availability && availability.availableSlots.length === 0;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Entry gate"
        title="Register vehicle entry"
        description="Assign an available space and record the driver’s details."
      />

      <div className="form-layout">
        <form className="panel entry-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-section__heading">
              <span>1</span>
              <div><h2>Choose parking category</h2><p>Availability updates automatically.</p></div>
            </div>
            <div className="slot-type-selector">
              <button
                type="button"
                className={form.slotType === "NORMAL" ? "selected" : ""}
                onClick={() => chooseSlotType("NORMAL")}
              >
                <span><CircleParking size={22} /></span>
                <div><strong>Normal parking</strong><small>Standard access</small></div>
                <i />
              </button>
              <button
                type="button"
                className={form.slotType === "VIP" ? "selected" : ""}
                onClick={() => chooseSlotType("VIP")}
              >
                <span><Crown size={22} /></span>
                <div><strong>VIP parking</strong><small>Priority spaces</small></div>
                <i />
              </button>
            </div>
          </div>

          <div className="form-divider" />

          <div className="form-section">
            <div className="form-section__heading">
              <span>2</span>
              <div><h2>Vehicle and slot details</h2><p>All fields are required.</p></div>
            </div>

            {feedback && <Alert type={feedback.type}>{feedback.message}</Alert>}

            <div className="form-grid">
              <label className="field">
                <span>Vehicle number</span>
                <div className="input-with-icon">
                  <CarFront size={18} />
                  <input
                    name="vehicleNumber"
                    value={form.vehicleNumber}
                    onChange={updateField}
                    placeholder="DHAKA METRO GA-12-3456"
                    maxLength={30}
                    required
                  />
                </div>
                <small>Must be unique among active vehicles.</small>
              </label>

              <label className="field">
                <span>Available slot</span>
                {loadingSlots ? (
                  <div className="field-loading"><span className="spinner" />Checking spaces...</div>
                ) : (
                  <select
                    name="slotNumber"
                    value={form.slotNumber}
                    onChange={updateField}
                    disabled={noSlots}
                    required
                  >
                    <option value="">{noSlots ? "No slots available" : "Select a slot"}</option>
                    {availability?.availableSlots.map((slot) => (
                      <option value={slot} key={slot}>
                        {form.slotType === "VIP" ? "V" : "N"}-{String(slot).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                )}
              </label>

              <label className="field">
                <span>Vehicle type</span>
                <select name="vehicleType" value={form.vehicleType} onChange={updateField} required>
                  {vehicleTypes.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                </select>
              </label>

              <label className="field">
                <span>Phone number</span>
                <div className="input-with-icon">
                  <Phone size={18} />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={updateField}
                    placeholder="+880 1XXX XXXXXX"
                    required
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setForm((current) => ({ ...initialForm, slotType: current.slotType }))}
            >
              Clear form
            </button>
            <button className="button button--primary" disabled={submitting || loadingSlots || noSlots}>
              {submitting ? <><span className="spinner spinner--light" />Saving entry</> : <><CheckCircle2 size={18} />Confirm vehicle entry</>}
            </button>
          </div>
        </form>

        <aside className="entry-aside">
          <div className={`availability-card availability-card--${form.slotType.toLowerCase()}`}>
            <div className="availability-card__header">
              <span>{form.slotType === "VIP" ? <Crown size={21} /> : <CircleParking size={21} />}</span>
              <div><small>Selected category</small><strong>{form.slotType} parking</strong></div>
            </div>
            {loadingSlots ? (
              <SectionLoader label="Checking availability" />
            ) : (
              <>
                <strong className="availability-card__number">{availability?.availableSlots.length || 0}</strong>
                <span className="availability-card__label">spaces available now</span>
                <div className="availability-card__bar">
                  <span style={{ width: `${availability?.capacity ? ((availability.availableSlots.length / availability.capacity) * 100) : 0}%` }} />
                </div>
                <small>{availability?.occupied || 0} of {availability?.capacity || 0} spaces occupied</small>
              </>
            )}
          </div>
          <div className="info-card">
            <ShieldCheck size={21} />
            <div><strong>Automatic validation</strong><p>ParkOps prevents duplicate vehicle numbers and double-booked spaces.</p></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
