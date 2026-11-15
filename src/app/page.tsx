import Link from "next/link";
import Accordion from "@/components/accordion";
import Icon from "@/components/icons";
import DayStrip, { type StripSegment } from "@/components/day-strip";
import Logo from "@/components/logo";
import StatusBadge from "@/components/status-badge";
import TryATime from "@/components/try-a-time";

// The first page a visitor sees. It says what ReserBa is for, lets the visitor
// try a time on a sample day, and leads to log in or sign up. Every number and
// name in the previews is a sample, not real data.

const sampleReservations = [
  { amenity: "Clubhouse", when: "Sat, Nov 21 · 2:00 PM to 6:00 PM", number: "RB-0013", status: "approved" },
  { amenity: "Basketball court", when: "Sun, Nov 22 · 4:00 PM to 6:00 PM", number: "Request 41", status: "pending" },
  { amenity: "Swimming pool", when: "Sat, Nov 28 · 9:00 AM to 12:00 PM", number: "Request 44", status: "pending" },
];

const sampleWaiting = [
  { count: 4, label: "requests to decide" },
  { count: 2, label: "residents to verify" },
  { count: 1, label: "payment proof to check" },
];

const rules = [
  { icon: "overlap", title: "No double booking", text: "Two reservations never share the same time." },
  { icon: "buffer", title: "Buffer time", text: "Minutes are kept free after each booking for cleaning." },
  { icon: "blocked", title: "Blocked dates", text: "The HOA closes a day once. Nobody can book it." },
  { icon: "hours", title: "Operating hours", text: "Requests stay inside each amenity's open hours." },
  { icon: "equipment", title: "Equipment count", text: "Chairs and tables are never lent out twice." },
  { icon: "audit", title: "Audit log", text: "Every approval and change is kept on record." },
] as const;

const steps = [
  {
    icon: "calendar",
    title: "Check the calendar",
    text: "Every amenity shows its taken and free hours, any time of day.",
  },
  {
    icon: "send",
    title: "Send a request",
    text: "The fee and deposit are computed for you. The HOA approves it.",
  },
  {
    icon: "slip",
    title: "Show your slip",
    text: "The guard confirms your reference number on the day.",
  },
] as const;

// A sample day for the availability card. Drawn by the same strip the booking
// form uses.
const sampleDay: StripSegment[] = [
  { from: 540, to: 720, kind: "blocked", label: "Blocked by the HOA" },
  { from: 840, to: 1080, kind: "approved", label: "Approved" },
  { from: 1140, to: 1260, kind: "pending", label: "Waiting for approval" },
  { from: 1080, to: 1110, kind: "buffer", label: "Buffer" },
];

const questions = [
  {
    question: "Who can book an amenity?",
    answer:
      "Residents whose account the HOA administrator has verified. After you sign up, you upload a proof of residency. Until it is checked you can look at the calendar, but you cannot book yet.",
  },
  {
    question: "Can two people get the same time?",
    answer:
      "No. The system refuses a request that overlaps another reservation, a blocked date, or the buffer time after a booking. This is checked when the request is saved, so it holds even if two people send at the same moment.",
  },
  {
    question: "How do I know my request was approved?",
    answer:
      "Open My reservations. Each request shows its status. Once it is approved it gets a reference number and a slip you can print or show on your phone.",
  },
  {
    question: "How do I pay the fee and deposit?",
    answer:
      "The amount is computed when you choose the amenity and time. You can upload a proof of payment on the reservation, and the HOA records the payment after checking it.",
  },
  {
    question: "What does the guard check?",
    answer:
      "The guard sees the approved reservations for the day and confirms your reference number at the gate.",
  },
  {
    question: "Does ReserBa replace the HOA office?",
    answer:
      "No. It supports the HOA's current process. The administrator still approves requests, records payments, and can encode a walk-in for someone who comes to the office.",
  },
];

const menu = [
  { href: "#features", label: "Features" },
  { href: "#rules", label: "Rules" },
  { href: "#steps", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col pb-20 md:pb-0">
      {/* Hero */}
      <div className="emerald on-dark relative overflow-hidden">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" aria-label="ReserBa home" className="flex min-h-11 items-center text-white">
            <Logo />
          </Link>
          <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
            {menu.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex min-h-10 items-center rounded-lg px-3.5 text-sm font-medium text-ink-soft transition-colors duration-150 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-ghost">
              Log in
            </Link>
            <Link href="/signup" className="btn btn-light hidden sm:inline-flex">
              Create account
            </Link>
          </div>
        </header>

        <main className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-20 lg:pb-28">
          <div className="animate-rise">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-[0.8125rem] font-medium text-mint">
              <span className="size-1.5 rounded-full bg-sage" />
              Amenity booking for your subdivision
            </p>
            <h1 className="mt-6 font-display text-[3rem] leading-[1.02] font-normal tracking-tight sm:text-7xl">
              Reserve the clubhouse, court, or pool{" "}
              <em className="text-sage">without the back-and-forth.</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              See which times are free, send your request from your phone, and show your reference
              number at the gate. The system refuses two bookings for the same time, so no one is
              double booked.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/signup" className="btn btn-light px-5">
                Create account
                <Icon name="arrow" className="size-4" />
              </Link>
              <a href="#steps" className="btn btn-ghost px-5">
                See how it works
              </a>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-2 text-sm text-ink-soft">
              {["Works on any phone", "Fees computed for you", "Approved by your HOA"].map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <Icon name="check" className="size-4 text-sage" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <section
            aria-labelledby="try-title"
            className="animate-rise rounded-2xl border border-white/12 bg-white/[0.045] p-5 shadow-pop [animation-delay:120ms] sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 id="try-title" className="text-lg font-semibold">
                  Try a time
                </h2>
                <p className="mt-0.5 text-sm text-ink-soft">A sample day. Nothing is saved.</p>
              </div>
              <span className="badge bg-white/10 text-mint">Live demo</span>
            </div>
            <TryATime />
          </section>
        </main>
      </div>

      {/* Features */}
      <section id="features" aria-labelledby="features-title" className="mx-auto w-full max-w-6xl scroll-mt-6 px-4 py-20 sm:px-6 lg:py-28">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="eyebrow text-brand">Features</p>
            <h2 id="features-title" className="mt-3 font-display text-4xl leading-[1.08] font-normal tracking-tight sm:text-5xl">
              One place for residents, the HOA, and the guard.
            </h2>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-ink-soft lg:justify-self-end">
            Everyone sees the same schedule, so questions at the gate and messages to the office
            become one answer.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-6">
          <article className="card p-6 md:col-span-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">My reservations</h3>
                <p className="mt-0.5 text-[0.9375rem] text-ink-soft">Your requests and their status in one list.</p>
              </div>
              <span className="badge bg-closed-tint text-closed">Sample</span>
            </div>
            <ul className="mt-6 flex flex-col divide-y divide-line rounded-lg border border-line">
              {sampleReservations.map((row) => (
                <li key={row.number} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                  <div>
                    <p className="font-medium">{row.amenity}</p>
                    <p className="number text-sm text-ink-soft">{row.when}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[0.8125rem] font-medium text-ink-soft">{row.number}</span>
                    <StatusBadge status={row.status} />
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="emerald on-dark flex flex-col rounded-xl border border-white/10 p-6 md:col-span-2">
            <h3 className="text-lg font-semibold">Waiting for you</h3>
            <p className="mt-0.5 text-[0.9375rem] text-ink-soft">The administrator sees what needs a decision.</p>
            <ul className="mt-6 flex flex-1 flex-col justify-end gap-2.5">
              {sampleWaiting.map((item) => (
                <li key={item.label} className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
                  <span className="number min-w-7 font-display text-4xl leading-none text-white">{item.count}</span>
                  <span className="text-[0.9375rem] text-ink-soft">{item.label}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="card p-6 md:col-span-3">
            <span className="grid size-10 place-items-center rounded-lg bg-brand-tint text-brand">
              <Icon name="calendar" />
            </span>
            <h3 className="mt-5 text-lg font-semibold">Availability calendar</h3>
            <p className="mt-1 text-[0.9375rem] text-ink-soft">
              Taken and free hours for every amenity, by day, week, or month.
            </p>
            <div className="mt-6 rounded-lg border border-line bg-ground p-4">
              <DayStrip openMinutes={480} closeMinutes={1320} segments={sampleDay} />
            </div>
          </article>

          <article className="card p-6 md:col-span-3">
            <span className="grid size-10 place-items-center rounded-lg bg-brand-tint text-brand">
              <Icon name="slip" />
            </span>
            <h3 className="mt-5 text-lg font-semibold">Gate slip</h3>
            <p className="mt-1 text-[0.9375rem] text-ink-soft">
              An approved booking gets a reference number for the guard to check.
            </p>
            <div className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-dashed border-line-strong bg-ground px-5 py-4">
              <div>
                <p className="text-xs text-ink-soft">Clubhouse · Sat, Nov 21</p>
                <p className="mt-1 font-mono text-2xl font-semibold tracking-wide">RB-0013</p>
              </div>
              <StatusBadge status="approved" />
            </div>
          </article>
        </div>
      </section>

      {/* Rules */}
      <section id="rules" aria-labelledby="rules-title" className="emerald on-dark scroll-mt-0">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <p className="eyebrow text-sage">Rules that hold</p>
          <h2 id="rules-title" className="mt-3 max-w-2xl font-display text-4xl leading-[1.08] font-normal tracking-tight sm:text-5xl">
            The schedule <em className="text-sage">protects itself.</em>
          </h2>
          <p className="mt-5 max-w-xl text-lg text-ink-soft">
            These are checked every time a request is saved, not left to memory.
          </p>
          <ul className="mt-14 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {rules.map((rule) => (
              <li key={rule.title} className="bg-forest p-6 transition-colors duration-150 hover:bg-deep sm:p-8">
                <span className="text-sage">
                  <Icon name={rule.icon} className="size-6" />
                </span>
                <h3 className="mt-5 text-base font-semibold">{rule.title}</h3>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-soft">{rule.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Steps */}
      <section id="steps" aria-labelledby="steps-title" className="mx-auto w-full max-w-6xl scroll-mt-6 px-4 py-20 sm:px-6 lg:py-28">
        <p className="eyebrow text-brand">How it works</p>
        <h2 id="steps-title" className="mt-3 max-w-2xl font-display text-4xl leading-[1.08] font-normal tracking-tight sm:text-5xl">
          Three steps from free time to the gate.
        </h2>
        <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          <span aria-hidden="true" className="absolute top-[1.375rem] right-[16%] left-[16%] hidden border-t border-dashed border-line-strong md:block" />
          {steps.map((step, index) => (
            <li key={step.title} className="relative flex gap-5 md:flex-col md:items-center md:text-center">
              <span className="relative grid size-11 shrink-0 place-items-center rounded-full border border-line-strong bg-ground text-brand">
                <Icon name={step.icon} className="size-5" />
                <span className="number absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-brand text-[0.6875rem] font-semibold text-on-brand">
                  {index + 1}
                </span>
              </span>
              <div className="md:max-w-xs">
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-soft">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Questions */}
      <section id="faq" aria-labelledby="faq-title" className="mx-auto w-full max-w-6xl scroll-mt-6 px-4 pb-20 sm:px-6 lg:pb-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div>
            <p className="eyebrow text-brand">Questions</p>
            <h2 id="faq-title" className="mt-3 font-display text-4xl leading-[1.08] font-normal tracking-tight sm:text-5xl">
              Good to know before you book.
            </h2>
          </div>
          <Accordion items={questions} />
        </div>
      </section>

      {/* Closing banner */}
      <section aria-labelledby="closing-title" className="px-4 pb-12 sm:px-6">
        <div className="emerald on-dark mx-auto flex w-full max-w-6xl flex-col items-center overflow-hidden rounded-2xl px-6 py-16 text-center sm:py-24">
          <h2 id="closing-title" className="max-w-2xl font-display text-4xl leading-[1.08] font-normal tracking-tight sm:text-6xl">
            Your next booking is <em className="text-sage">a few taps away.</em>
          </h2>
          <p className="mt-5 max-w-xl text-lg text-ink-soft">
            Create a resident account, upload your proof of residency, and book once the HOA verifies you.
          </p>
          <div className="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Link href="/signup" className="btn btn-light px-5">
              Create account
              <Icon name="arrow" className="size-4" />
            </Link>
            <Link href="/login" className="btn btn-ghost px-5">
              Log in
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-6xl border-t border-line px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Community amenity booking and schedule conflict detection for homeowners associations.
            </p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm sm:grid-cols-3">
            {[...menu, { href: "/login", label: "Log in" }, { href: "/signup", label: "Create account" }].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex min-h-9 items-center font-medium text-ink-soft transition-colors duration-150 hover:text-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>

      {/* On a phone the main action stays in reach at the bottom of the screen. */}
      <div className="action-bar flex gap-3 md:hidden">
        <Link href="/login" className="btn btn-quiet flex-1">
          Log in
        </Link>
        <Link href="/signup" className="btn btn-primary flex-1">
          Create account
        </Link>
      </div>
    </div>
  );
}
