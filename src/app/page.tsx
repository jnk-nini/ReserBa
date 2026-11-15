import Link from "next/link";
import DayStrip, { StripLegend } from "@/components/day-strip";

// The first page a visitor sees. It says what ReserBa is for and leads to
// log in or sign up. The bar is a sample of the day strip used inside the app.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-4 py-12">
      <div>
        <p className="text-xl font-bold tracking-tight text-brand">ReserBa</p>
        <h1 className="mt-4 text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
          Reserve the clubhouse, court, or pool without the back-and-forth.
        </h1>
        <p className="mt-4 max-w-prose text-lg text-ink-soft">
          See which times are free, send your request from your phone, and show your reference number
          at the gate. The system refuses two bookings for the same time, so no one is double booked.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login" className="btn btn-primary">
            Log in
          </Link>
          <Link href="/signup" className="btn btn-quiet">
            Create a resident account
          </Link>
        </div>
      </div>

      <figure className="panel">
        <figcaption className="mb-3 text-base font-semibold">
          A sample day at the clubhouse, 8 AM to 10 PM
        </figcaption>
        <DayStrip
          openMinutes={480}
          closeMinutes={1320}
          segments={[
            { from: 540, to: 720, kind: "blocked" },
            { from: 840, to: 1080, kind: "approved" },
            { from: 1140, to: 1260, kind: "pending" },
          ]}
        />
        <div className="mt-3">
          <StripLegend />
        </div>
      </figure>

      <ol className="grid gap-6 text-base sm:grid-cols-3">
        <li>
          <p className="font-semibold">1. Check the calendar</p>
          <p className="mt-1 text-ink-soft">Every amenity shows its taken and free hours, any time of day.</p>
        </li>
        <li>
          <p className="font-semibold">2. Send a request</p>
          <p className="mt-1 text-ink-soft">The fee and deposit are computed for you. The HOA approves it.</p>
        </li>
        <li>
          <p className="font-semibold">3. Show your slip</p>
          <p className="mt-1 text-ink-soft">The guard confirms your reference number on the day.</p>
        </li>
      </ol>
    </main>
  );
}
