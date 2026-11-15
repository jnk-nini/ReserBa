import Link from "next/link";
import Faq from "@/components/faq";
import Icon, { type IconName } from "@/components/icon";
import Logo from "@/components/logo";
import RoleShowcase from "@/components/role-showcase";
import SiteHeader from "@/components/site-header";
import StatusBadge from "@/components/status-badge";
import TryATime from "@/components/try-a-time";

// The first page a visitor sees. From top to bottom: the bar with the links,
// the opening with a box to try a time, how a booking goes, what each kind of
// user gets, the rules the system keeps, common questions, and the last
// invitation to sign up. The page is flat on purpose: one background, white
// boxes with hairlines, and the real product on show instead of decoration.
// Everything shown here is sample data.

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

const rules: Array<{ icon: IconName; title: string; text: string }> = [
  {
    icon: "calendar",
    title: "No double booking",
    text: "The database itself refuses two reservations for the same amenity at the same time, even when two people press the button in the same second.",
  },
  {
    icon: "clock",
    title: "Buffer time between bookings",
    text: "Time stays free after each booking for cleaning and turnover.",
  },
  {
    icon: "lock",
    title: "Blocked dates stay blocked",
    text: "Maintenance days and HOA events are marked once. No request can land on them.",
  },
  {
    icon: "coins",
    title: "Fees computed the same way",
    text: "Hours times the rate, plus any equipment. Nobody adds it up by hand.",
  },
  {
    icon: "history",
    title: "A record of every change",
    text: "Approvals, rejections, and payments go to an audit log with the name and the time.",
  },
  {
    icon: "shield",
    title: "Each person sees only what they should",
    text: "Residents see their own reservations. Guards see today. Proofs of residency and payment stay in private storage.",
  },
];

// The look shared by the three step boxes.
const stepCard = "flex h-full flex-col rounded-2xl border border-line bg-surface p-3 shadow-low";
const stepNumber = "number flex size-7 items-center justify-center rounded-full bg-ink text-sm font-semibold text-surface";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="btn btn-primary sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to the page
      </a>

      <SiteHeader sections={sections} />

      <main id="main" className="flex-1">
        {/* The opening: what it is, two buttons, and a working box to try a time. */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:gap-16 lg:pb-24">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface py-1 pr-3.5 pl-1.5 text-sm font-medium text-ink-soft">
              <span className="flex size-5 items-center justify-center rounded-full bg-brand-tint text-brand">
                <Icon name="calendar" className="size-3" />
              </span>
              Amenity booking for homeowners associations
            </p>
            <h1 className="text-[2.5rem] leading-[1.05] font-semibold tracking-tight sm:text-6xl lg:text-[3.5rem] xl:text-[4rem]">
              Reserve the clubhouse without the back-and-forth.
            </h1>
            <p className="mt-6 max-w-[34rem] text-lg text-ink-soft sm:text-xl">
              ReserBa shows your subdivision&rsquo;s free hours, takes your request from your phone, and gives you a
              reference number for the gate. Two bookings for the same time are refused, so no one is double booked.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn btn-primary btn-large">
                Create a resident account
                <Icon name="arrow" />
              </Link>
              <Link href="/login" className="btn btn-quiet btn-large">
                Log in
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem] text-ink-soft">
              {["Works on any phone", "The HOA approves every request", "No double booking"].map((line) => (
                <li key={line} className="flex items-center gap-2">
                  <Icon name="check" className="size-4 text-brand" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <TryATime />
        </section>

        <section id="how" className="border-t border-line bg-surface">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
            <h2 className="max-w-2xl text-3xl font-semibold sm:text-[2.5rem]">From a free hour to the gate, in three steps.</h2>
            <p className="mt-4 max-w-[38rem] text-lg text-ink-soft">
              The HOA still decides every request. ReserBa keeps the schedule, the fees, and the record in order while
              it does.
            </p>

            <ol className="mt-12 grid gap-5 lg:grid-cols-3">
              <li>
                <div className={`${stepCard} bg-ground`}>
                  <div className="flex min-h-52 flex-col justify-center gap-4 rounded-xl bg-surface p-5" aria-hidden="true">
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
                        <div className="relative mt-1.5 h-2.5 overflow-hidden rounded-full bg-closed-tint">
                          <span className={`absolute inset-y-0 rounded-full bg-approved ${bar}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-3 pt-5 pb-4">
                    <span className={stepNumber}>1</span>
                    <h3 className="mt-4 text-xl font-semibold">Check the calendar</h3>
                    <p className="mt-2 text-ink-soft">
                      Every amenity shows its taken and free hours, so you know what is open before you ask.
                    </p>
                  </div>
                </div>
              </li>

              <li>
                <div className={`${stepCard} bg-ground`}>
                  <div className="flex min-h-52 flex-col justify-center rounded-xl bg-surface p-5" aria-hidden="true">
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
                  <div className="px-3 pt-5 pb-4">
                    <span className={stepNumber}>2</span>
                    <h3 className="mt-4 text-xl font-semibold">Send a request</h3>
                    <p className="mt-2 text-ink-soft">
                      The fee and the deposit are computed for you. The HOA administrator approves it or tells you why
                      not.
                    </p>
                  </div>
                </div>
              </li>

              <li>
                <div className={`${stepCard} bg-ground`}>
                  <div className="flex min-h-52 flex-col justify-center rounded-xl bg-surface p-5" aria-hidden="true">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-ink-soft">Reference number</p>
                        <p className="font-mono text-3xl font-semibold tracking-wide">RB-0013</p>
                      </div>
                      <StatusBadge status="approved" />
                    </div>
                    <div className="mt-4 border-t border-dashed border-line-strong pt-4 text-sm">
                      <p className="font-medium">Clubhouse</p>
                      <p className="number text-ink-soft">Sat, Nov 21, 2026, 1:00 PM to 5:00 PM</p>
                    </div>
                  </div>
                  <div className="px-3 pt-5 pb-4">
                    <span className={stepNumber}>3</span>
                    <h3 className="mt-4 text-xl font-semibold">Show your slip</h3>
                    <p className="mt-2 text-ink-soft">
                      An approved booking gets a reference number. The guard confirms it at the gate on the day.
                    </p>
                  </div>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section id="roles" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <h2 className="max-w-2xl text-3xl font-semibold sm:text-[2.5rem]">One schedule, three kinds of users.</h2>
          <p className="mt-4 max-w-[38rem] text-lg text-ink-soft">
            Each person signs in to the screens made for their part of the work, and to nothing else.
          </p>
          <div className="mt-10">
            <RoleShowcase />
          </div>
        </section>

        <section id="rules" className="border-y border-line bg-surface">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
            <h2 className="max-w-3xl text-3xl font-semibold sm:text-[2.5rem]">
              The rules are kept by the system, not by memory.
            </h2>
            <p className="mt-4 max-w-[38rem] text-lg text-ink-soft">
              A busy officer can miss an overlap in a notebook or a group chat. These checks run on every request,
              every time.
            </p>

            <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {rules.map((rule) => (
                <li key={rule.title}>
                  <span className="flex size-10 items-center justify-center rounded-xl bg-brand-tint text-brand">
                    <Icon name={rule.icon} />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{rule.title}</h3>
                  <p className="mt-1.5 text-ink-soft">{rule.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="questions"
          className="mx-auto grid w-full max-w-6xl gap-x-12 gap-y-8 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:py-28"
        >
          <div>
            <h2 className="text-3xl font-semibold sm:text-[2.5rem]">Questions residents ask first.</h2>
            <p className="mt-4 text-lg text-ink-soft">
              Something else? Ask your HOA office. They run ReserBa for your subdivision.
            </p>
          </div>
          <Faq items={questions} />
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:pb-28">
          <div className="rounded-3xl bg-brand px-6 py-14 text-center text-on-brand sm:px-12 sm:py-20">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold sm:text-[2.5rem]">
              Your next booking starts with a free hour.
            </h2>
            <p className="mx-auto mt-4 max-w-[34rem] text-lg text-on-brand/80">
              Create your account, upload your proof of residency, and book once the HOA verifies it.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/signup"
                className="btn btn-large bg-surface text-brand hover:bg-brand-tint focus-visible:outline-surface"
              >
                Create a resident account
                <Icon name="arrow" />
              </Link>
              <Link
                href="/login"
                className="btn btn-large border border-on-brand/40 text-on-brand hover:bg-on-brand/10 focus-visible:outline-surface"
              >
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
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem] font-medium md:justify-end">
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
    </>
  );
}
