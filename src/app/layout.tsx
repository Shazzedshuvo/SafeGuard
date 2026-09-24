import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fiverr SafeGuard Pro - Safe Message & Delivery Formatter",
  description: "Fiverr message safety scanner, English to Bangla AI translator, and smart order delivery formatter.",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
