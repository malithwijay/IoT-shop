import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "IoT Shop",
  description: "Arduino, ESP32 & IoT components",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* IMPORTANT: no overflow-hidden here */}
      <body className="min-h-screen bg-white antialiased">
        <Navbar />

        {/* IMPORTANT: do NOT set overflow-hidden on main */}
        <main className="min-h-[calc(100vh-64px)]">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
