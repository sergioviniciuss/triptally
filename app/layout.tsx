import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import SessionProvider from '@/components/providers/SessionProvider'
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
        <SessionProvider>
          <Toaster position="top-center" richColors />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
