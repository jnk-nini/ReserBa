import Link from "next/link";
import Icon, { type IconName } from "@/components/icon";
import Logo from "@/components/logo";
import StatusBadge from "@/components/status-badge";
import TryATime from "@/components/try-a-time";

// The first page a visitor sees. From top to bottom: the bar with the links,
// the opening with a box to try a time, how a booking goes, what each kind of
// user gets, the rules the system keeps, common questions, and the last
// invitation to sign up. Everything shown here is sample data.

const sections = [
  { href: "#how", label: "How it works" },
  { href: "#roles", label: "Who it is for" },
  { href: "#rules", label: "The rules it keeps" },
  { href: "#questions", label: "Questions" },
];

const roles: Array<{ icon: IconName; name: string; summary: string; points: string[] }> = [
  {
    icon: "user",
    name: "Residents",
    summary: "Book from your phone, at any hour.",
    points: [
      "See the free and taken hours of every amenity",
      "Know the fee and the deposit before you send a request",
      "Upload your proof of payment and follow the status",
      "Keep your reference number and slip for the day",
    ],
  },
  {
    icon: "gauge",
    name: "HOA administrators",
    summary: "One list of what is waiting for you.",
    points: [
      "Approve or reject requests, with a reason the resident can read",
      "Encode walk-in bookings for residents who come to the office",
      "Set rates, opening hours, buffer time, and blocked dates",
      "Download the monthly report as PDF or Excel",
    ],
  },
  {
    icon: "shield",
    name: "Guards",
    summary: "A clear answer at the gate.",
    points: [
      "See the approved reservations for today",
      "Type a reference number to confirm a booking",
      "View only. Nothing on the guard screen changes a record",
    ],
  },
];

const rules: Array<{ title: string; text: string }> = [
  {
    title: "No double booking",
    text: "The database itself refuses two reservations for the same amenity at the same time, even when two people press the button in the same second.",
  },
  {
    title: "Buffer time between bookings",
    text: "Each amenity can keep time free after a booking for cleaning and turnover. The next request has to start after it.",
  },
  {
    title: "Blocked dates stay blocked",
    text: "Maintenance days and HOA events are marked once. No request can land on them.",
  },
  {
    title: "Fees computed the same way every time",
    text: "Hours times the rate, plus any equipment, with the deposit shown beside it. Nobody adds it up by hand.",
  },
  {
    title: "A record of every change",
    text: "Approvals, rejections, payments, and edits are written to an audit log with the name and the time.",
  },
  {
    title: "Each person sees only what they should",
    text: "Residents see their own reservations. Guards see today. Proofs of residency and payment stay in private storage.",
  },
];

const questions: Array<{ question: string; answer: string }> = [
  {
    question: "Who can create an account?",
    answer:
      "Residents of the subdivision. After you sign up, you upload a proof of residency such as a utility bill, a title, or a lease. The HOA administrator checks it, and then you can book.",
  },
  {
    question: "Do I pay through the website?",
    answer:
      "No. You pay the HOA the same way you do today. Then you upload a photo of your proof of payment, and the administrator records it on your reservation.",
  },
  {
    question: "What happens if two people want the same time?",
    answer:
      "The first request that is saved holds the time. The second one is refused at once and is told why, so it can pick another hour instead of waiting for an answer that will be no.",
  },
  {
    question: "Can I change a reservation after sending it?",
    answer:
      "A saved reservation is not edited. Cancel it and send a new one, so the schedule and the fee always match what was approved.",
  },
  {
    question: "What does the guard see about me?",
    answer:
      "Only what is needed at the gate: the name on the booking, the amenity, the time, and the reference number.",
  },
  {
    question: "Is my personal information protected?",
    answer:
      "You give consent when you sign up, as the Data Privacy Act of 2012 (RA 10173) asks. Your details are used only to manage amenity bookings, and uploaded files are kept in private storage.",
  },
];

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="btn btn-primary sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to the page
      </a>

      <header className="sticky top-0 z-30 border-b border-on-deep/10 bg-deep/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="rounded-lg focus-visible:outline-accent" aria-label="ReserBa, home">
            <Logo tone="light" />
          </Link>
          <nav aria-label="Sections of this page" className="hidden lg:block">
            <ul className="flex gap-1">
              {sections.map((section) => (
                <li key={section.href}>
                  <a
                    href={section.href}
                    className="rounded-lg px-3 py-2 text-[0.9375rem] font-semibold text-on-deep-soft transition-colors duration-150 hover:text-on-deep focus-visible:outline-accent"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-ghost btn-small focus-visible:outline-accent sm:min-h-10 sm:px-4 sm:text-base">
              Log in
            </Link>
            <Link
              href="/signup"
              className="btn btn-accent btn-small hidden focus-visible:outline-accent sm:inline-flex sm:min-h-10 sm:px-4 sm:text-base"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        {/* The opening. The dark band ends behind the box, so the box looks
            like it sits on top of the page. */}
        <section className="relative isolate">
          <div className="dot-grid absolute inset-x-0 top-0 -z-10 h-full bg-deep lg:h-[calc(100%-5rem)]" />
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pt-12 pb-12 sm:px-6 sm:pt-16 lg:grid-cols-2 lg:gap-12 lg:pt-20 lg:pb-0">
            <div className="animate-rise text-on-deep lg:pb-28">
              <h1 className="text-[2.5rem] leading-[1.05] font-bold tracking-tight sm:text-6xl lg:text-[3.5rem] xl:text-[4rem]">
                Reserve the clubhouse without the <span className="whitespace-nowrap">back-and-forth.</span>
              </h1>
              <p className="mt-6 max-w-[34rem] text-lg text-on-deep-soft sm:text-xl">
                ReserBa shows your subdivision&rsquo;s free hours, takes your request from your phone, and
                gives you a reference number for the gate. Two bookings for the same time are refused,
                so no one is double booked.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup" className="btn btn-accent btn-large focus-visible:outline-accent">
                  Create a resident account
                  <Icon name="arrow" />
                </Link>
                <Link href="/login" className="btn btn-ghost btn-large focus-visible:outline-accent">
                  Log in
                </Link>
              </div>
              <ul className="mt-8 flex flex-col gap-2 text-[0.9375rem] text-on-deep-soft">
                {["Clubhouse, court, and pool in one calendar", "Made for residents, HOA officers, and guards"].map(
                  (line) => (
                    <li key={line} className="flex items-center gap-2">
                      <Icon name="check" className="size-4 text-accent" />
                      {line}
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div className="animate-rise [animation-delay:120ms]">
              <TryATime />
            </div>
          </div>
        </section>

        <section id="how" className="mx-auto w-full max-w-6xl px-4 pt-20 pb-4 sm:px-6 lg:pt-28">
          <h2 className="max-w-2xl text-3xl font-bold sm:text-[2.5rem]">From a free hour to the gate, in three steps.</h2>
          <p className="mt-4 max-w-[38rem] text-lg text-ink-soft">
            The HOA still decides every request. ReserBa keeps the schedule, the fees, and the record in
            order while it does.
          </p>

          <ol className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-8">
            <li className="flex flex-col">
              <div className="flex min-h-48 flex-col justify-center gap-3 rounded-2xl border border-line bg-surface p-5 shadow-low" aria-hidden="true">
                {[
                  ["Clubhouse", "left-[36%] w-[28%]", "Free from 5 PM"],
                  ["Basketball court", "left-[10%] w-[22%]", "Free until 4 PM"],
                  ["Swimming pool", "left-[55%] w-[30%]", "Free all morning"],
                ].map(([name, bar, note]) => (
                  <div key={name}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="font-semibold">{name}</span>
                      <span className="text-ink-soft">{note}</span>
                    </div>
                    <div className="relative mt-1 h-2.5 overflow-hidden rounded-full bg-closed-tint">
                      <span className={`absolute inset-y-0 rounded-full bg-approved ${bar}`} />
                    </div>
                  </div>
                ))}
              </div>
              <h3 className="mt-6 text-xl font-bold">
                <span className="number text-brand">1.</span> Check the calendar
              </h3>
              <p className="mt-2 text-ink-soft">
                Every amenity shows its taken and free hours, so you know what is open before you ask.
              </p>
            </li>

            <li className="flex flex-col">
              <div className="flex min-h-48 flex-col justify-center rounded-2xl border border-line bg-surface p-5 shadow-low" aria-hidden="true">
                <dl className="number flex flex-col gap-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-soft">Clubhouse, 4 hours at ₱500.00</dt>
                    <dd className="font-semibold">₱2,000.00</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-soft">50 monobloc chairs</dt>
                    <dd className="font-semibold">₱250.00</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-soft">Deposit</dt>
                    <dd className="font-semibold">₱1,000.00</dd>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-3 border-t border-line pt-3 text-base">
                    <dt className="font-bold">To pay</dt>
                    <dd className="font-bold">₱3,250.00</dd>
                  </div>
                </dl>
                <div className="mt-3">
                  <StatusBadge status="pending" />
                </div>
              </div>
              <h3 className="mt-6 text-xl font-bold">
                <span className="number text-brand">2.</span> Send a request
              </h3>
              <p className="mt-2 text-ink-soft">
                The fee and the deposit are computed for you. The HOA administrator approves it or tells
                you why not.
              </p>
            </li>

            <li className="flex flex-col">
              <div className="flex min-h-48 flex-col justify-center rounded-2xl border border-line bg-surface p-5 shadow-low" aria-hidden="true">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-ink-soft">Reference number</p>
                    <p className="font-mono text-3xl font-semibold tracking-wide">RB-0013</p>
                  </div>
                  <StatusBadge status="approved" />
                </div>
                <div className="mt-4 border-t border-dashed border-line-strong pt-4 text-sm">
                  <p className="font-semibold">Clubhouse</p>
                  <p className="number text-ink-soft">Sat, Nov 21, 2026, 1:00 PM to 5:00 PM</p>
                </div>
              </div>
              <h3 className="mt-6 text-xl font-bold">
                <span className="number text-brand">3.</span> Show your slip
              </h3>
              <p className="mt-2 text-ink-soft">
                An approved booking gets a reference number. The guard confirms it at the gate on the day.
              </p>
            </li>
          </ol>
        </section>

        <section id="roles" className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6 lg:pt-28">
          <h2 className="max-w-2xl text-3xl font-bold sm:text-[2.5rem]">One schedule, three kinds of users.</h2>
          <p className="mt-4 max-w-[38rem] text-lg text-ink-soft">
            Each person signs in to the screens made for their part of the work, and to nothing else.
          </p>

          <div className="mt-10 border-t border-line-strong">
            {roles.map((role) => (
              <div
                key={role.name}
                className="grid gap-x-10 gap-y-4 border-b border-line-strong py-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:py-10"
              >
                <div>
                  <h3 className="flex items-center gap-3 text-2xl font-bold">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-brand-tint text-brand">
                      <Icon name={role.icon} />
                    </span>
                    {role.name}
                  </h3>
                  <p className="mt-3 text-lg text-ink-soft">{role.summary}</p>
                </div>
                <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {role.points.map((point) => (
                    <li key={point} className="flex gap-2.5">
                      <Icon name="check" className="mt-1 size-4 text-brand" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="rules" className="dot-grid mt-20 bg-deep text-on-deep lg:mt-28">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
            <h2 className="max-w-3xl text-3xl font-bold sm:text-[2.5rem]">
              The rules are kept by the system, not by memory.
            </h2>
            <p className="mt-4 max-w-[38rem] text-lg text-on-deep-soft">
              A busy officer can miss an overlap in a notebook or a group chat. These checks run on every
              request, every time.
            </p>
            <ul className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {rules.map((rule) => (
                <li key={rule.title} className="border-t border-on-deep/20 pt-5">
                  <h3 className="flex items-start gap-2.5 text-lg font-bold">
                    <Icon name="check" className="mt-1 size-[1.125rem] text-accent" />
                    {rule.title}
                  </h3>
                  <p className="mt-2 text-on-deep-soft">{rule.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="questions" className="mx-auto grid w-full max-w-6xl gap-x-12 gap-y-8 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:py-28">
          <div>
            <h2 className="text-3xl font-bold sm:text-[2.5rem]">Questions residents ask first.</h2>
            <p className="mt-4 text-lg text-ink-soft">
              Something else? Ask your HOA office. They run ReserBa for your subdivision.
            </p>
          </div>
          <div className="border-t border-line-strong">
            {questions.map((item) => (
              <details key={item.question} className="group border-b border-line-strong">
                <summary className="flex min-h-14 items-center justify-between gap-4 rounded-lg py-4 text-lg font-semibold transition-colors duration-150 hover:text-brand">
                  {item.question}
                  <Icon
                    name="chevron"
                    className="size-5 text-ink-soft transition-transform duration-200 ease-settle group-open:rotate-180"
                  />
                </summary>
                <p className="max-w-[38rem] pb-5 text-ink-soft">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:pb-28">
          <div className="dot-grid flex flex-col items-start gap-6 rounded-3xl bg-deep px-6 py-12 text-on-deep sm:px-12 sm:py-16 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="max-w-xl text-3xl font-bold sm:text-[2.5rem]">Your next booking starts with a free hour.</h2>
              <p className="mt-3 max-w-[34rem] text-lg text-on-deep-soft">
                Create your account, upload your proof of residency, and book once the HOA verifies it.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup" className="btn btn-accent btn-large focus-visible:outline-accent">
                Create a resident account
              </Link>
              <Link href="/login" className="btn btn-ghost btn-large focus-visible:outline-accent">
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Logo />
            <p className="mt-3 max-w-sm text-sm text-ink-soft">
              Community amenity booking and schedule conflict detection for homeowners associations.
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem] font-semibold md:justify-end">
              {sections.map((section) => (
                <li key={section.href}>
                  <a href={section.href} className="text-ink-soft transition-colors duration-150 hover:text-brand">
                    {section.label}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/login" className="text-ink-soft transition-colors duration-150 hover:text-brand">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-ink-soft transition-colors duration-150 hover:text-brand">
                  Sign up
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </>
  );
}
