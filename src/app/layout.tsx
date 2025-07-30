
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/components/providers/trpc-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/toaster";
import { ThemeWrapper } from "@/components/layout/theme-wrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Layanify CRM - WhatsApp Business Management",
  description: "Manage your WhatsApp Business API with AI-powered workflows and automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <SessionProvider>
          <TRPCProvider>
            <ThemeWrapper>
              {children}
              <Toaster />
            </ThemeWrapper>
          </TRPCProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
