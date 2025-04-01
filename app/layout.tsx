import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import HashConnectScript from "@/app/components/HashConnectScript";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hedera Stock Trader",
  description: "Trade stocks on the Hedera network",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <HashConnectScript />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-900">
          <Navbar />
          <main className="pt-16">{children}</main>
        </div>
      </body>
    </html>
  );
}
