import type React from "react"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import "@/app/globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
