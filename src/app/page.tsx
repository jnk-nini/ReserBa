import Link from "next/link";
import Faq from "@/components/faq";
import HeroTitle from "@/components/hero-title";
import Icon from "@/components/icon";
import Logo from "@/components/logo";
import Reveal from "@/components/reveal";
import RoleShowcase from "@/components/role-showcase";
import SiteHeader from "@/components/site-header";
import Spotlight from "@/components/spotlight";
import StatusBadge from "@/components/status-badge";
import TryATime from "@/components/try-a-time";

// The first page a visitor sees. From top to bottom: the bar with the links,
// the opening with a box to try a time, the row of amenities, how a booking
// goes, what each kind of user gets, the rules the system keeps, common
// questions, and the last invitation to sign up. Everything shown here is
// sample data. The moving parts are in components (hero-title, try-a-time,
// role-showcase, faq, reveal, spotlight).

const sections = [
  { href: "#how", label: "How it works" },
  { href: "#roles", label: "Who it is for" },
  { href: "#rules", label: "The rules it keeps" },
  { href: "#questions", label: "Questions" },
];

const amenities = [
  "Clubhouse",
  "Basketball court",
  "Swimming pool",
  "Gazebo",
  "Function hall",
  "Tennis court",
  "Multi-purpose hall",
  "Playground",
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

// The look shared by the boxes of the dark "rules" section.
const cell =
  "h-full rounded-3xl border border-on-deep/10 bg-linear-to-b from-on-deep/[0.07] to-on-deep/[0.02] p-6 shadow-[inset_0_1px_0_rgb(246_243_236/0.08)] sm:p-7";
const gold = "rgb(233 185 73 / 0.14)";

// The look shared by the three step boxes.
const stepCard =
  "flex h-full flex-col rounded-3xl border border-line bg-surface p-3 shadow-low transition-[transform,box-shadow] duration-300 ease-settle hover:-translate-y-1 hover:shadow-high";
const stepNumber =
  "number font-display flex size-9 items-center justify-center rounded-full bg-brand text-base font-bold text-on-brand";

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
        {/* The opening. The dark band ends behind the box, so the box looks
            like it sits on top of the page. */}
        <section className="relative isolate">
          <div className="absolute inset-x-0 top-0 -z-10 h-full overflow-hidden bg-deep lg:h-[calc(100%-6rem)]">
            <div className="aurora" />
            <div className="grid-lines absolute inset-0" />
          </div>

          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pt-28 pb-14 sm:px-6 sm:pt-32 lg:grid-cols-2 lg:pt-36 lg:pb-0">
            <div className="text-on-deep lg:pb-32">
              <p className="animate-rise mb-6 inline-flex items-center gap-2 rounded-full border border-on-deep/15 bg-on-deep/8 py-1.5 pr-4 pl-2 text-sm font-semibold text-on-deep-soft backdrop-blur-sm">
                <span className="flex size-6 items-center justify-center rounded-full bg-accent text-deep">
                  <Icon name="calendar" className="size-3.5" />
                </span>
                Amenity booking for homeowners associations
              </p>
              <HeroTitle />
              <p className="animate-rise mt-7 max-w-[34rem] text-lg text-on-deep-soft [animation-delay:350ms] sm:text-xl">
                ReserBa shows your subdivision&rsquo;s free hours, takes your request from your phone, and
                gives you a reference number for the gate. Two bookings for the same time are refused,
                so no one is double booked.
              </p>
              <div className="animate-rise mt-9 flex flex-wrap gap-3 [animation-delay:450ms]">
                <Link href="/signup" className="btn btn-accent btn-large focus-visible:outline-accent">
                  Create a resident account
                  <Icon name="arrow" />
                </Link>
                <Link href="/login" className="btn btn-ghost btn-large focus-visible:outline-accent">
                  Log in
                </Link>
              </div>
              <ul className="animate-rise mt-9 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem] text-on-deep-soft [animation-delay:550ms]">
                {["Works on any phone", "The HOA approves every request", "No double booking"].map((line) => (
                  <li key={line} className="flex items-center gap-2">
                    <Icon name="check" className="size-4 text-accent" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div className="animate-rise relative [animation-delay:250ms]">
              <div className="absolute inset-0 -z-10 rounded-[2.5rem] lg:-inset-6 bg-accent/20 blur-3xl" />
              <TryATime />

              {/* Two small cards that float beside the box on a wide screen. */}
              <div
                aria-hidden="true"
                className="glass float absolute -top-16 -left-12 hidden items-center gap-3 rounded-2xl px-4 py-3 text-on-deep xl:flex"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-accent text-deep">
                  <Icon name="check" className="size-4" />
                </span>
                <span className="text-sm leading-tight">
                  <span className="block font-bold">Request approved</span>
                  <span className="font-mono text-on-deep-soft">RB-0013</span>
                </span>
              </div>
              <div
                aria-hidden="true"
                className="float-late absolute -right-10 -bottom-7 hidden items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-high xl:flex"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-brand-tint text-brand">
                  <Icon name="shield" className="size-4" />
                </span>
                <span className="text-sm leading-tight">
                  <span className="block font-bold">Confirmed at the gate</span>
                  <span className="text-ink-soft">Clubhouse, 1:00 PM</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Amenities a homeowners association can list" className="pt-16 lg:pt-20">
          <p className="text-center text-sm font-semibold text-ink-soft">
            One calendar for every shared space in the subdivision
          </p>
          <div className="fade-sides mt-5 overflow-hidden">
            <ul className="marquee">
              {[...amenities, ...amenities].map((name, index) => (
                <li
                  key={index}
                  aria-hidden={index >= amenities.length}
                  className="font-display flex items-center gap-8 pr-8 text-2xl font-bold whitespace-nowrap text-ink/70 sm:text-3xl"
                >
                  {name}
                  <span className="size-2 rounded-full bg-accent" />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="how" className="mx-auto w-full max-w-6xl px-4 pt-20 pb-4 sm:px-6 lg:pt-28">
          <Reveal>
            <h2 className="max-w-2xl text-3xl font-bold sm:text-5xl">From a free hour to the gate, in three steps.</h2>
            <p className="mt-5 max-w-[38rem] text-lg text-ink-soft">
              The HOA still decides every request. ReserBa keeps the schedule, the fees, and the record in
              order while it does.
            </p>
          </Reveal>

          <ol className="mt-12 grid gap-6 lg:grid-cols-3">
            <li>
              <Reveal className="h-full">
                <Spotlight className={stepCard}>
                  <div
                    className="flex min-h-52 flex-col justify-center gap-4 rounded-2xl bg-ground p-5"
                    aria-hidden="true"
                  >
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
                        <div className="relative mt-1.5 h-3 overflow-hidden rounded-full bg-closed-tint">
                          <span className={`absolute inset-y-0 rounded-full bg-approved ${bar}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-3 pt-5 pb-4">
                    <span className={stepNumber}>1</span>
                    <h3 className="mt-4 text-xl font-bold">Check the calendar</h3>
                    <p className="mt-2 text-ink-soft">
                      Every amenity shows its taken and free hours, so you know what is open before you ask.
                    </p>
                  </div>
                </Spotlight>
              </Reveal>
            </li>

            <li>
              <Reveal delay={0.1} className="h-full">
                <Spotlight className={stepCard}>
                  <div className="flex min-h-52 flex-col justify-center rounded-2xl bg-ground p-5" aria-hidden="true">
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
                      <div className="mt-1 flex items-center justify-between gap-3 border-t border-line-strong pt-3 text-base">
                        <dt className="font-bold">To pay</dt>
                        <dd className="font-bold">₱3,250.00</dd>
                      </div>
                    </dl>
                    <div className="mt-3">
                      <StatusBadge status="pending" />
                    </div>
                  </div>
                  <div className="px-3 pt-5 pb-4">
                    <span className={stepNumber}>2</span>
                    <h3 className="mt-4 text-xl font-bold">Send a request</h3>
                    <p className="mt-2 text-ink-soft">
                      The fee and the deposit are computed for you. The HOA administrator approves it or
                      tells you why not.
                    </p>
                  </div>
                </Spotlight>
              </Reveal>
            </li>

            <li>
              <Reveal delay={0.2} className="h-full">
                <Spotlight className={stepCard}>
                  <div className="flex min-h-52 flex-col justify-center rounded-2xl bg-ground p-5" aria-hidden="true">
                    <div className="rounded-xl border border-line bg-surface p-4 shadow-low">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm text-ink-soft">Reference number</p>
                          <p className="font-mono text-3xl font-semibold tracking-wide">RB-0013</p>
                        </div>
                        <StatusBadge status="approved" />
                      </div>
                      <div className="mt-3 border-t border-dashed border-line-strong pt-3 text-sm">
                        <p className="font-semibold">Clubhouse</p>
                        <p className="number text-ink-soft">Sat, Nov 21, 2026, 1:00 PM to 5:00 PM</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 pt-5 pb-4">
                    <span className={stepNumber}>3</span>
                    <h3 className="mt-4 text-xl font-bold">Show your slip</h3>
                    <p className="mt-2 text-ink-soft">
                      An approved booking gets a reference number. The guard confirms it at the gate on
                      the day.
                    </p>
                  </div>
                </Spotlight>
              </Reveal>
            </li>
          </ol>
        </section>

        <section id="roles" className="mx-auto w-full max-w-6xl px-4 pt-24 sm:px-6 lg:pt-32">
          <Reveal>
            <h2 className="max-w-2xl text-3xl font-bold sm:text-5xl">One schedule, three kinds of users.</h2>
            <p className="mt-5 max-w-[38rem] text-lg text-ink-soft">
              Each person signs in to the screens made for their part of the work, and to nothing else.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-10">
            <RoleShowcase />
          </Reveal>
        </section>

        <section id="rules" className="relative isolate mt-24 overflow-hidden bg-deep text-on-deep lg:mt-32">
          <div className="aurora -z-10 opacity-70" />
          <div className="grid-lines absolute inset-0 -z-10" />
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
            <Reveal>
              <h2 className="max-w-3xl text-3xl font-bold sm:text-5xl">
                The rules are kept by the system, <span className="text-accent">not by memory.</span>
              </h2>
              <p className="mt-5 max-w-[38rem] text-lg text-on-deep-soft">
                A busy officer can miss an overlap in a notebook or a group chat. These checks run on
                every request, every time.
              </p>
            </Reveal>

            <ul className="mt-12 grid gap-4 lg:grid-cols-6">
              <li className="lg:col-span-4">
                <Reveal className="h-full">
                  <Spotlight color={gold} className={cell}>
                    <div
                      className="flex flex-col gap-2.5 rounded-2xl border border-on-deep/10 bg-deep/60 p-4"
                      aria-hidden="true"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-14 shrink-0 text-sm text-on-deep-soft sm:w-20">Santos</span>
                        <div className="relative h-8 grow rounded-lg bg-on-deep/8">
                          <span className="absolute inset-y-0 left-[25%] flex w-[45%] items-center justify-center rounded-lg bg-[#2f8f6a] text-xs font-bold whitespace-nowrap">
                            1 PM to 5 PM
                          </span>
                        </div>
                        <span className="w-16 shrink-0 text-right text-sm font-semibold text-[#8fd9b6]">Saved</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-14 shrink-0 text-sm text-on-deep-soft sm:w-20">Reyes</span>
                        <div className="relative h-8 grow rounded-lg bg-on-deep/8">
                          <span className="absolute inset-y-0 left-[48%] flex w-[45%] items-center justify-center rounded-lg border border-dashed border-[#ff9d8a] bg-[#ff9d8a]/15 text-xs font-bold whitespace-nowrap text-[#ffb7a8] line-through">
                            3 PM to 7 PM
                          </span>
                        </div>
                        <span className="w-16 shrink-0 text-right text-sm font-semibold text-[#ffb7a8]">Refused</span>
                      </div>
                    </div>
                    <h3 className="mt-6 text-xl font-bold">No double booking</h3>
                    <p className="mt-2 max-w-[34rem] text-on-deep-soft">
                      The database itself refuses two reservations for the same amenity at the same time,
                      even when two people press the button in the same second.
                    </p>
                  </Spotlight>
                </Reveal>
              </li>

              <li className="lg:col-span-2">
                <Reveal delay={0.1} className="h-full">
                  <Spotlight color={gold} className={cell}>
                    <div className="rounded-2xl border border-on-deep/10 bg-deep/60 p-4" aria-hidden="true">
                      <div className="flex h-8 overflow-hidden rounded-lg bg-on-deep/8">
                        <span className="w-[45%] rounded-lg bg-[#2f8f6a]" />
                        <span className="stripes w-[20%] opacity-60" />
                      </div>
                      <p className="mt-2 flex justify-between text-xs text-on-deep-soft">
                        <span>Booking</span>
                        <span className="font-semibold text-accent">60 min buffer</span>
                        <span>Next</span>
                      </p>
                    </div>
                    <h3 className="mt-6 text-xl font-bold">Buffer time between bookings</h3>
                    <p className="mt-2 text-on-deep-soft">
                      Time stays free after each booking for cleaning and turnover.
                    </p>
                  </Spotlight>
                </Reveal>
              </li>

              <li className="lg:col-span-2">
                <Reveal className="h-full">
                  <Spotlight color={gold} className={cell}>
                    <div
                      className="grid grid-cols-7 gap-1.5 rounded-2xl border border-on-deep/10 bg-deep/60 p-4"
                      aria-hidden="true"
                    >
                      {Array.from({ length: 14 }, (_, day) => (
                        <span
                          key={day}
                          className={`number flex h-8 items-center justify-center rounded-md text-xs ${
                            day === 9 || day === 10
                              ? "stripes font-bold text-deep"
                              : "bg-on-deep/8 text-on-deep-soft"
                          }`}
                        >
                          {day + 8}
                        </span>
                      ))}
                    </div>
                    <h3 className="mt-6 text-xl font-bold">Blocked dates stay blocked</h3>
                    <p className="mt-2 text-on-deep-soft">
                      Maintenance days and HOA events are marked once. No request can land on them.
                    </p>
                  </Spotlight>
                </Reveal>
              </li>

              <li className="lg:col-span-2">
                <Reveal delay={0.1} className="h-full">
                  <Spotlight color={gold} className={cell}>
                    <div className="number rounded-2xl border border-on-deep/10 bg-deep/60 p-4" aria-hidden="true">
                      <p className="text-sm text-on-deep-soft">4 hours at ₱500.00</p>
                      <p className="font-display mt-1 text-4xl leading-none font-bold">₱2,000.00</p>
                    </div>
                    <h3 className="mt-6 text-xl font-bold">Fees computed the same way</h3>
                    <p className="mt-2 text-on-deep-soft">
                      Hours times the rate, plus any equipment. Nobody adds it up by hand.
                    </p>
                  </Spotlight>
                </Reveal>
              </li>

              <li className="lg:col-span-2">
                <Reveal delay={0.2} className="h-full">
                  <Spotlight color={gold} className={cell}>
                    <ul
                      className="flex flex-col gap-2 rounded-2xl border border-on-deep/10 bg-deep/60 p-4 text-xs"
                      aria-hidden="true"
                    >
                      {[
                        ["9:02 AM", "Request approved"],
                        ["9:15 AM", "Payment recorded"],
                        ["4:40 PM", "Rate changed"],
                      ].map(([time, action]) => (
                        <li key={time} className="flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-accent" />
                          <span className="number w-14 text-on-deep-soft">{time}</span>
                          <span className="grow font-semibold">{action}</span>
                        </li>
                      ))}
                    </ul>
                    <h3 className="mt-6 text-xl font-bold">A record of every change</h3>
                    <p className="mt-2 text-on-deep-soft">
                      Approvals, rejections, and payments go to an audit log with the name and the time.
                    </p>
                  </Spotlight>
                </Reveal>
              </li>

              <li className="lg:col-span-6">
                <Reveal className="h-full">
                  <Spotlight color={gold} className={`${cell} flex flex-col gap-5 sm:flex-row sm:items-center`}>
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-deep">
                      <Icon name="lock" className="size-6" />
                    </span>
                    <div>
                      <h3 className="text-xl font-bold">Each person sees only what they should</h3>
                      <p className="mt-1 max-w-[46rem] text-on-deep-soft">
                        Residents see their own reservations. Guards see today. Proofs of residency and
                        payment stay in private storage, collected with consent under the Data Privacy
                        Act of 2012.
                      </p>
                    </div>
                  </Spotlight>
                </Reveal>
              </li>
            </ul>
          </div>
        </section>

        <section
          id="questions"
          className="mx-auto grid w-full max-w-6xl gap-x-12 gap-y-8 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:py-28"
        >
          <Reveal>
            <h2 className="text-3xl font-bold sm:text-5xl">Questions residents ask first.</h2>
            <p className="mt-5 text-lg text-ink-soft">
              Something else? Ask your HOA office. They run ReserBa for your subdivision.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Faq items={questions} />
          </Reveal>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:pb-28">
          <Reveal>
            <div className="relative isolate overflow-hidden rounded-[2rem] bg-deep px-6 py-14 text-center text-on-deep shadow-high sm:px-12 sm:py-20">
              <div className="aurora -z-10" />
              <div className="grid-lines absolute inset-0 -z-10" />
              <h2 className="mx-auto max-w-2xl text-3xl font-bold sm:text-5xl">
                Your next booking starts with a free hour.
              </h2>
              <p className="mx-auto mt-5 max-w-[34rem] text-lg text-on-deep-soft">
                Create your account, upload your proof of residency, and book once the HOA verifies it.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Link href="/signup" className="btn btn-accent btn-large focus-visible:outline-accent">
                  Create a resident account
                  <Icon name="arrow" />
                </Link>
                <Link href="/login" className="btn btn-ghost btn-large focus-visible:outline-accent">
                  Log in
                </Link>
              </div>
            </div>
          </Reveal>
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
