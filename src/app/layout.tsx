import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist_Mono, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

// Titles are set in a serif; everything that is read or tapped is set in a
// plain sans, so forms and tables stay easy to scan.
const title = Cormorant_Garamond({
  variable: "--font-title",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

// "latin-ext" carries the peso sign.
const body = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
});

// Used only for reference numbers such as RB-0013, so each character is clear.
const code = Geist_Mono({
  variable: "--font-code",
  subsets: ["latin"],
});

const description =
  "ReserBa lets residents see free hours, request the clubhouse, court, or pool, and show a reference number at the gate. The system refuses overlapping bookings.";

export const metadata: Metadata = {
  title: "ReserBa | Amenity booking for homeowners associations",
  description,
  applicationName: "ReserBa",
  openGraph: {
    title: "ReserBa | Amenity booking for homeowners associations",
    description,
    type: "website",
    locale: "en_PH",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f2ed",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${title.variable} ${body.variable} ${code.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
