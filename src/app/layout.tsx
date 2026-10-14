import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import { AppRuntime } from "@/components/shell/AppRuntime";
import { SITE_URL } from "@/lib/paths";
import { THEME_SCRIPT } from "@/lib/theme-script";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const description =
  "A map of what is normal and a mirror of your own progress, for the first 24 weeks of hair regrowth treatment. Everything stays on your phone.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Week Five", template: "%s, Week Five" },
  description,
  applicationName: "Week Five",
  appleWebApp: { capable: true, title: "Week Five", statusBarStyle: "default" },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    siteName: "Week Five",
    title: "Week Five: the map and the mirror",
    description,
  },
  twitter: { card: "summary_large_image", title: "Week Five: the map and the mirror", description },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfcfd" },
    { media: "(prefers-color-scheme: dark)", color: "#0b121c" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${geist.variable} ${instrument.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <AppRuntime />
        {children}
      </body>
    </html>
  );
}
