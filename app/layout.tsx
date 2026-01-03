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
<<<<<<< HEAD
      {/* IMPORTANT: no overflow-hidden here */}
      <body className="min-h-screen bg-white antialiased">
        <Navbar />

        {/* IMPORTANT: do NOT set overflow-hidden on main */}
        <main className="min-h-[calc(100vh-64px)]">
=======
      <body className="antialiased bg-white">
        <Navbar />

        {/* Page content */}
        <main className="min-h-[calc(100vh-64px-56px)]">
>>>>>>> 5fe317a2a240799c4ddf2058c2b88f7093cd2e2f
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 5fe317a2a240799c4ddf2058c2b88f7093cd2e2f
