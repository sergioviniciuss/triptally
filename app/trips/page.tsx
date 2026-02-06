import Link from 'next/link'
import Button from '@/components/ui/Button'
import UserMenu from '@/components/ui/UserMenu'
import TripsList from '@/features/trips/TripsList'
import { listTrips } from '@/features/trips/actions'

export default async function TripsPage() {
  const result = await listTrips()
  const trips = result.success ? result.data : []

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <h1 className="text-2xl font-bold text-gray-900">TripTally</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/trips/new">
                <Button>+ Create Trip</Button>
              </Link>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TripsList trips={trips} />
      </main>
    </div>
  )
}
