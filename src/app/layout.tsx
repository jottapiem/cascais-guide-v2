import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cascais — Travel Discovery",
  description: "Ontdek Cascais als een local. Stranden, food, sunset spots, events en hidden gems in één visuele app.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#F7F6F4",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl" suppressHydrationWarning style={{ margin: 0, padding: 0, height: "100%", width: "100%" }}>
      <body className={`${jakarta.variable} font-sans antialiased bg-background text-foreground`} style={{ margin: 0, padding: 0, WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale", textRendering: "optimizeLegibility" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
