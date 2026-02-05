'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { formatCurrency } from '@/lib/utils'
import { duplicateTrip, deleteTrip } from './actions'
import { toast } from 'sonner'

interface Trip {
  id: string
  name: string
  destination: string
  year: number
  currency: string
  type: string
  isCandidate: boolean
  flightOptions: { amount: number }[]
  transportItems: { amount: number }[]
  lodgingStays: { amount: number }[]
}

export default function TripsList({ trips: initialTrips }: { trips: Trip[] }) {
  const router = useRouter()
  const [trips, setTrips] = useState(initialTrips)

  const handleDuplicate = async (tripId: string, clearValues: boolean) => {
    const result = await duplicateTrip(tripId, clearValues)
    if (result.success) {
      toast.success('Trip duplicated')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to duplicate trip')
    }
  }

  const handleDelete = async (tripId: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return

    const result = await deleteTrip(tripId)
    if (result.success) {
      toast.success('Trip deleted')
      setTrips(trips.filter((t) => t.id !== tripId))
    } else {
      toast.error(result.error || 'Failed to delete trip')
    }
  }

  const calculateTotal = (trip: Trip) => {
    const flights = trip.flightOptions.reduce((sum, f) => sum + f.amount, 0)
    const transport = trip.transportItems.reduce((sum, t) => sum + t.amount, 0)
    const lodging = trip.lodgingStays.reduce((sum, l) => sum + l.amount, 0)
    return flights + transport + lodging
  }

  if (trips.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        }
        title="No trips yet"
        description="Create your first trip to start planning"
        action={
          <Link href="/trips/new">
            <Button>Create Trip</Button>
          </Link>
        }
      />
    )
  }

  const candidates = trips.filter((t) => t.isCandidate)

  return (
    <div className="space-y-4">
      {candidates.length > 0 && (
        <Card>
          <h3 className="font-medium mb-2">Candidate Trips</h3>
          <div className="text-sm text-gray-600 space-y-1">
            {candidates.map((trip) => (
              <div key={trip.id} className="flex justify-between">
                <span>{trip.name}</span>
                <span className="font-medium">{formatCurrency(calculateTotal(trip), trip.currency)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => (
          <Card key={trip.id} className="hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <Link href={`/trips/${trip.id}`} className="flex-1">
                <h3 className="font-semibold text-lg hover:text-primary">{trip.name}</h3>
                <p className="text-sm text-gray-600">
                  {trip.destination} • {trip.year}
                </p>
              </Link>
              {trip.isCandidate && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Candidate</span>
              )}
            </div>

            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600">Total</span>
                <span className="font-semibold text-lg">
                  {formatCurrency(calculateTotal(trip), trip.currency)}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDuplicate(trip.id, false)}
                  className="flex-1"
                >
                  Duplicate
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(trip.id)}
                  className="text-red-600"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
