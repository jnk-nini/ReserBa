import Link from "next/link";
import Faq from "@/components/faq";
import Icon from "@/components/icon";
import Logo from "@/components/logo";
import Reveal, { Motion } from "@/components/reveal";
import RoleShowcase from "@/components/role-showcase";
import SiteHeader from "@/components/site-header";
import StatusBadge from "@/components/status-badge";
import TryATime from "@/components/try-a-time";

// The first page a visitor sees. From top to bottom: the bar with the links,
// the opening with a box to try a time, how a booking goes, what each kind of
// user gets, the rules the system keeps, common questions, and the last
// invitation to sign up. The page is laid out like a printed notice: large
// serif lines, hairline rules instead of boxes, and the real product on show
// instead of decoration. Everything shown here is sample data.

const sections = [
  { href: "#how", label: "How it works" },
  { href: "#roles", label: "Who it is for" },
  { href: "#rules", label: "The rules it keeps" },
  { href: "#questions", label: "Questions" },
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

const rules: Array<{ title: string; text: string }> = [
  {
    title: "No double booking",
    text: "The database itself refuses two reservations for the same amenity at the same time, even when two people press the button in the same second.",
  },
  {
    title: "Buffer time between bookings",
    text: "Time stays free after each booking for cleaning and turnover.",
  },
  {
    title: "Blocked dates stay blocked",
    text: "Maintenance days and HOA events are marked once. No request can land on them.",
  },
  {
    title: "Fees computed the same way",
    text: "Hours times the rate, plus any equipment. Nobody adds it up by hand.",
  },
  {
    title: "A record of every change",
    text: "Approvals, rejections, and payments go to an audit log with the name and the time.",
  },
  {
    title: "Each person sees only what they should",
    text: "Residents see their own reservations. Guards see today. Proofs of residency and payment stay in private storage.",
  },
];

// The three steps of a booking. Each one has a small drawing of the screen
// where it happens.
const steps: Array<{ title: string; text: string }> = [
  {
    title: "Check the calendar",
    text: "Every amenity shows its taken and free hours, so you know what is open before you ask.",
  },
  {
    title: "Send a request",
    text: "The fee and the deposit are computed for you. The HOA administrator approves it or tells you why not.",
  },
  {
    title: "Show your slip",
    text: "An approved booking gets a reference number. The guard confirms it at the gate on the day.",
  },
];

const promises: Array<{ label: string; line: string }> = [
  { label: "Every request", line: "Approved by your own HOA" },
  { label: "The same hour, twice", line: "Refused by the system" },
  { label: "At the gate", line: "One reference number" },
];

function CalendarDrawing() {
  return (
    <div className="flex flex-col gap-4">
      {[
        ["Clubhouse", "left-[36%] w-[28%]", "Free from 5 PM"],
        ["Basketball court", "left-[10%] w-[22%]", "Free until 4 PM"],
        ["Swimming pool", "left-[55%] w-[30%]", "Free all morning"],
      ].map(([name, bar, note]) => (
        <div key={name}>
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="font-medium">{name}</span>
            <span className="text-ink-soft">{note}</span>
          </div>
          <div className="relative mt-1.5 h-2 overflow-hidden rounded-full bg-closed-tint">
            <span className={`absolute inset-y-0 rounded-full bg-approved ${bar}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function RequestDrawing() {
  return (
    <div>
      <dl className="number flex flex-col gap-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-soft">Clubhouse, 4 hours at ₱500.00</dt>
          <dd className="font-medium">₱2,000.00</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-soft">50 monobloc chairs</dt>
          <dd className="font-medium">₱250.00</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-soft">Deposit</dt>
          <dd className="font-medium">₱1,000.00</dd>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3 border-t border-line pt-3 text-base">
          <dt className="font-semibold">To pay</dt>
          <dd className="font-semibold">₱3,250.00</dd>
        </div>
      </dl>
      <div className="mt-3">
        <StatusBadge status="pending" />
      </div>
    </div>
  );
}

function SlipDrawing() {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Reference number</p>
          <p className="mt-1 font-mono text-3xl font-semibold tracking-wider">RB-0013</p>
        </div>
        <StatusBadge status="approved" />
      </div>
      <div className="mt-4 border-t border-dashed border-line-strong pt-4 text-sm">
        <p className="font-medium">Clubhouse</p>
        <p className="number text-ink-soft">Sat, Nov 21, 2026, 1:00 PM to 5:00 PM</p>
      </div>
    </div>
  );
}

const drawings = [CalendarDrawing, RequestDrawing, SlipDrawing];

export default function Home() {
  return (
    <Motion>
      <a
        href="#main"
        className="btn btn-primary sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to the page
      </a>

      <SiteHeader sections={sections} />

      <main id="main" className="flex-1">
        {/* The opening: what it is, two buttons, and a working box to try a time. */}
        <section className="mx-auto w-full max-w-6xl px-4 pt-28 sm:px-6 sm:pt-36">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,31rem)] lg:gap-16">
            <div>
              <p className="eyebrow flex animate-fade-up items-center gap-3">
                <span className="h-px w-8 origin-left animate-[grow_0.8s_var(--ease-settle)_0.2s_both] bg-brass" aria-hidden="true" />
                For homeowners associations
              </p>
              <h1 className="display mt-6 animate-fade-up [animation-delay:80ms] text-[2.875rem] sm:text-[4rem] lg:text-[4.25rem] xl:text-[4.75rem]">
                Reserve the clubhouse, <em className="text-brand">without the back-and-forth.</em>
              </h1>
              <p className="mt-6 max-w-[33rem] animate-fade-up text-lg text-ink-soft [animation-delay:160ms]">
                ReserBa shows your subdivision&rsquo;s free hours, takes your request from your phone, and gives you
                a reference number for the gate. Two bookings for the same time are refused, so no one is double
                booked.
              </p>
              <div className="mt-9 flex animate-fade-up flex-wrap items-center gap-x-6 gap-y-4 [animation-delay:240ms]">
                <Link href="/signup" className="btn btn-primary btn-large">
                  Create a resident account
                  <Icon name="arrow" />
                </Link>
                <Link href="/login" className="link text-base">
                  I already have an account
                </Link>
              </div>
            </div>

            <div className="animate-fade-up [animation-delay:320ms]">
              <TryATime />
            </div>
          </div>

          <dl className="mt-16 grid border-y border-line-strong sm:grid-cols-3 lg:mt-24">
            {promises.map((promise, index) => (
              <Reveal
                key={promise.label}
                delay={index * 0.1}
                className="border-b border-line py-5 last:border-b-0 sm:border-r sm:border-b-0 sm:px-6 sm:py-7 sm:first:pl-0 sm:last:border-r-0"
              >
                <dt className="eyebrow">{promise.label}</dt>
                <dd className="display mt-2 text-2xl sm:text-[1.75rem]">{promise.line}</dd>
              </Reveal>
            ))}
          </dl>
        </section>

        <section id="how" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-32">
          <div className="grid gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <Reveal>
              <h2 className="display text-4xl sm:text-5xl">From a free hour to the gate, in three steps.</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-[34rem] text-lg text-ink-soft lg:pt-3">
                The HOA still decides every request. ReserBa keeps the schedule, the fees, and the record in order
                while it does.
              </p>
            </Reveal>
          </div>

          <ol className="mt-12 border-t border-line-strong lg:mt-16">
            {steps.map((step, index) => {
              const Drawing = drawings[index];
              return (
                <Reveal
                  as="li"
                  key={step.title}
                  className="group grid gap-x-10 gap-y-6 border-b border-line py-8 sm:py-10 md:grid-cols-[4rem_minmax(0,1fr)_minmax(0,24rem)] md:items-center lg:gap-x-16"
                >
                  <span className="display text-5xl text-brass transition-transform duration-300 ease-settle group-hover:translate-x-1 sm:text-6xl" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="display text-[1.75rem] sm:text-[2rem]">{step.title}</h3>
                    <p className="mt-2 max-w-md text-ink-soft">{step.text}</p>
                  </div>
                  <div className="rounded-2xl border border-line bg-surface p-5 shadow-low transition-[transform,box-shadow] duration-300 ease-settle group-hover:-translate-y-0.5 group-hover:shadow-high sm:p-6" aria-hidden="true">
                    <Drawing />
                  </div>
                </Reveal>
              );
            })}
          </ol>
        </section>

        <section id="roles" className="border-y border-line bg-surface">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-32">
            <Reveal>
              <h2 className="display max-w-2xl text-4xl sm:text-5xl">One schedule, three kinds of users.</h2>
              <p className="mt-5 max-w-[34rem] text-lg text-ink-soft">
                Each person signs in to the screens made for their part of the work, and to nothing else.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="mt-10">
              <RoleShowcase />
            </Reveal>
          </div>
        </section>

        <section id="rules" className="bg-brand text-on-brand">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-32">
            <p className="flex items-center gap-3 text-[0.6875rem] font-semibold tracking-[0.14em] text-brass-soft uppercase">
              <span className="h-px w-8 bg-brass-soft" aria-hidden="true" />
              House rules
            </p>
            <h2 className="display mt-6 max-w-3xl text-4xl sm:text-5xl">
              The rules are kept by the system, <em>not by memory.</em>
            </h2>
            <p className="mt-5 max-w-[34rem] text-lg text-on-brand/75">
              A busy officer can miss an overlap in a notebook or a group chat. These checks run on every request,
              every time.
            </p>

            <ol className="mt-12 grid border-t border-on-brand/20 md:grid-cols-2 md:gap-x-16 lg:mt-16">
              {rules.map((rule, index) => (
                <Reveal as="li" key={rule.title} delay={(index % 2) * 0.08} className="flex gap-5 border-b border-on-brand/20 py-6 sm:py-7">
                  <span className="number pt-1.5 text-[0.8125rem] font-semibold text-brass-soft" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="display text-2xl sm:text-[1.75rem]">{rule.title}</h3>
                    <p className="mt-2 text-on-brand/75">{rule.text}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="questions"
          className="mx-auto grid w-full max-w-6xl gap-x-16 gap-y-8 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:py-32"
        >
          <Reveal>
            <h2 className="display text-4xl sm:text-5xl">Questions residents ask first.</h2>
            <p className="mt-5 text-lg text-ink-soft">
              Something else? Ask your HOA office. They run ReserBa for your subdivision.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Faq items={questions} />
          </Reveal>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:pb-32">
          <Reveal className="grid items-end gap-8 border-t border-line-strong pt-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:pt-16">
            <div>
              <h2 className="display max-w-3xl text-4xl sm:text-6xl">Your next booking starts with a free hour.</h2>
              <p className="mt-5 max-w-[34rem] text-lg text-ink-soft">
                Create your account, upload your proof of residency, and book once the HOA verifies it.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup" className="btn btn-primary btn-large">
                Create a resident account
                <Icon name="arrow" />
              </Link>
              <Link href="/login" className="btn btn-quiet btn-large">
                Log in
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-ink-soft">
              Community amenity booking and schedule conflict detection for homeowners associations.
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-7 gap-y-2 text-[0.9375rem] font-medium md:justify-end">
              {sections.map((section) => (
                <li key={section.href}>
                  <a href={section.href} className="text-ink-soft transition-colors duration-150 hover:text-ink">
                    {section.label}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/login" className="text-ink-soft transition-colors duration-150 hover:text-ink">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-ink-soft transition-colors duration-150 hover:text-ink">
                  Sign up
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </Motion>
  );
}
