# Security checklist (launch check, Nov 19, 2026)

Checked: the code on this branch, all git history, and a local copy of the database built from
`supabase/migrations`. The live Supabase project and the live site could not be reached from the
checking machine. For the live database, run `supabase/tests/security_check.sql` (read-only).

✅ = done · ⚠️ = partly done, needs a decision · 🔧 = fixed in this check

## Security items

| # | Item | Result | Notes |
|---|---|---|---|
| 1 | Hash all passwords | ✅ | Supabase Auth stores passwords hashed. The app never stores them. **Dashboard:** set the minimum password length to 8 (the form asks for 8, but Supabase's own minimum is lower) and turn on leaked-password protection. |
| 2 | Force HTTPS | ✅ 🔧 | Vercel sends HTTP to HTTPS. Added a `Strict-Transport-Security` header so browsers always use HTTPS. |
| 3 | Block XSS | ✅ | No raw HTML anywhere (`dangerouslySetInnerHTML` is not used); React shows user text as plain text. All links point inside the site. Excel export escapes formula-like text (T36). Added `X-Frame-Options: DENY` against click-jacking. |
| 4 | Rate-limit login | ⚠️ | Supabase limits sign-ins to 30 per 5 minutes **per IP**. Login runs on the Vercel server, so Supabase sees Vercel's IP for everyone: all users share one limit. On survey day 30+ logins in 5 minutes could be refused. Choose one: (a) do the login call in the browser so each user has their own limit, (b) raise the limit in the dashboard for the survey, or (c) add CAPTCHA (Turnstile or hCaptcha). |
| 5 | Session cookies HttpOnly and Secure | ⚠️ 🔧 | **Secure: fixed** (checked: the cookie now says `Secure; SameSite=lax`). **HttpOnly: not set, on purpose.** Supabase's SSR library needs the browser to read the cookie, and the upload and calendar code use it. Making it HttpOnly would mean moving those to the server. Item 3 is what protects the cookie. |
| 6 | Limit uploads by type and size | ✅ | JPG, PNG, PDF only; 5 MB; checked in the browser **and** by the storage buckets. Buckets are private, each user can only upload into their own folder, and files open through links that expire in 5 minutes. |
| 7 | Turn off debug mode | ✅ | Production build, no `console.log`, raw database errors are replaced with plain messages. Remove `/check` (a week-1 setup page) from the public pages before launch. |
| 8 | Delete unused packages | ✅ 🔧 | Removed `temporal-polyfill` (not used). `npm audit`: no high-severity problems; 9 moderate ones, in lint tools (not shipped) and in `uuid` code that ExcelJS does not call. Next.js 16.4.5 has the Nov 3, 2026 security fixes. |
| 9 | Scan git history for leaked keys | ✅ | All 73 commits on all branches scanned for Supabase keys, JWTs, database URLs with passwords, private keys, GitHub/AWS/OpenAI tokens. Only match: the `postgres:password@localhost` example in a test comment. No `.env` file was ever committed. (A pattern scan with git, not the gitleaks tool.) |
| 10 | Keep API keys on the server only | ✅ | No secret or service_role key exists anywhere in the code. Only the public anon key is used, which is meant to be public; the database rules protect the data. Supabase plans to retire the old anon keys by the end of 2026: switch to the new publishable key (`sb_publishable_…`) in Vercel soon. |
| 11 | Database access rules (RLS) | ✅ | RLS is on for all 9 tables. Logged-out visitors have no table access. Residents see only their own rows; guards cannot change anything; only admins write amenities, equipment, blocked dates, payments, ledger. All 13 extra-rights functions have a fixed `search_path` and cannot be called while logged out. 75 of 75 rule tests pass. |
| 12 | Recheck prices on the server | ✅ | The database computes the fee and deposit on every booking, overwrites any fee sent by the browser (test F05), and refuses fee or time edits afterwards. |

## Not in the checklist, but found

- ⚠️ **A pending request holds its slot forever, with no limit per resident.** One person could
  request every Saturday and block the calendar. Fix (Jenny, as a new migration): a hold expiry
  (for example 48 hours without proof of payment) and a cap on pending requests per resident.
- **Dashboard tasks from `docs/project-status.md`** still to do: Site URL and redirect URLs, email
  (SMTP or confirmation off), Vercel Deployment Protection off, leaked-password protection on, and
  the unknown `rls_auto_enable` function (the security check SQL flags it).

## Related checks

| Area | Result |
|---|---|
| AI/API cost protection | Not needed: the app calls no paid API. |
| Privacy consent | ✅ Required checkbox at sign-up; the database refuses a sign-up without it and stores `consent_at`. Proof of residency asks for a bill, title, or lease, not a government ID. |
| Privacy notice, terms, deletion | ⚠️ Missing: a full privacy notice page (purpose, what is kept and for how long, who sees it, contact person, how to ask for correction or deletion) and short terms of use. Have the adviser check them against RA 10173. |
| Cookie consent | Not needed for now: the only cookie is the login cookie, and there is no tracking or analytics. |
| Refund policy | The system does not record deposit refunds (decided Nov 8). The HOA should write its refund rule and show it on the booking page. |
| Accessibility | ✅ Public pages (home, login, sign-up, forgot password): 0 automated WCAG A/AA problems (axe), light and dark, phone width; keyboard reaches every field. Signed-in pages were not scanned (they need a real login). |
| Payments and full flow | Database payment rules pass (resident submits, only admin records, no deleting, voiding updates the ledger). The full flow still needs one run on real phones with the live project. |
