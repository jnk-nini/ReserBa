import type { Metadata } from "next";
import ActionForm from "@/components/action-form";
import PageHeader from "@/components/page-header";
import { requireRole } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase-server";
import type { Equipment } from "@/lib/types";
import { saveEquipment } from "./actions";

export const metadata: Metadata = {
  title: "Equipment | ReserBa",
};

function EquipmentFields({ item }: { item?: Equipment }) {
  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <label className="label sm:col-span-2">
        Item
        <input name="name" required defaultValue={item?.name} className="input" placeholder="Monobloc chairs" />
      </label>
      <label className="label">
        Units owned
        <input
          name="total_quantity"
          type="number"
          inputMode="numeric"
          min={0}
          required
          defaultValue={item?.total_quantity}
          className="input number"
        />
      </label>
      <label className="label">
        Rate each (pesos)
        <input
          name="rate"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          required
          defaultValue={item?.rate ?? 0}
          className="input number"
        />
      </label>
      <label className="label sm:col-span-4">
        Condition
        <input name="condition" defaultValue={item?.condition ?? ""} className="input" placeholder="Good" />
      </label>
    </div>
  );
}

export default async function EquipmentPage() {
  await requireRole("admin");
  const supabase = await getServerSupabase();
  const { data } = await supabase.from("equipment").select("*").order("name");
  const items = (data ?? []) as Equipment[];

  return (
    <>
      <PageHeader
        title="Equipment"
        description="Items lent with a reservation. The system never lets more units be requested for one time than the association owns. Lent and returned are marked on each reservation."
      />

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <section key={item.equipment_id} className="panel">
            <ActionForm action={saveEquipment} submitLabel="Save" buttonClass="btn btn-quiet btn-small self-start">
              <input type="hidden" name="equipment_id" value={item.equipment_id} />
              <EquipmentFields item={item} />
            </ActionForm>
          </section>
        ))}

        <section className="panel">
          <h2 className="mb-4 text-base font-semibold">Add an item</h2>
          <ActionForm action={saveEquipment} submitLabel="Add item" buttonClass="btn btn-primary self-start">
            <EquipmentFields />
          </ActionForm>
        </section>
      </div>
    </>
  );
}
