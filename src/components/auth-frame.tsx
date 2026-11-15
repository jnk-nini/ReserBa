import Link from "next/link";

// The frame around the login, sign-up, and password screens: a frosted card
// on the deep green ground.
export default function AuthFrame({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="emerald flex flex-1 flex-col bg-fixed">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-10">
        <Link href="/" className="flex min-h-11 items-center self-start text-xl font-extrabold tracking-tight text-white">
          ReserBa
        </Link>
        <div className="flex flex-col gap-6 rounded-3xl border border-white/60 bg-white/95 p-6 text-ink shadow-float backdrop-blur-xl sm:p-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-[-0.03em]">{title}</h1>
            {description && <p className="mt-1.5 text-base text-ink-soft">{description}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
