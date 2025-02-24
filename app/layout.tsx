import type React from "react"
import "./globals.css"
import "./cursor.css"
import { Inter } from "next/font/google"
import ClientLayout from "@/components/ClientLayout"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata = {
  title: "TYPNI - The Young People's Network International",
  description: "Empowering youth globally through connection and collaboration",
  generator: 'v0.dev',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen font-sans antialiased bg-background text-foreground relative w-full overflow-x-hidden`}>
        <Providers>
          <ClientLayout>
            <main className="flex min-h-screen flex-col">
              {children}
            </main>
          </ClientLayout>
        </Providers>
      </body>
    </html>
  )
}