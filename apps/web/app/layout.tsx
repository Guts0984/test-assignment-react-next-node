import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shop",
  description: "Product catalog",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="border-b">
          <nav className="mx-auto flex w-full max-w-6xl items-center gap-6 px-6 py-4">
            <Link href="/" className="text-lg font-semibold">
              Shop
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Catalog
            </Link>
            <Link href="/cart" className="text-sm text-muted-foreground hover:text-foreground">
              Cart
            </Link>
          </nav>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
