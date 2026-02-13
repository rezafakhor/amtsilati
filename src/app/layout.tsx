import type { Metadata } from "next";
import { Inter, Playfair_Display, Amiri, Courgette } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const amiri = Amiri({ 
  weight: ["400", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-amiri"
});
const courgette = Courgette({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-courgette"
});

export const metadata: Metadata = {
  title: "PAWEDARAN by AMTSILATI JABAR I",
  description: "Platform E-Commerce Kitab Islami Premium",
  icons: {
    icon: '/asset/img/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} ${playfair.variable} ${amiri.variable} ${courgette.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
