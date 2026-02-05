import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'TripTally - Plan Your Trips',
  description: 'Mobile-first trip planning app with cost splitting',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <Toaster position="top-center" richColors />
        {children}
      </body>
    </html>
  )
}
