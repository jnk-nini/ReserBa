# Module specs for Ezekiel (draft for T18)

One short spec per module Ezekiel builds. Table and column names match `docs/database-schema.md`. Jenny builds the database rules, login, calendar, booking form, and approval queue; these modules sit on top of them.

Common to every module:
- Phone first: check every screen at phone width before calling it done.
- Never trust the screen alone. If the database refuses something, show its reason in plain words.
- Never delete payments or ledger entries; use void with a reason.
- Open uploaded proofs only through a signed link that expires.
- Each module is reviewed by someone other than its author.

Priority: **Must** modules first. **Optional** modules (add-ons) only after the Musts work.

---

## 1. Verify residents (T28, Must)
**Who:** administrator. **Tables:** reads and updates `users`. **Files:** reads `residency-proofs`.
- List of accounts with `residency_status = pending`, newest first.
- Detail view: name, address, contact, resident type, and the proof file (signed link).
- Actions: **Verify** (administrator picks `homeowner` or `tenant`) or **Reject** (the reason is required by the screen and saved in `users.residency_note` in the same update as the status; the audit log picks it up by itself).
- Rules: only `verified` residents can submit requests. An administrator cannot change their own role from this screen.
- Done when: a new sign-up appears in the list, can be verified, and then can book; the change shows in the audit log.

## 2. Amenities, rates, and blocked dates (T29, Must)
**Who:** administrator. **Tables:** `amenities`, `blocked_dates`.
- Amenity form: name, type, open and close time, buffer minutes, resident rate, non-resident rate, deposit, active switch.
- Blocked dates: pick amenity, start, end, reason. List with a remove button.
- Rules: `close_time` later than `open_time`; buffer and money cannot be negative; hide with `is_active`, do not delete an amenity that has reservations. A block that overlaps an approved reservation is refused by the database; show that message.
- Done when: an amenity can be created and edited, a block makes the calendar slot unavailable, and both are audited.

## 3. Walk-in and guest reservations (T33, Must)
**Who:** administrator. **Tables:** inserts into `reservations` (and `reservation_equipment` if optional equipment is used).
- Form: amenity, date, start and end, guest name, optional sponsor resident, optional equipment.
- Saves with `created_by` = the administrator and `guest_name` filled. A filled `guest_name` means the non-resident rate applies, whether or not a sponsor resident is chosen.
- Uses the same insert and the same conflict message as Jenny's booking form. Do not copy the conflict logic; call the shared function.
- Done when: test T25 (walk-in overlapping an approved booking) is rejected and a free slot is saved with a reference number after approval.

## 4. Payments and reference number (T34, T35, Must)
**Who:** resident uploads proof (Jenny's booking flow shows the upload), administrator records. **Tables:** `payments`, `reservations`. **Files:** `payment-proofs`.
- Administrator screen: reservation with its fee and deposit, proof file (signed link), and a **Record payment** form (amount, `fee` or `deposit`, `cash` or `e-wallet`, date).
- A resident's proof appears as `submitted`; recording changes it to `recorded` and fills `recorded_by`.
- **Void** instead of delete, with a reason.
- Slip (T35): printable page for an `approved` reservation showing reference number, amenity, date and time, fee, deposit, and paid status.
- Done when: a payment can be recorded and voided, the slip prints on one page, and every action is audited.

## 5. Reports (T36, Must)
**Who:** administrator. **Tables:** reads `reservations`, `payments`, and `ledger_entries` (if built).
- Month picker. **Booking report:** reservations per amenity with status counts. **Income and expense report:** fee and deposit payments (not void) and, if the ledger exists, expenses.
- Export to PDF (jsPDF) and Excel (SheetJS). Totals must equal the sum of the rows.
- Done when: a report for one month opens in under 1 minute and both files open correctly.

## 6. Audit log screen (T37, Must)
**Who:** administrator, read-only. **Tables:** reads `audit_logs`.
- Table of time, person, action, table, record id, filters by date, user, and action. Details expand to show old and new values.
- No edit and no delete buttons anywhere.
- Done when: approving a request, recording a payment, and verifying a resident each show up as a row without any code in the screen writing it.

## 7. Equipment screen (T39, optional)
**Who:** administrator. **Tables:** `equipment`, `reservation_equipment`.
- Inventory list: name, total quantity, rate, condition; add and edit.
- On a reservation: mark **lent** and **returned** with return condition.
- Done when: the quantity limit message from the database (tests T27 to T30) is shown clearly.

## 8. Fund ledger (T40, optional)
**Who:** administrator edits, residents see a read-only monthly summary. **Tables:** `ledger_entries`, `fund_summary` view.
- Income entries come from recorded fee payments; expenses are typed (date, amount, description).
- **Void** with a reason, never delete. Voided entries stay visible but are not counted.
- Not the HOA's official books: no dues, penalties, or delinquency lists.
- Done when: totals for a month match the report, and a voided entry drops out of the total.

## 9. Guard view (T41, optional)
**Who:** guard, read-only. **Tables:** the guard lookup view.
- List of today's approved reservations (time, amenity, resident name, reference number).
- Search box for a reference number; shows valid with details, or "not found / not approved / not today".
- No buttons that change data.
- Done when: a guard finds a reservation by its reference number in under 1 minute on a phone.
