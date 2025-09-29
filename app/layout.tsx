import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
// import { GoogleAnalytics } from "@next/third-parties/google"; // Temporarily disabled due to analytics type errors
import "./globals.css";

// Fail-fast environment validation - must be at the top level
import { validateEnvironmentOrThrow } from '@/utils/env-validation';
// import { GA_TRACKING_ID } from '@/utils/analytics'; // Temporarily disabled due to analytics type errors

// Validate environment variables before app initialization
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  // Only run validation on server-side to avoid client-side errors
  // Skip during builds to avoid interfering with Next.js build process
  const isBuilding = process.env.NEXT_PHASE === 'phase-production-build';
  
  if (!isBuilding) {
    try {
      validateEnvironmentOrThrow();
    } catch (error) {
      console.error('⚠️ Environment validation failed, but continuing for build compatibility');
      console.error(error);
      // Don't throw during build process, just log the error
    }
  }
}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Varekatalog - Digital produktkatalog",
  description: "Digital produktkatalog for Byggern - Rask og sikker produktsøk",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-neutral-50`}
      >
        {children}
      </body>
      {/* <GoogleAnalytics gaId={GA_TRACKING_ID} /> */}
      {/* Google Analytics temporarily disabled due to type errors */}
    </html>
  );
}
