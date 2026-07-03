"use client";

import { ThemeProvider } from "next-themes";
import { Toaster as SonnerToaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
      <SonnerToaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "0.9rem",
            border: "1px solid var(--border)",
          },
        }}
      />
    </ThemeProvider>
  );
}
