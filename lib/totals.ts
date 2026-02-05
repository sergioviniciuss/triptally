import { prisma } from './prisma'

export interface TripTotals {
  flightsTotal: number
  transportTotal: number
  lodgingTotal: number
  grandTotal: number
  totalDays: number
}

export async function calculateTripTotals(tripId: string): Promise<TripTotals> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      flightOptions: { where: { isSelected: true } },
      transportItems: { where: { isSelected: true } },
      lodgingStays: true,
      itineraryItems: true,
    },
  })

  if (!trip) {
    return {
      flightsTotal: 0,
      transportTotal: 0,
      lodgingTotal: 0,
      grandTotal: 0,
      totalDays: 0,
    }
  }

  const flightsTotal = trip.flightOptions.reduce((sum, f) => sum + f.amount, 0)
  const transportTotal = trip.transportItems.reduce((sum, t) => sum + t.amount, 0)
  const lodgingTotal = trip.lodgingStays.reduce((sum, l) => sum + l.amount, 0)
  const grandTotal = flightsTotal + transportTotal + lodgingTotal

  // Calculate total days
  let totalDays = 0

  if (trip.dateRangeStart && trip.dateRangeEnd) {
    const start = new Date(trip.dateRangeStart)
    const end = new Date(trip.dateRangeEnd)
    totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  } else if (trip.lodgingStays.length > 0) {
    const checkIns = trip.lodgingStays.map((l) => new Date(l.checkIn).getTime())
    const checkOuts = trip.lodgingStays.map((l) => new Date(l.checkOut).getTime())
    const minCheckIn = Math.min(...checkIns)
    const maxCheckOut = Math.max(...checkOuts)
    totalDays = Math.ceil((maxCheckOut - minCheckIn) / (1000 * 60 * 60 * 24))
  } else if (trip.flightOptions.length > 0) {
    const selectedFlight = trip.flightOptions[0]
    const departDate = new Date(selectedFlight.departDate)
    const returnDate = new Date(selectedFlight.returnDate)
    totalDays = Math.ceil((returnDate.getTime() - departDate.getTime()) / (1000 * 60 * 60 * 24))
  } else if (trip.type === 'ROAD' && trip.itineraryItems.length > 0) {
    totalDays = trip.itineraryItems.length
  }

  return {
    flightsTotal,
    transportTotal,
    lodgingTotal,
    grandTotal,
    totalDays,
  }
}
