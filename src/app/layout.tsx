import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResumeTailor — AI-Powered English Resume Builder",
  description: "Upload your raw career experience, chat with AI to mine your achievements, get a polished English resume ready for overseas job applications.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 antialiased">
        {children}
      </body>
    </html>
  );
}
