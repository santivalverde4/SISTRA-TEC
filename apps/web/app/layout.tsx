import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";

const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body"
});

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: "SISTRA-TEC",
  description: "Donation traceability platform"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        <div className="page">
          <header className="site-header">
            <div className="brand">
              <span className="brand-mark">ST</span>
              <span className="brand-name">SISTRA-TEC</span>
            </div>
            <nav className="site-nav">
              <a href="#vision">Vision</a>
              <a href="#roles">Roles</a>
              <a href="#timeline">Timeline</a>
            </nav>
          </header>
          {children}
          <footer className="site-footer">
            <p>Built for transparent donation tracking.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
