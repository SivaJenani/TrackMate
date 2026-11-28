import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrackMate - Productivity & Progress Tracker",
  description: "Track your tasks, goals, and habits. Build consistent routines and monitor your productivity with TrackMate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-cyan-50/30 via-white to-blue-50/20">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0F1424',
              color: '#fff',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#00B4F0', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  );
}
