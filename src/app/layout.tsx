import { Inter } from "next/font/google";
import { Metadata } from "next";
import { ThirdwebProvider } from "thirdweb/react";
import { ThemeProvider } from "@/components/ui/theme-provider";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "thirdweb SDK + Next starter",
  description:
    "Starter template for using thirdweb SDK with Next.js App router",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="white"
          enableSystem
          disableTransitionOnChange
        >
          <ThirdwebProvider>{children}</ThirdwebProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
