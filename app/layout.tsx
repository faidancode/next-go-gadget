import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ReactQueryProvider from "./provider/react-query-provider";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "GoGadget",
  description: "High quality products at affordable prices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jakartaSans.className} antialiased min-h-screen flex flex-col`}
      >
        <ReactQueryProvider>
          {children}
          <Toaster richColors position="top-center" />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
