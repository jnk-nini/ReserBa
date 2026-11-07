# ReserBa

ReserBa is a web-based community amenity booking and schedule conflict detection system for subdivision homeowners associations (HOAs). Residents can check availability and request reservations for amenities such as courts, the clubhouse, the pool, and the gazebo. HOA administrators review requests, record payments, and keep the schedule free of overlaps. The system supports the HOA's current process and does not replace it.

This repository is part of our Software Engineering group project.

## Tech stack

- Next.js (React) with Tailwind CSS
- Supabase (PostgreSQL, authentication, storage)
- Vercel (hosting and automatic deployment)
- FullCalendar, jsPDF, SheetJS

## Getting started

1. Clone the repository and open the folder.
2. Install the packages: `npm install`
3. Copy `.env.example` to `.env.local` and fill in the values. Ask the project leader for the keys.
4. Start the app: `npm run dev`, then open http://localhost:3000

## Team

- Jenny Joy F. Latagan (project leader, main developer)
- Ezekiel V. Dellosa (developer)
- Padme Gwyneth P. Bonus (design and documentation)
- Carl Laurence M. Alcedo (research and testing)

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
