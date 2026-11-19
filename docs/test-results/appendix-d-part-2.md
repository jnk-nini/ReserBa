# Appendix D results, part 2 (T16 to T30) — task T45

Run on: Nov 19, 2026
Run by: Ezekiel (with Claude Code)
Reviewer: Carl

## How the cases were run

- `supabase/tests/database_rules_test.sql` was run against a fresh PostgreSQL 16.15 database with all
  14 migrations in `supabase/migrations` applied. Supabase's own `auth` and `storage` schemas were
  stood in for by `supabase/tests/local_supabase_stub.sql`.
- The file sets up the data that Appendix D describes (clubhouse 08:00 to 22:00 with a 60-minute
  buffer, a court with no buffer, a pool, 20 tables and 15 chairs) on a date 30 days ahead, runs each
  case as the signed-in resident, guard, or administrator, and then rolls everything back.
- T23 and T30 were also run with two real database connections saving at the same moment
  (`supabase/tests/simultaneous_test.sh`), three times each.
- Result of the whole file: **75 of 75 checks passed** (the 30 conflict cases, 5 fee checks, and 40
  role access checks). Every refusal was checked for its reason, not only for being refused.

**Still to do before this goes in the paper:** the paper says each case is "run against the system".
Run the same SQL file once in the Supabase dashboard (SQL editor, paste the file, Run; it changes
nothing because it rolls back) and confirm the last table still says 75 passed, 0 failed.

## Table 19 rows T16 to T30 (Actual result and Pass / Fail)

| ID | Expected result | Actual result | Pass / Fail |
|---|---|---|---|
| T16 | Accepted | Accepted. A cancelled request does not hold its time. | Pass |
| T17 | Rejected | Rejected: "This time is blocked by the association." | Pass |
| T18 | Rejected | Rejected: "This time is blocked by the association." (Request 08:00 to 08:30; the 60-minute buffer runs into the 09:00 block.) | Pass |
| T19 | Rejected | Rejected: "Outside operating hours (08:00 AM to 10:00 PM)." | Pass |
| T20 | Rejected | Rejected: "Outside operating hours (08:00 AM to 10:00 PM)." | Pass |
| T21 | Rejected | Both rejected: "The end time must be later than the start time." (16:00 to 16:00, and 17:00 to 15:00) | Pass |
| T22 | Rejected | Rejected: "The start time is in the past." | Pass |
| T23 | One accepted, one rejected | One accepted, one rejected by the no-overlap rule. Same result in 3 of 3 runs with two connections saving at the same moment; the second connection waited for the first to finish and was then refused. | Pass |
| T24 | Approval refused | Approval refused: "This time is blocked by the association." | Pass |
| T25 | Rejected | Rejected by the no-overlap rule (the walk-in overlaps the approved 14:00 to 18:00 booking). | Pass |
| T26 | Rejected | Rejected: "Outside operating hours (08:00 AM to 10:00 PM)." A booking must start and end on the same calendar day. | Pass |
| T27 | Accepted | Accepted (10 committed + 10 requested = 20 of 20 tables). | Pass |
| T28 | Rejected | Rejected: "Not enough of this equipment: 10 of 20 already requested for this time." | Pass |
| T29 | Accepted | Accepted (the 20 tables are committed only at 08:00 to 10:00). | Pass |
| T30 | One accepted, one rejected | One accepted, one rejected: "Not enough of this equipment: 10 of 15 already requested for this time." Same result in 3 of 3 runs with two connections at the same moment. | Pass |

No double booking was recorded: every request that would overlap another pending or approved
booking, a blocked date, or the equipment owned was refused.

## Table 11 (summary), all 30 cases

T01 to T15 are part 1 (task T44, Carl). They were run in the same file and also passed; Carl
should still record them in Table 19 as his task asks.

| Group of test cases | Cases run | Passed | Failed |
|---|---|---|---|
| Overlaps and containment (T01–T05) | 5 | 5 | 0 |
| Back-to-back and buffer time (T06–T11) | 6 | 6 | 0 |
| Other amenities, dates, and request status (T12–T16) | 5 | 5 | 0 |
| Blocked dates and operating hours (T17–T22) | 6 | 6 | 0 |
| Simultaneous requests, approval, walk-in, and cross-midnight requests (T23–T26) | 4 | 4 | 0 |
| Equipment quantity (T27–T30) | 4 | 4 | 0 |
| Total | 30 | 30 | 0 |

## Wording fixes suggested for Appendix D (for Jenny to approve)

- **T18:** "New ends 08:30" does not say when it starts. Suggest: "New: Clubhouse 08:00–08:30; block
  starts 09:00." That is what was tested, so the buffer is the only reason for the refusal.
- **T26:** the paper's example (22:00 to 02:00) also starts at closing time. The system refuses any
  booking that crosses midnight, whatever the hours, so the result holds either way.
