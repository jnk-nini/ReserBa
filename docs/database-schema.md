# ReserBa Database Schema (draft for T18)

Status: draft for review. Jenny finalizes it, Ezekiel reviews it, and Gwyneth draws the ERD (T21) from it.

Source: Chapter III of the paper (Figure 6, Database Rules) and Appendix C (data dictionary), with the 30 conflict tests of Appendix D used as the check list. Where this draft adds a column or changes something the paper says, it is marked **(added)** or listed in "Open decisions" at the end.

## 1. How the data fits together

- Supabase Auth keeps the login (email and hashed password) in its own table, `auth.users`. Our table `users` holds everything else about a person and shares the same id.
- A **user** makes many **reservations**. An **amenity** has many reservations and many **blocked dates**.
- A reservation has many **reservation_equipment** lines (equipment and quantity) and many **payments**. An income payment produces a **ledger entry**.
- Every administrative change is written to **audit_logs** by a trigger.

```
auth.users 1---1 users 1---* reservations *---1 amenities 1---* blocked_dates
                              |   |
                              |   +---* reservation_equipment *---1 equipment
                              +-------* payments 1---0..1 ledger_entries
audit_logs (written by triggers, points to any table by name and id)
```

Add-on ("Should") tables are marked **optional**: `equipment`, `reservation_equipment`, `ledger_entries`. If time runs short they are the first to be cut, and the Must tables do not depend on them.

General conventions:
- Money is `numeric(10,2)`, never floating point.
- Times are `timestamptz` and are shown in Asia/Manila time on screen.
- Nothing important is deleted. Reservations are cancelled or rejected, payments and ledger entries are voided.
- Every table has Row Level Security turned on (see section 4).
- Every table gets `created_at` **(added)** so reports and the audit log can sort by time.

## 2. Tables in plain words

### users
One row per person with an account (resident, administrator, or guard). Non-resident guests do not get accounts; they are only a name on a reservation.

| Column | Type | Meaning |
|---|---|---|
| user_id | uuid, primary key | Same id as the login in `auth.users` |
| full_name, email, contact_no, address | text | Details given at sign-up |
| role | text | `resident`, `admin`, or `guard`. Defaults to `resident` |
| resident_type | text | `homeowner` or `tenant`. Set by the administrator when verifying |
| residency_status | text | `pending` (new), `verified`, or `rejected`. Defaults to `pending` |
| consent_at | timestamptz | When the privacy notice was accepted. Sign-up fails if empty (RA 10173) |
| proof_of_residency_url | text | Path of the proof file in the private bucket (not a public link) |

Notes:
- A new sign-up always becomes `resident` + `pending`. A person can never choose or change their own role or status; only an administrator can. The first administrator is set by hand in the Supabase dashboard.
- Only a `verified` resident can submit a reservation request.

### amenities
Things that can be reserved (court, clubhouse, pool, gazebo). Every rule an association may want to change lives here as a setting, not in the code.

| Column | Type | Meaning |
|---|---|---|
| amenity_id | bigint, primary key | |
| name, type | text | For example "Clubhouse", type `clubhouse` |
| open_time, close_time | time | Daily operating hours |
| buffer_minutes | integer, 0 or more | Minutes that must stay free after each reservation |
| rate_resident, rate_nonresident | numeric(10,2) | Hourly rates |
| deposit | numeric(10,2) | Security deposit |
| is_active | boolean | `false` hides it from booking without deleting history |

### reservations
The heart of the system. One row per request, whether it came from a resident or was encoded by an administrator.

| Column | Type | Meaning |
|---|---|---|
| reservation_id | bigint, primary key | |
| reference_no | text, unique | Code given when the reservation is approved, for example `RB-0013`. Empty until then |
| amenity_id | foreign key | The amenity reserved |
| user_id | foreign key, may be empty | The resident who asked. Empty only for a walk-in guest with no sponsor |
| guest_name | text, may be empty | Filled when the user is a non-resident guest (sponsored or walk-in). Filled means the non-resident rate applies |
| created_by | foreign key **(added)** | Who entered the record: the resident themselves, or the administrator for a walk-in |
| start_at, end_at | timestamptz | The booked time. `end_at` must be later than `start_at` |
| occupied_until | timestamptz **(added)** | `end_at` plus the amenity's buffer. Filled by the database, never typed. See rule 1 |
| status | text | `pending`, `approved`, `rejected`, or `cancelled` |
| total_fee | numeric(10,2) | Fee computed by the back end from rate, hours, equipment, and resident type |
| deposit | numeric(10,2) **(added)** | Deposit at the time of booking, copied so a later rate change does not alter old bookings |
| reject_reason | text | Required when status is `rejected` |

### blocked_dates
Ranges the association reserves for itself (assembly, repairs). Customers cannot book over them.

| Column | Type | Meaning |
|---|---|---|
| block_id | bigint, primary key | |
| amenity_id | foreign key | Which amenity is blocked |
| start_at, end_at, reason | timestamptz, timestamptz, text | The range and why |
| created_by | foreign key **(added)** | The administrator who added it |

### equipment (optional)
Lendable items such as tables, chairs, and a sound system.

| Column | Type | Meaning |
|---|---|---|
| equipment_id | bigint, primary key | |
| name | text | |
| total_quantity | integer, 0 or more | Units the association owns |
| rate | numeric(10,2) | Rental rate |
| condition | text | Current condition |

### reservation_equipment (optional)
Which equipment a reservation asks for. One row per item per reservation.

| Column | Type | Meaning |
|---|---|---|
| id | bigint, primary key | |
| reservation_id, equipment_id | foreign keys | The reservation and the item (the pair is unique) |
| quantity | integer, more than 0 | Units requested |
| lent_at, returned_at | timestamptz | Recorded by the administrator when handed out and returned |
| return_condition | text | Condition on return |

### payments
Money received for a reservation. A resident uploads proof, then the administrator records the payment.

| Column | Type | Meaning |
|---|---|---|
| payment_id | bigint, primary key | |
| reservation_id | foreign key | Reservation paid |
| recorded_by | foreign key, may be empty | Administrator who confirmed it. Empty while only the resident's proof exists |
| kind | text **(added)** | `fee` or `deposit`, so the two are not mixed in reports |
| amount | numeric(10,2) | |
| method | text | `cash` or `e-wallet` |
| status | text | `submitted` (proof uploaded, not yet checked), `recorded` (confirmed by an administrator), or `void` **(added)** |
| void_reason | text **(added)** | Required when `void`. Payments are voided, never deleted |
| paid_at | timestamptz | Date of payment |
| proof_url | text | Path of the proof in the private bucket |

### ledger_entries (optional)
The amenity fund monitor: income from payments plus expenses typed in by an administrator. It is a monitoring tool, not the HOA's official books.

| Column | Type | Meaning |
|---|---|---|
| entry_id | bigint, primary key | |
| entry_type | text | `income` or `expense` |
| amount, entry_date | numeric(10,2), date | |
| description | text **(added)** | What an expense was for. Needed for the expense report |
| amenity_id | foreign key, may be empty | Related amenity |
| payment_id | foreign key, may be empty | Required for income, must be empty for expense |
| is_void, void_reason | boolean, text | Voided with a reason, never deleted |

### audit_logs
The record of who did what. Nobody edits or deletes it.

| Column | Type | Meaning |
|---|---|---|
| log_id | bigint, primary key | |
| user_id | foreign key | Who did it |
| action | text | For example `approve_reservation`, `record_payment`, `void_ledger_entry` |
| table_name, record_id | text | Which table and which row (id stored as text because tables use different id types) |
| details | jsonb | The old and new values |
| created_at | timestamptz | When |

## 3. The four database rules

These are enforced by Postgres itself, so they hold even if two people click at the same moment or a screen has a bug.

### Rule 1: no overlap, including the buffer (FR-11, FR-12; tests T01 to T26)
Each `pending` or `approved` reservation occupies the range from `start_at` up to `occupied_until` (its end plus the amenity's buffer). An exclusion constraint on `reservations` refuses two such reservations of the same amenity whose ranges overlap. Rejected and cancelled reservations are not in the constraint, so they free their time (T15, T16).

In plain terms: `EXCLUDE USING gist (amenity_id WITH =, tstzrange(start_at, occupied_until) WITH &&) WHERE (status IN ('pending','approved'))`. It needs the `btree_gist` extension.

Why `occupied_until` is a stored column: an exclusion constraint cannot look into another table, so the buffer is copied from `amenities` into the reservation by a trigger when the row is saved.

Hand check against the tests (clubhouse buffer 60, existing 14:00 to 18:00, so it occupies until 19:00):

| Test | New booking | Occupies | Result |
|---|---|---|---|
| T07 | 18:00 to 20:00 | 18:00 to 21:00 | overlaps 14:00 to 19:00, rejected |
| T09 | 19:00 to 21:00 | 19:00 to 22:00 | starts exactly when the old one is free, accepted |
| T10 | 10:00 to 13:30 | 10:00 to 14:30 | overlaps, rejected |
| T11 | 10:00 to 13:00 | 10:00 to 14:00 | ends exactly when the old one starts, accepted |
| T06 (court, buffer 0) | 16:00 to 18:00 after 14:00 to 16:00 | 16:00 to 18:00 | no overlap, accepted |

Ranges are half open (the end moment itself is free), which is what makes T09 and T11 pass.

A time range is a single timestamp interval, so a booking from 22:00 to 02:00 next day needs no special handling in this rule (T26). It is rejected by the hours check below because it passes closing time.

Other checks done by triggers when a reservation is saved:
- **Blocked dates (T17, T18, T24):** the occupied range must not overlap any `blocked_dates` row of the same amenity. The same check runs again when the status changes to `approved`, so an approval is refused if a block was added after the request was made.
- **Operating hours (T19, T20, T26):** start and end must fall inside `open_time` and `close_time` (Asia/Manila time) on one calendar day.
- **Time order and past dates (T21, T22):** `end_at` later than `start_at`; a new request cannot start in the past. (The past-date test is a trigger, not a table check, because "now" changes.)
- **Walk-ins (T25):** administrator-encoded reservations go through the same table, so the same rules apply.

### Rule 2: equipment quantity (optional; FR-13; tests T27 to T30)
When a row is added to `reservation_equipment`, a trigger first locks that equipment row, then adds the units already committed in other `pending` or `approved` reservations whose time ranges overlap this one. If committed plus requested is more than `total_quantity`, it refuses. The lock makes two simultaneous requests wait for each other, so the last units cannot be taken twice (T30). Conservative by design: it may refuse something that would have fit, but never allows more than the association owns.

### Rule 3: Row Level Security (section 4)

### Rule 4: audit triggers, void instead of delete
Triggers on `reservations`, `payments`, `ledger_entries`, `amenities`, `blocked_dates`, `equipment`, and `users` (role or status changes) write a row to `audit_logs`. Application code cannot skip them. `payments` and `ledger_entries` have no delete permission for anybody; the screens only offer "void".

## 4. Who can see and change what (Row Level Security)

Every table has RLS on. Plain-word version of the policies:

| Table | Resident | Administrator | Guard |
|---|---|---|---|
| users | Read and edit own row (not role, residency_status, resident_type) | Read all, edit all | Nothing |
| amenities | Read active ones | Everything | Read |
| reservations | Read own. Insert own as `pending`. May change own `pending` to `cancelled` only | Everything | Read approved ones for today only |
| blocked_dates | Nothing directly (sees them through the availability view) | Everything | Nothing |
| reservation_equipment | Read and insert for own `pending` reservation | Everything | Nothing |
| equipment | Read | Everything | Nothing |
| payments | Read own, insert own `submitted` proof | Everything (void only, no delete) | Nothing |
| ledger_entries | Nothing directly (sees the summary view) | Everything (void only, no delete) | Nothing |
| audit_logs | Nothing | Read only | Nothing |

Two **views** are needed so residents and guards see only what they should:
- `availability`: for each amenity, the occupied ranges of `pending`/`approved` reservations and blocked dates, with no names. Powers the calendar (FR-09). Visible to all signed-in users.
- `fund_summary` (optional): monthly income and expense totals from non-void ledger entries. Read-only for residents (FR-23).
- Guard lookup: a view or function returning today's approved reservations with reference number, amenity, time, and the resident's name, nothing else (FR-27, FR-28).

The paper says residents read "their own household". There is no household table, so this draft means "their own rows" (see open decision 2).

## 5. Private file storage

| Bucket | Holds | Who may upload | Who may open |
|---|---|---|---|
| residency-proofs | Proof of residency | The resident, into a folder named with their user id | The owner and administrators |
| payment-proofs | Proof of payment | The resident, same folder pattern | The owner and administrators |

Both buckets are private. Files are opened only through signed links that expire (about 5 minutes). The database stores the path, not a link.

## 6. Other small decisions already made in this draft

- **Reference number:** `RB-` plus a sequence number of at least 4 digits (`RB-0013`, the format shown in Figure 8), created by the database when status becomes `approved`. Pending requests have no reference number yet; screens show the request by its own id until approval. Short enough for a guard to read out and type in under a minute.
- **Time zone:** all comparisons for operating hours use Asia/Manila.
- **Sign-up:** a trigger creates the `users` row when Supabase Auth creates the login, reading name, contact, address, and consent from the sign-up form data. A sign-up without consent is refused.
- **Rates are copied, not linked:** `total_fee` and `deposit` are saved on the reservation, so changing a rate later does not change old reports.
- **The database computes the fee (changed while writing the migrations):** `total_fee` is hours times the hourly rate (non-resident rate when `guest_name` is filled), plus equipment if that add-on exists. A resident cannot type their own price, because the trigger overwrites whatever the screen sends. Part hours are charged in proportion.
- **A saved reservation is not edited:** after it is created only `status` and `reject_reason` change. To change the time, cancel and make a new request. This keeps the overlap, hours, and fee checks simple, because they only run when the row is created and when it is approved.
- **Status moves:** `pending` can become `approved`, `rejected`, or `cancelled`; `approved` can become `cancelled`; `rejected` and `cancelled` are final. A resident can only cancel their own `pending` request.
- **Sign-up form data:** the database reads `full_name`, `contact_no`, `address`, and `consent` (must be `true`) from the sign-up user data.

## 7. Open decisions for Jenny

All seven are settled (Jenny, Nov 8). The migrations in `supabase/migrations` follow them.

1. **Blocked dates: separate table or stored as reservations?** DECIDED: separate `blocked_dates` table with trigger checks. The paper's Database Rules said blocked dates are "stored as reservations that belong to the HOA", but Figure 6, the data dictionary, and tests T17, T18, and T24 all use a separate table, so that sentence in the paper is the one to correct.
2. **"Household" in Row Level Security.** DECIDED: a resident sees only their own rows. A real household (several accounts sharing records) would need one more table.
3. **Block over an existing booking.** DECIDED: adding a block over an `approved` reservation is refused; over a `pending` one it is allowed and the request can then only be rejected (test T24 needs this).
4. **Payment statuses and deposit.** DECIDED: `submitted`, `recorded`, `void`, plus a `kind` column (`fee` or `deposit`). Only fee payments create income ledger entries. Deposit refunds are not modelled, to keep the scope small.
5. **Standing of a homeowner.** DECIDED: `verified` means in good standing; the administrator sets `rejected` otherwise. There is no separate field.
6. **Guard confirmation.** DECIDED: the guard only looks up and sees the details (read-only, as the paper says). Nothing is recorded when a guard "confirms".
7. **Cut line for the add-ons.** DECIDED: equipment, ledger, and guard view each live in their own last migration file, so they can be dropped without touching the Must tables. The cut itself is decided on Nov 17, after the dates from T07 are known.

## 8. What this feeds

- T21 Gwyneth: ERD from section 2.
- T26 Jenny: migration files in `supabase/migrations`, in this order: `users` (with the extension and sign-up trigger), `amenities`, `blocked_dates`, `reservations` (constraint and triggers), `payments`, audit log and its triggers, the `availability` view, the Row Level Security policies, the storage buckets, then the three optional files (equipment, ledger, guard lookup).
- Ezekiel's screens: see `docs/module-specs.md`.
