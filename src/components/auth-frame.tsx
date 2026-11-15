import Link from "next/link";

// The frame around the login, sign-up, and password screens.
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
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-10">
      <Link href="/" className="text-xl font-bold tracking-tight text-brand">
        ReserBa
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-base text-ink-soft">{description}</p>}
      </div>
      {children}
    </main>
  );
}
