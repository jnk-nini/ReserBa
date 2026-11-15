# ReserBa project status

Last updated: Nov 15, 2026. Read this first when picking the work back up.

## Where things are

| Thing | Where |
|---|---|
| Code | github.com/jnk-nini/ReserBa (pull requests into `main`) |
| Hosting | Vercel project `reserba` in the `cdc-are` team. Every push gets a preview; `main` is production. The two Supabase keys are set for Preview and Production. |
| Database | Supabase project "ReserBa" (Singapore, Postgres 17). All 14 migrations in `supabase/migrations` are applied. |
| Paper and tracker | The Google Doc (Chapters I to V) and the "ReserBa Task Tracker" sheet |

## What is built

Every functional requirement of Appendix B (FR-01 to FR-30) has a screen.

| Area | Screens | Requirements |
|---|---|---|
| Accounts | `/signup`, `/login`, `/forgot-password`, `/reset-password`, `/account` | FR-01 to FR-03, FR-05 |
| Resident | `/home`, `/calendar`, `/book`, `/reservations`, `/reservations/[id]`, slip, `/fund` | FR-09 to FR-15, FR-18, FR-19, FR-23 |
| Administrator | `/admin` (dashboard), `/admin/requests`, `/admin/requests/[id]`, `/admin/walk-in`, `/admin/residents`, `/admin/amenities`, `/admin/equipment`, `/admin/ledger`, `/admin/reports`, `/admin/audit` | FR-04, FR-06 to FR-08, FR-16, FR-17, FR-20 to FR-22, FR-24 to FR-26, FR-30 |
| Guard | `/guard` | FR-27, FR-28 |

Tracker tasks this covers: T25 to T41 (development). T42 (phone check) was done once for every screen at 390 px wide; repeat it on real phones.

## Design update (Nov 16)

- **Look.** Warm stone background, deep evergreen as the one brand colour, a small brass accent for rules and labels. Titles use a serif (Cormorant Garamond); forms, tables, and buttons use a plain sans (Hanken Grotesk). All colours, corners, and shadows are named once in `src/app/globals.css`.
- **Logo.** An arched gate with two leaves that stand side by side without touching: two bookings that do not overlap. The drawing is in `src/components/logo.tsx`; the browser icon, home screen icons, and the picture for shared links are in `src/app` and `public`.
- **First page.** Laid out like a printed notice: large serif lines and hairline rules instead of boxes.
- **Resident home (`/home`).** New first screen for residents: the next reservation with its number, what else is coming up, and the amenities with a Book link.
- **Account and log out on a phone.** The round button with the initials in the top bar opens the account link and the log out button. Before this, residents and guards had no log out button on a phone.
- **Booking form.** The day strip sits under the day, and start times are grouped into morning, afternoon, and evening.
- **Reservation screen.** Shows the three steps of a request (sent, payment, HOA decision) and the fee still to pay.
- **Questions before something that cannot be undone** now open in a box with the look of the system, not the browser's own box.
- **Fixed.** The calendar no longer shows a mismatch warning when it loads on a phone.

## Speed update (Nov 16)

Every click felt slow because the pages ran in Vercel's default region (United States) while the database is in Singapore, and each page asked Supabase who was signed in two times before reading its data.

- `vercel.json` now runs the pages in Singapore (`sin1`), beside the database.
- The login is checked from its signature (`getClaims`) in `src/proxy.ts` and `src/lib/auth.ts`, which saves the trips to the Supabase server where the project uses the newer signing keys.
- `src/app/(app)/loading.tsx` shows grey blocks at once when a screen is opened, so a tap always gets an answer.
- The week calendar library is in `src/components/week-calendar.tsx` and is downloaded only on a computer. A phone no longer loads it or asks for the same schedule twice.

## How it was checked (Nov 15)

- `supabase/tests/database_rules_test.sql`: 75 checks pass (the 30 conflict cases, fee checks, role access checks).
- `supabase/tests/simultaneous_test.sh`: T23 and T30 pass with two real connections.
- Full flow in a browser against the Supabase project: sign in as each role, upload proof of residency, verify a resident, book with equipment, see the conflict message, upload proof of payment, record it, approve, open the slip, block a date, encode a walk-in, add an expense, export both reports to PDF and Excel, read the audit log, check a reference number as guard.
- `npm run lint` and `npm run build` finish without errors.

## Sample data in the Supabase project

Three amenities (Clubhouse, Basketball Court, Swimming Pool), three equipment items, and five demo accounts (`demo.admin`, `demo.guard`, `demo.ana`, `demo.ben`, `demo.carla`, all `@reserba.test`). Jenny has the password. A few sample reservations, payments, and one expense exist from the checks above. Remove or replace them before the survey (T43, T51).

## Known gaps and decisions still open

Things to do in the dashboards (not code):

1. **Supabase, Authentication, URL Configuration.** Set the Site URL to the deployed address and add `/auth/callback` to the Redirect URLs. Until then the confirmation and password reset links do not return to the app.
2. **Supabase email.** The built-in email service sends only a few emails per hour. For the survey (about 30 sign-ups), either turn off "Confirm email" or add an SMTP provider.
3. **Vercel, Deployment Protection.** Vercel Authentication is still on, so outsiders get a Vercel login page. Turn it off before the survey and demo.
4. **Supabase, leaked password protection** is off. Turn it on (Authentication, Passwords).
5. **Supabase function `rls_auto_enable`** exists in the project but is not in the migrations and can be called by anyone. Check where it came from; drop it or revoke its execute permission.

Things in the system that are limits, not bugs:

6. A request that is waiting holds its time until the administrator decides. There is no automatic expiry, no limit on how many requests one resident can hold, and no limit on how far ahead someone can book.
7. An amenity cannot close after midnight. Operating hours are within one calendar day.
8. Deposit refunds are not recorded (decided Nov 8). A deposit payment can only be recorded or voided.
9. Cancelling an approved reservation does not void its payments. The administrator voids them by hand.
10. Lowering an equipment item's quantity below what is already requested is not checked.
11. The administrator can approve a request without any payment recorded. This is on purpose: payment rules belong to the association.
12. The password reset link must be opened in the same browser that asked for it.
13. `npm audit` reports the `xlsx` package (SheetJS on npm, version 0.18.5). The reported problems are about reading untrusted spreadsheet files; ReserBa only writes files. SheetJS publishes fixed versions only on its own site (`npm i https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`).
14. The paper's Appendix C (Table 18) still needs the added columns, and now the `request_reservation` function (T18).

## Next steps

- T43: decide the final sample data (10 residents) and clear the test rows.
- T44 to T47: run the tests by hand and fill in Appendix D and the results tables. The SQL test file gives the expected and actual result for each case.
- T51: production setup (items 1 to 5 above).
- T52, T53: user guides and screenshots.
