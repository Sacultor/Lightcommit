import type { Metadata } from "next";
import { Geist, Geist_Mono, Agbalumo, Abel, Montserrat, Aboreto, Abril_Fatface } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const agbalumo = Agbalumo({
  weight: "400",
  variable: "--font-agbalumo",
  subsets: ["latin"],
});

const abel = Abel({
  weight: "400",
  variable: "--font-abel",
  subsets: ["latin"],
});

// Using Montserrat as a Gilroy alternative (similar geometric sans-serif)
// If you have Gilroy font files, see frontend/public/fonts/README.md for setup
const gilroy = Montserrat({
  weight: "400",
  variable: "--font-gilroy",
  subsets: ["latin"],
});

const aboreto = Aboreto({
  weight: "400",
  variable: "--font-aboreto",
  subsets: ["latin"],
});

const abrilFatface = Abril_Fatface({
  weight: "400",
  variable: "--font-abril-fatface",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lightcommit - Own Your Contribution",
  description: "Build your developer portfolio with verifiable, on-chain proof of your work",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${agbalumo.variable} ${abel.variable} ${gilroy.variable} ${aboreto.variable} ${abrilFatface.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
