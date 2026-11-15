import Link from "next/link";
import Accordion from "@/components/accordion";
import Icon from "@/components/icons";
import Sheet from "@/components/sheet";
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
          <Link href="/" className="flex min-h-11 items-center text-xl font-extrabold tracking-tight">
            ReserBa
          </Link>
          <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
            {menu.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-ink-soft transition-colors duration-150 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-ghost">
              Log in
            </Link>
            <Link href="/signup" className="btn btn-gold hidden sm:inline-flex">
              Create account
            </Link>
          </div>
        </header>

        <main className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pt-8 pb-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-16 lg:pb-28">
          <div className="animate-rise">
            <p className="eyebrow inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-mint backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-gold" />
              Amenity booking for your subdivision
            </p>
            <h1 className="mt-6 text-[2.5rem] leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-6xl">
              Reserve the clubhouse, court, or pool{" "}
              <span className="bg-gradient-to-r from-stone to-gold bg-clip-text text-transparent">
                without the back-and-forth.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
              See which times are free, send your request from your phone, and show your reference
              number at the gate. The system refuses two bookings for the same time, so no one is
              double booked.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn btn-gold px-6">
                Create account
                <Icon name="arrow" className="size-4" />
              </Link>
              <a href="#steps" className="btn btn-ghost px-6">
                See how it works
              </a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
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
            className="glass-float animate-rise p-5 [animation-delay:120ms] sm:p-7"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 id="try-title" className="text-xl font-bold">
                  Try a time
                </h2>
                <p className="mt-0.5 text-sm text-ink-soft">A sample day. Nothing is saved.</p>
              </div>
              <span className="badge bg-white/10 text-mint">Sample</span>
            </div>
            <TryATime />
          </section>
        </main>
      </div>

      {/* Features */}
      <section id="features" aria-labelledby="features-title" className="mx-auto w-full max-w-6xl scroll-mt-6 px-4 py-16 sm:px-6 lg:py-24">
        <p className="eyebrow text-pine">Features</p>
        <h2 id="features-title" className="mt-3 max-w-2xl text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
          One place for residents, the HOA, and the guard.
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-6">
          <article className="tile md:col-span-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold">My reservations</h3>
              <span className="badge bg-closed-tint text-closed">Sample</span>
            </div>
            <p className="mt-1 text-base text-ink-soft">Your requests and their status in one list.</p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {sampleReservations.map((row) => (
                <li
                  key={row.number}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-white/70 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold">{row.amenity}</p>
                    <p className="number text-sm text-ink-soft">{row.when}</p>
                    <p className="number font-mono text-sm font-semibold">{row.number}</p>
                  </div>
                  <StatusBadge status={row.status} />
                </li>
              ))}
            </ul>
          </article>

          <article className="emerald on-dark rounded-2xl border border-white/10 p-5 shadow-glass sm:p-6 md:col-span-2">
            <h3 className="text-lg font-bold">Waiting for you</h3>
            <p className="mt-1 text-base text-ink-soft">The administrator sees what needs a decision.</p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {sampleWaiting.map((item) => (
                <li key={item.label} className="glass-dark flex items-center gap-4 rounded-xl px-4 py-3">
                  <span className="number min-w-8 text-3xl font-extrabold text-gold">{item.count}</span>
                  <span className="text-base">{item.label}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="tile md:col-span-2">
            <span className="grid size-11 place-items-center rounded-xl bg-brand-tint text-jade">
              <Icon name="calendar" />
            </span>
            <h3 className="mt-4 text-lg font-bold">Availability calendar</h3>
            <p className="mt-1 text-base text-ink-soft">
              Taken and free hours for every amenity, by day, week, or month.
            </p>
          </article>

          <article className="tile md:col-span-2">
            <span className="grid size-11 place-items-center rounded-xl bg-stone/50 text-pending">
              <Icon name="slip" />
            </span>
            <h3 className="mt-4 text-lg font-bold">Gate slip</h3>
            <p className="mt-1 text-base text-ink-soft">
              An approved booking gets a reference number such as{" "}
              <span className="font-mono font-semibold text-ink">RB-0013</span> for the guard.
            </p>
          </article>

          <article className="tile md:col-span-2">
            <span className="grid size-11 place-items-center rounded-xl bg-brand-tint text-jade">
              <Icon name="wallet" />
            </span>
            <h3 className="mt-4 text-lg font-bold">Fund summary</h3>
            <p className="mt-1 text-base text-ink-soft">
              Residents can see the association&apos;s income and expenses for the month.
            </p>
          </article>
        </div>
      </section>

      {/* Rules */}
      <section id="rules" aria-labelledby="rules-title" className="emerald on-dark scroll-mt-0">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <p className="eyebrow text-sage">Rules that hold</p>
          <h2 id="rules-title" className="mt-3 max-w-2xl text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
            The schedule protects itself.
          </h2>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
            These are checked every time a request is saved, not left to memory.
          </p>
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {rules.map((rule) => (
              <li
                key={rule.title}
                className="glass-dark p-4 transition duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.07] sm:p-6"
              >
                <span className="grid size-11 place-items-center rounded-xl border border-white/15 bg-white/[0.07] text-mint">
                  <Icon name={rule.icon} />
                </span>
                <h3 className="mt-4 text-base font-bold sm:text-lg">{rule.title}</h3>
                <p className="mt-1 text-sm text-ink-soft sm:text-base">{rule.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Steps */}
      <section id="steps" aria-labelledby="steps-title" className="mx-auto w-full max-w-6xl scroll-mt-6 px-4 py-16 sm:px-6 lg:py-24">
        <p className="eyebrow text-pine">How it works</p>
        <h2 id="steps-title" className="mt-3 max-w-2xl text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
          Three steps from free time to the gate.
        </h2>
        <ol className="swipe mt-10 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="tile group md:w-auto md:hover:-translate-y-1 md:hover:bg-white/90"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-jade text-white transition-colors duration-200 group-hover:bg-pine">
                  <Icon name={step.icon} className="size-6" />
                </span>
                <span className="number text-5xl font-extrabold tracking-tighter text-sage/40">0{index + 1}</span>
              </div>
              <h3 className="mt-6 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-base text-ink-soft">{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-1 text-center text-sm text-ink-soft md:hidden">Swipe to see the next step</p>
      </section>

      {/* Questions */}
      <section id="faq" aria-labelledby="faq-title" className="mx-auto w-full max-w-3xl scroll-mt-6 px-4 pb-16 sm:px-6 lg:pb-24">
        <p className="eyebrow text-pine">Questions</p>
        <h2 id="faq-title" className="mt-3 mb-8 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
          Good to know before you book.
        </h2>
        <Accordion items={questions} />
      </section>

      {/* Closing banner */}
      <section aria-labelledby="closing-title" className="px-4 pb-10 sm:px-6">
        <div className="emerald on-dark mx-auto flex w-full max-w-6xl flex-col items-center overflow-hidden rounded-3xl px-6 py-14 text-center shadow-float sm:py-20">
          <h2 id="closing-title" className="max-w-2xl text-3xl font-extrabold tracking-[-0.03em] sm:text-5xl">
            Your next booking is a few taps away.
          </h2>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
            Create a resident account, upload your proof of residency, and book once the HOA verifies you.
          </p>
          <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Link href="/signup" className="btn btn-gold px-6">
              Create account
              <Icon name="arrow" className="size-4" />
            </Link>
            <Link href="/login" className="btn btn-ghost px-6">
              Log in
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 border-t border-line px-4 py-8 text-center sm:px-6 md:flex-row md:justify-between md:text-left">
        <div>
          <p className="text-lg font-extrabold tracking-tight text-jade">ReserBa</p>
          <p className="text-sm text-ink-soft">Community amenity booking for homeowners associations.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-1">
          {[...menu, { href: "/login", label: "Log in" }].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-ink-soft transition-colors duration-150 hover:text-jade"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </footer>

      {/* On a phone the main action stays in reach at the bottom of the screen. */}
      <div className="action-bar flex gap-3 md:hidden">
        <Sheet title="Try a time" triggerLabel="Try a time" triggerClass="btn btn-quiet flex-1">
          <p className="-mt-2 mb-4 text-sm text-ink-soft">A sample day. Nothing is saved.</p>
          <TryATime />
          <Link href="/signup" className="btn btn-primary mt-4 w-full">
            Create account to book
          </Link>
        </Sheet>
        <Link href="/signup" className="btn btn-primary flex-1">
          Book now
        </Link>
      </div>
    </div>
  );
}
