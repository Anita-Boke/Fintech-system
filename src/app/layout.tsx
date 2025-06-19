import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ThemeWrapper } from "@/contexts/ThemeContext";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Fintech Dashboard",
  description: "Modern financial dashboard application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <AuthProvider>
          <ThemeProvider>
            <ThemeWrapper>
              {children}
            </ThemeWrapper>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}