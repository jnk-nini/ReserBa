// Money is shown in pesos with two decimals, for example ₱1,250.00.
const pesos = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

export function formatMoney(amount: number | string | null | undefined) {
  return pesos.format(Number(amount ?? 0));
}

// Adds amounts in centavos so that 0.10 + 0.20 is exactly 0.30.
export function sumMoney(amounts: Array<number | string>) {
  const centavos = amounts.reduce<number>((total, amount) => total + Math.round(Number(amount) * 100), 0);
  return centavos / 100;
}

// The same fee rule the database uses: hours times the hourly rate, part hours
// in proportion, plus equipment. Used only to preview the fee on the booking
// form. The database computes the saved fee by itself.
export function previewFee(minutes: number, hourlyRate: number, equipmentTotal: number) {
  return Math.round((minutes / 60) * Number(hourlyRate) * 100) / 100 + equipmentTotal;
}
