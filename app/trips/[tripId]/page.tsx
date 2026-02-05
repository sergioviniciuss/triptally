'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import FlightsTab from '@/features/flights/FlightsTab'
import TransportTab from '@/features/transport/TransportTab'
import LodgingTab from '@/features/lodging/LodgingTab'
import ItineraryTab from '@/features/itinerary/ItineraryTab'
import TotalTab from '@/features/total/TotalTab'
import { getTrip } from '@/features/trips/actions'
import { calculateTripTotals } from '@/lib/totals'
import { prisma } from '@/lib/prisma'

interface PageProps {
  params: Promise<{ tripId: string }>
}

export default function TripDetailPage({ params }: PageProps) {
  const { tripId } = use(params)
  const [trip, setTrip] = useState<any>(null)
  const [totals, setTotals] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrip()
  }, [tripId])

  const loadTrip = async () => {
    const result = await getTrip(tripId)
    if (result.success) {
      setTrip(result.data)
      setActiveTab(result.data.type === 'FLIGHT' ? 'flights' : 'itinerary')
      
      // Calculate totals
      const totalsData = await fetch(`/api/totals/${tripId}`).then(r => r.json()).catch(() => null)
      if (totalsData) {
        setTotals(totalsData)
      }
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trip...</p>
        </div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Trip not found</p>
          <Link href="/trips">
            <Button>Back to Trips</Button>
          </Link>
        </div>
      </div>
    )
  }

  const tabs = trip.type === 'FLIGHT'
    ? [
        { id: 'flights', label: 'Flights' },
        { id: 'transport', label: 'Transport' },
        { id: 'lodging', label: 'Lodging' },
        { id: 'total', label: 'Total' },
      ]
    : [
        { id: 'itinerary', label: 'Itinerary' },
        { id: 'transport', label: 'Transport' },
        { id: 'lodging', label: 'Lodging' },
        { id: 'total', label: 'Total' },
      ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/trips">
                <Button variant="ghost" size="sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{trip.name}</h1>
                <p className="text-sm text-gray-600">
                  {trip.destination} • {trip.year} • {trip.type === 'FLIGHT' ? 'Flight' : 'Road'} Trip
                </p>
              </div>
            </div>
          </div>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'flights' && trip.type === 'FLIGHT' && (
          <FlightsTab
            tripId={tripId}
            flights={trip.flightOptions}
            participants={trip.participants}
            currency={trip.currency}
          />
        )}

        {activeTab === 'itinerary' && trip.type === 'ROAD' && (
          <ItineraryTab tripId={tripId} items={trip.itineraryItems} />
        )}

        {activeTab === 'transport' && (
          <TransportTab
            tripId={tripId}
            items={trip.transportItems}
            participants={trip.participants}
            currency={trip.currency}
          />
        )}

        {activeTab === 'lodging' && (
          <LodgingTab
            tripId={tripId}
            stays={trip.lodgingStays}
            participants={trip.participants}
            currency={trip.currency}
          />
        )}

        {activeTab === 'total' && totals && (
          <TotalTab
            tripId={tripId}
            participants={trip.participants}
            tripData={{
              flightOptions: trip.flightOptions,
              transportItems: trip.transportItems,
              lodgingStays: trip.lodgingStays,
            }}
            currency={trip.currency}
            totals={totals}
          />
        )}
      </main>
    </div>
  )
}
