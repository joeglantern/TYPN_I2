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
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.variable} min-h-screen font-sans antialiased bg-background text-foreground`}>
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  )
}