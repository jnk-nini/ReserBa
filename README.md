# ReserBa

ReserBa is a web-based community amenity booking and schedule conflict detection system for subdivision homeowners associations (HOAs). Residents can check availability and request reservations for amenities such as courts, the clubhouse, the pool, and the gazebo. HOA administrators review requests, record payments, and keep the schedule free of overlaps. The system supports the HOA's current process and does not replace it.

This repository is part of our Software Engineering group project.

## Tech stack

- Next.js (React) with Tailwind CSS
- Supabase (PostgreSQL, authentication, storage)
- Vercel (hosting and automatic deployment)
- FullCalendar, jsPDF, SheetJS (the `xlsx` package)

## Getting started

1. Clone the repository and open the folder.
2. Install the packages: `npm install`
3. Copy `.env.example` to `.env.local` and fill in the values. Ask the project leader for the keys.
4. Start the app: `npm run dev`, then open http://localhost:3000

Before a pull request, run `npm run lint` and `npm run build`. Both must finish without errors.

## How the project is organized

| Folder | What is in it |
|---|---|
| `src/app` | The pages. Public pages (`login`, `signup`, password reset) sit at the top. Pages for signed-in people are in `(app)`: resident pages (`home`, `calendar`, `book`, `reservations`, `fund`, `account`), administrator pages (`admin/...`), and the guard page (`guard`). |
| `src/app/**/actions.ts` | Server actions: the code that saves a form. Each one checks who is signed in, sends the change to the database, and returns the database's reason if it refuses. |
| `src/components` | Parts of screens used in more than one place (booking form, day strip, calendar, export buttons). |
| `src/lib` | Helpers: the Supabase clients, dates in Philippine time, money, error messages. |
| `src/proxy.ts` | Runs before every page: keeps the login fresh and sends signed-out visitors to the login page. |
| `supabase/migrations` | The database, in order. See `docs/database-schema.md`. |
| `supabase/tests` | Tests of the database rules. |
| `docs` | The schema, the module specs, and the project status. |

The rules that protect the data (no overlapping reservations, buffer time, blocked dates, operating hours, equipment quantity, who may see what, the audit log) are in the database, not in the pages. The pages only show the result.

## Database

- New database change: add a new file in `supabase/migrations` with a later date in its name. Do not edit a migration that is already applied.
- Apply it in the Supabase SQL editor (or with `supabase db push`), then run the tests.
- Sample amenities and equipment: `supabase/seed.sql`.

### Testing the database rules

`supabase/tests/database_rules_test.sql` runs the 30 conflict cases of Appendix D, the fee checks, and the role access checks. Paste the whole file into the Supabase SQL editor and press Run. It rolls everything back at the end, so nothing stays in the database. Every row of the result must say PASS.

`supabase/tests/simultaneous_test.sh` runs tests T23 and T30 with two connections at the same moment. Use it only on a local or test database.

### First administrator

Everyone who signs up starts as a resident. To make the first administrator, sign up, then run this once in the Supabase SQL editor with that person's email:

```sql
update public.users set role = 'admin' where email = 'the.email@example.com';
```

After that, an administrator can make guard or administrator accounts from the People screen.

### Supabase settings the app needs

In the Supabase dashboard, under Authentication, URL Configuration:

- Site URL: the address of the deployed app.
- Redirect URLs: add `https://<the deployed address>/auth/callback` and `http://localhost:3000/auth/callback`.

Without these, the links in the confirmation and password reset emails do not come back to the app.

## Team

- Jenny Joy F. Latagan (project leader, main developer)
- Ezekiel V. Dellosa (developer)
- Padme Gwyneth P. Bonus (design and documentation)
- Carl Laurence M. Alcedo (design and documentation)

## Group rules

### Branches

- Nobody pushes directly to `main`. Every change goes through a pull request.
- Name branches by type and topic, in lowercase with hyphens:
  - `feature/booking-form`
  - `fix/calendar-overlap`
  - `docs/user-guide`
- Pull the latest `main` before starting a new branch.
- Keep branches small and short-lived to avoid merge conflicts.

### Commit messages

- Write a short sentence that starts with a verb, for example `Add booking form` or `Fix buffer time check`.
- One commit should do one thing.
- Commits use each member's own name and email.

### Secrets

- Never put keys, passwords, or tokens in GitHub. This includes code, comments, and screenshots.
- Keys live in `.env.local` (on your computer) and in the Vercel project settings.
- `.env.local` is ignored by Git. Only `.env.example` (with empty values) is committed.
- Share keys with teammates privately, one to one. Never post them in a public place.

### Definition of done

A task is done when:

1. It works as described in the task tracker.
2. The author tested it, including on a phone screen.
3. One other member (the reviewer in the tracker) checked it and approved the pull request.

### Before every push

- Look through your changes (`git diff`) for secrets, debug code, test text, and leftover notes.
- Make sure every line of code is something you can explain to the group.
- Fix any problem before you open the pull request.
