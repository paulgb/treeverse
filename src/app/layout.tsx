import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Treeverse for Bluesky',
  description: 'Treeverse for Bluesky',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="w-full h-full">
      <body className="w-full h-full bg-gray-900 text-white">{children}</body>
    </html>
  )
}
