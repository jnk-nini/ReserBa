# ReserBa Maintenance Plan (T54)

This plan says who takes care of ReserBa after it is set up, and what they do to keep it working and safe.

## Who owns what

- **The HOA owns the accounts.** The Supabase project (database, logins, files) and the Vercel project (website) should be under an HOA email, not a student's personal email.
- **One HOA officer is the system contact.** This person adds and removes administrators and calls for help when something breaks.
- **One technical helper** (a team member at first, later someone the HOA chooses) does the technical tasks below.

## Every week

- **Make a backup.** The free Supabase plan does not let you download its own backups, so the helper exports a copy of the database every week and keeps it in a private folder the HOA owns.
- **Open the system at least once.** A free Supabase project goes to sleep after 7 days with no use.

## Every month

- **Update the software.** Install the latest small updates for Next.js and the other packages, check that the site still builds, then deploy.
- **Check the reports.** Compare the monthly income and expense report with the payment records. The totals must match.

## Every 3 months, and after every HOA election

- **Review who has access.** Remove administrator and guard accounts of people who are no longer officers or guards.
- **Remove old tenants.** Set tenants who moved out back to unverified.

## When something goes wrong

| Problem | What to do |
|---|---|
| The site is down | Check the Vercel and Supabase dashboards. If Supabase is paused, press Restore. |
| A bug is found | Write down what happened and when, fix it on a new branch, test it, then merge it. |
| Data was lost or damaged | Restore the latest weekly backup. |
| A secret key leaked (for example, pushed to GitHub) | Create new keys in Supabase right away, put them in Vercel, and delete the old ones. |
| Personal data was exposed | The HOA must tell the National Privacy Commission and the affected residents within 72 hours (Data Privacy Act of 2012). |

## Rules that do not change

- Never delete reservations, payments, or audit records. Cancel or void them instead.
- Never put the secret key in the website code or on GitHub.
- Test every change before it goes live.
