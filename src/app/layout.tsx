import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import Toaster from "@/components/toaster";
import "./globals.css";

// Geist for everything you read and tap. The serif is for the few large
// headlines on the first page and the sign-in screens, so it stays special.
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const serif = Instrument_Serif({
  variable: "--font-display-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

// Used for reference numbers such as RB-0013, so each character is clear.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "ReserBa", template: "%s" },
  description: "Community amenity booking and schedule conflict detection for homeowners associations.",
  applicationName: "ReserBa",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#09100d" },
  ],
  colorScheme: "light dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${serif.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
