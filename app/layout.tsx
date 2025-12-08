import type React from "react"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { FhirVersionProvider } from "@/lib/fhir-version-context"
import "@/app/globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FhirVersionProvider>
            {children}
          </FhirVersionProvider>
        </ThemeProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
