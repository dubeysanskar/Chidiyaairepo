import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "ChidiyaAI - Your B2B Sourcing Partner",
  description: "ChidiyaAI is a buyer-controlled, privacy-first B2B sourcing platform. Find verified suppliers with AI-powered matching.",
  keywords: "B2B sourcing, supplier matching, wholesale, AI sourcing, verified suppliers",
  authors: [{ name: "ChidiyaAI" }],
  openGraph: {
    title: "ChidiyaAI - Your B2B Sourcing Partner",
    description: "Find verified suppliers with intelligent, privacy-first sourcing.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
