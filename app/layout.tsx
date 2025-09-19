import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Jalan Overseas",
  description: "Your trusted partner for travel and visa services worldwide",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head></head>
      <body className="font-mondstadt">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
