import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Public_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

// The typeface of the headings. The body text stays in Public Sans.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

// Used only for reference numbers such as RB-0013, so each character is clear.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
  themeColor: "#10352a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${bricolage.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
