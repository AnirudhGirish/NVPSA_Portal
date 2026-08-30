import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const SITE_URL = "https://nvpsa.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "N.V. Past Students Association | Nutan Vidyalaya Society, Kalaburagi",
    template: "%s | NVPSA Kalaburagi",
  },
  description:
    "Official digital alumni registry and life-member portal of Nutan Vidyalaya Society's Past Students Association (NVPSA), Kalaburagi. Preserving legacy, reconnecting alumni, and empowering the future.",
  keywords: [
    "NVPSA",
    "Nutan Vidyalaya",
    "NV Society Kalaburagi",
    "Gulbarga Alumni",
    "Past Students Association",
    "N.V. Degree College",
    "Alumni Portal",
  ],
  authors: [{ name: "Nutan Vidyalaya Society" }],
  creator: "Nutan Vidyalaya Past Students Association",
  publisher: "Nutan Vidyalaya Education Society",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    title: "N.V. Past Students Association (NVPSA) | Official Alumni Portal",
    description:
      "Official life-member verification and alumni registry for Nutan Vidyalaya Society, Kalaburagi (Est. 1907).",
    siteName: "NVPSA Official Portal",
  },
  twitter: {
    card: "summary_large_image",
    title: "N.V. Past Students Association | Kalaburagi",
    description: "Connecting generations of Nutan Vidyalaya alumni across the globe.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Nutan Vidyalaya Education Society",
  alternateName: "NV Society Kalaburagi",
  url: SITE_URL,
  address: {
    "@type": "PostalAddress",
    streetAddress: "N.V. Society Campus, Samarth Nagar",
    addressLocality: "Kalaburagi",
    addressRegion: "Karnataka",
    postalCode: "585102",
    addressCountry: "IN",
  },
  foundingDate: "1907",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
