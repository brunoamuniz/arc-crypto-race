import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AppWagmiProvider } from "@/components/WagmiProvider"

export const metadata: Metadata = {
  title: "ARC CRYPTO RACE | Web3 Racing on ARC Testnet",
  description:
    "The Ultimate Crypto Racing Tournament - Only on ARC Testnet. Race for 5 minutes, top 3 win daily prizes!",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">
        <AppWagmiProvider>
          {children}
        </AppWagmiProvider>
      </body>
    </html>
  )
}
