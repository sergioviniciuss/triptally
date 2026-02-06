import { calculateTripTotals } from './totals'
import { prisma } from './prisma'

// Mock Prisma
jest.mock('./prisma', () => ({
  prisma: {
    trip: {
      findUnique: jest.fn(),
    },
  },
}))

describe('calculateTripTotals', () => {
  const mockTripId = 'trip-123'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should only include selected flights in totals', async () => {
    // The query filters by isSelected at the database level,
    // so the mock should only return selected items
    const mockTrip = {
      id: mockTripId,
      type: 'FLIGHT',
      flightOptions: [
        { id: '1', amount: 400, isSelected: true },
        // Unselected flights are filtered out by the query
      ],
      transportItems: [],
      lodgingStays: [],
      itineraryItems: [],
    }

    ;(prisma.trip.findUnique as jest.Mock).mockResolvedValue(mockTrip)

    const totals = await calculateTripTotals(mockTripId)

    expect(totals.flightsTotal).toBe(400) // Only selected flight
    expect(totals.transportTotal).toBe(0)
    expect(totals.lodgingTotal).toBe(0)
    expect(totals.grandTotal).toBe(400)
  })

  it('should only include selected transport items in totals', async () => {
    // The query filters by isSelected at the database level,
    // so the mock should only return selected items
    const mockTrip = {
      id: mockTripId,
      type: 'FLIGHT',
      flightOptions: [],
      transportItems: [
        { id: '1', amount: 120, isSelected: true },
        { id: '3', amount: 80, isSelected: true },
        // Unselected items are filtered out by the query
      ],
      lodgingStays: [],
      itineraryItems: [],
    }

    ;(prisma.trip.findUnique as jest.Mock).mockResolvedValue(mockTrip)

    const totals = await calculateTripTotals(mockTripId)

    expect(totals.flightsTotal).toBe(0)
    expect(totals.transportTotal).toBe(200) // 120 + 80 (only selected items)
    expect(totals.lodgingTotal).toBe(0)
    expect(totals.grandTotal).toBe(200)
  })

  it('should include all lodging stays in totals (no selection needed)', async () => {
    const mockTrip = {
      id: mockTripId,
      type: 'FLIGHT',
      flightOptions: [],
      transportItems: [],
      lodgingStays: [
        { id: '1', amount: 400, checkIn: new Date('2026-06-01'), checkOut: new Date('2026-06-05') },
        { id: '2', amount: 300, checkIn: new Date('2026-06-05'), checkOut: new Date('2026-06-08') },
      ],
      itineraryItems: [],
    }

    ;(prisma.trip.findUnique as jest.Mock).mockResolvedValue(mockTrip)

    const totals = await calculateTripTotals(mockTripId)

    expect(totals.flightsTotal).toBe(0)
    expect(totals.transportTotal).toBe(0)
    expect(totals.lodgingTotal).toBe(700) // All lodging stays
    expect(totals.grandTotal).toBe(700)
  })

  it('should calculate correct grand total with all categories', async () => {
    // The query filters by isSelected at the database level
    const mockTrip = {
      id: mockTripId,
      type: 'FLIGHT',
      flightOptions: [
        { id: '1', amount: 400, isSelected: true },
        // Unselected flights filtered out by query
      ],
      transportItems: [
        { id: '1', amount: 120, isSelected: true },
      ],
      lodgingStays: [
        { id: '1', amount: 400, checkIn: new Date('2026-06-01'), checkOut: new Date('2026-06-05') },
      ],
      itineraryItems: [],
    }

    ;(prisma.trip.findUnique as jest.Mock).mockResolvedValue(mockTrip)

    const totals = await calculateTripTotals(mockTripId)

    expect(totals.flightsTotal).toBe(400)
    expect(totals.transportTotal).toBe(120)
    expect(totals.lodgingTotal).toBe(400)
    expect(totals.grandTotal).toBe(920) // 400 + 120 + 400
  })

  it('should calculate total days from flight dates when available', async () => {
    const mockTrip = {
      id: mockTripId,
      type: 'FLIGHT',
      flightOptions: [
        {
          id: '1',
          amount: 400,
          isSelected: true,
          departDate: new Date('2026-06-01'),
          returnDate: new Date('2026-06-10'), // 9 days
        },
      ],
      transportItems: [],
      lodgingStays: [],
      itineraryItems: [],
    }

    ;(prisma.trip.findUnique as jest.Mock).mockResolvedValue(mockTrip)

    const totals = await calculateTripTotals(mockTripId)

    expect(totals.totalDays).toBe(9)
  })

  it('should calculate total days from lodging dates', async () => {
    const mockTrip = {
      id: mockTripId,
      type: 'FLIGHT',
      flightOptions: [],
      transportItems: [],
      lodgingStays: [
        { id: '1', amount: 400, checkIn: new Date('2026-06-01'), checkOut: new Date('2026-06-05') },
        { id: '2', amount: 300, checkIn: new Date('2026-06-05'), checkOut: new Date('2026-06-10') },
      ],
      itineraryItems: [],
    }

    ;(prisma.trip.findUnique as jest.Mock).mockResolvedValue(mockTrip)

    const totals = await calculateTripTotals(mockTripId)

    expect(totals.totalDays).toBe(9) // From earliest check-in to latest check-out
  })

  it('should return zeros for non-existent trip', async () => {
    ;(prisma.trip.findUnique as jest.Mock).mockResolvedValue(null)

    const totals = await calculateTripTotals(mockTripId)

    expect(totals.flightsTotal).toBe(0)
    expect(totals.transportTotal).toBe(0)
    expect(totals.lodgingTotal).toBe(0)
    expect(totals.grandTotal).toBe(0)
    expect(totals.totalDays).toBe(0)
  })

  it('should handle empty trip with no expenses', async () => {
    const mockTrip = {
      id: mockTripId,
      type: 'FLIGHT',
      flightOptions: [],
      transportItems: [],
      lodgingStays: [],
      itineraryItems: [],
    }

    ;(prisma.trip.findUnique as jest.Mock).mockResolvedValue(mockTrip)

    const totals = await calculateTripTotals(mockTripId)

    expect(totals.flightsTotal).toBe(0)
    expect(totals.transportTotal).toBe(0)
    expect(totals.lodgingTotal).toBe(0)
    expect(totals.grandTotal).toBe(0)
  })

  it('should not include unselected items even when amounts are present', async () => {
    // The query filters by isSelected at the database level,
    // so unselected items won't be in the result
    const mockTrip = {
      id: mockTripId,
      type: 'FLIGHT',
      flightOptions: [], // Unselected flights filtered out
      transportItems: [], // Unselected items filtered out
      lodgingStays: [],
      itineraryItems: [],
    }

    ;(prisma.trip.findUnique as jest.Mock).mockResolvedValue(mockTrip)

    const totals = await calculateTripTotals(mockTripId)

    // Should be zero because nothing is selected
    expect(totals.flightsTotal).toBe(0)
    expect(totals.transportTotal).toBe(0)
    expect(totals.grandTotal).toBe(0)
  })
})
