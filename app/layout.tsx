import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ActionForge — Turn Meeting Transcripts into Action Items',
  description: 'AI that extracts structured, assignable action items with owners, deadlines, and one-click export. Never drop a commitment again.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}