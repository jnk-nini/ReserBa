import ActionForm from "@/components/action-form";
import { saveAmenity } from "@/app/(app)/admin/amenities/actions";
import type { Amenity } from "@/lib/types";

const types = [
  ["court", "Court"],
  ["clubhouse", "Clubhouse or function hall"],
  ["pool", "Swimming pool"],
  ["gazebo", "Gazebo"],
  ["other", "Other"],
];

// The form to add or edit an amenity. Everything an association may want to
// change (hours, buffer, rates, deposit) is a field here, not code.
export default function AmenityForm({ amenity }: { amenity?: Amenity }) {
  return (
    <ActionForm action={saveAmenity} submitLabel={amenity ? "Save changes" : "Add amenity"}>
      {amenity && <input type="hidden" name="amenity_id" value={amenity.amenity_id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="label">
          Name
          <input name="name" required defaultValue={amenity?.name} className="input" placeholder="Clubhouse" />
        </label>
        <label className="label">
          Type
          <select name="type" defaultValue={amenity?.type ?? "court"} className="input">
            {types.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="label">
          Opens at
          <input
            name="open_time"
            type="time"
            required
            step={1800}
            defaultValue={amenity?.open_time.slice(0, 5) ?? "08:00"}
            className="input"
          />
        </label>
        <label className="label">
          Closes at
          <input
            name="close_time"
            type="time"
            required
            step={1800}
            defaultValue={amenity?.close_time.slice(0, 5) ?? "22:00"}
            className="input"
          />
        </label>
        <label className="label">
          Buffer time (minutes)
          <input
            name="buffer_minutes"
            type="number"
            inputMode="numeric"
            min={0}
            step={5}
            required
            defaultValue={amenity?.buffer_minutes ?? 0}
            className="input number"
          />
          <span className="hint">Kept free after each reservation, for cleaning.</span>
        </label>
        <label className="label">
          Security deposit (pesos)
          <input
            name="deposit"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            required
            defaultValue={amenity?.deposit ?? 0}
            className="input number"
          />
        </label>
        <label className="label">
          Resident rate per hour (pesos)
          <input
            name="rate_resident"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            required
            defaultValue={amenity?.rate_resident ?? 0}
            className="input number"
          />
        </label>
        <label className="label">
          Non-resident rate per hour (pesos)
          <input
            name="rate_nonresident"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            required
            defaultValue={amenity?.rate_nonresident ?? 0}
            className="input number"
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-base">
        <input name="is_active" type="checkbox" defaultChecked={amenity?.is_active ?? true} className="size-5" />
        Open for booking
      </label>
    </ActionForm>
  );
}
