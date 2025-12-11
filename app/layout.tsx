import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AppWagmiProvider } from "@/components/WagmiProvider"
import { UsernameCheckProvider } from "@/components/UsernameCheckProvider"

export const metadata: Metadata = {
  title: "ARC CRYPTO RACE | Web3 Racing on ARC Testnet",
  description:
    "The Ultimate Crypto Racing Tournament - Only on ARC Testnet. Race for 5 minutes, top 3 win daily prizes!",
  applicationName: 'ARC CRYPTO RACE',
  keywords: ['ARC Testnet', 'Web3', 'Crypto Racing', 'DeFi', 'Blockchain Gaming', 'USDC Prizes', 'Tournament'],
  authors: [{ name: 'ARC CRYPTO RACE' }],
  creator: 'ARC CRYPTO RACE',
  publisher: 'ARC CRYPTO RACE',
  metadataBase: new URL('https://arccryptorace.xyz'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { url: '/icon-dark-32x32.png', type: 'image/png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon-light-32x32.png', type: 'image/png', media: '(prefers-color-scheme: light)' },
    ],
    shortcut: '/icon.svg',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://arccryptorace.xyz',
    siteName: 'ARC CRYPTO RACE',
    title: 'ARC CRYPTO RACE | Web3 Racing Tournament on ARC Testnet',
    description: 'The Ultimate Crypto Racing Tournament! Race for 5 minutes, compete for daily USDC prizes. Top 3 players win the prize pool. Only on ARC Testnet.',
    images: [
      {
        url: '/images/retro-racing-hero.png',
        width: 1200,
        height: 630,
        alt: 'ARC CRYPTO RACE - Web3 Racing Tournament',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ARC CRYPTO RACE | Web3 Racing Tournament',
    description: 'Race for 5 minutes, compete for daily USDC prizes. Top 3 players win. Only on ARC Testnet.',
    images: ['/images/retro-racing-hero.png'],
    creator: '@ARC',
    site: '@ARC',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="antialiased">
        <AppWagmiProvider>
          <UsernameCheckProvider />
          {children}
        </AppWagmiProvider>
      </body>
    </html>
  )
}
