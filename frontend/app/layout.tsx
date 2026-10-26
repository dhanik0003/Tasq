import "@/styles/globals.css"
import "@/styles/DynamicIslandTodo.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import { ThemeProvider } from "@/components/ThemeProvider"
import ThemedBackground from "@/components/ThemedBackground"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "Tasq",
  description: "A modern task manager with a sleek glassmorphic dynamic island interface",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script src="https://unpkg.com/framer-motion@10.12.16/dist/framer-motion.js" strategy="async" />
      </head>
      <body className={`${inter.className} relative min-h-screen overflow-x-hidden`}>
        <ThemeProvider>
          <ThemedBackground />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
