import { createFlightOption, updateFlightOption, deleteFlightOption, selectFlightOption } from './actions'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    flightOption: {
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}))

// Mock Next.js cache revalidation
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

describe('Flight Actions', () => {
  const mockTripId = 'trip-123'
  const mockFlightId = 'flight-123'

  beforeEach(() => {
    jest.clearAllMocks()
    // Suppress console.error in tests
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('createFlightOption', () => {
    it('should auto-select the first flight when no selected flights exist', async () => {
      // Mock: no existing selected flight
      ;(prisma.flightOption.findFirst as jest.Mock).mockResolvedValue(null)
      
      const mockCreatedFlight = {
        id: mockFlightId,
        tripId: mockTripId,
        route: 'Berlin → Mallorca',
        departDate: new Date('2026-06-01'),
        returnDate: new Date('2026-06-10'),
        amount: 400,
        isSelected: true,
      }
      
      ;(prisma.flightOption.create as jest.Mock).mockResolvedValue(mockCreatedFlight)

      const result = await createFlightOption(mockTripId, {
        route: 'Berlin → Mallorca',
        departDate: '2026-06-01',
        returnDate: '2026-06-10',
        amount: 400,
      })

      // Verify it checked for existing selected flights
      expect(prisma.flightOption.findFirst).toHaveBeenCalledWith({
        where: { tripId: mockTripId, isSelected: true },
      })

      // Verify it created the flight with isSelected: true
      expect(prisma.flightOption.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tripId: mockTripId,
          route: 'Berlin → Mallorca',
          isSelected: true,
        }),
      })

      expect(result.success).toBe(true)
      expect(result.data?.isSelected).toBe(true)
    })

    it('should NOT auto-select when a selected flight already exists', async () => {
      // Mock: existing selected flight
      ;(prisma.flightOption.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-flight',
        isSelected: true,
      })
      
      const mockCreatedFlight = {
        id: 'new-flight',
        tripId: mockTripId,
        route: 'Berlin → Barcelona',
        departDate: new Date('2026-07-01'),
        returnDate: new Date('2026-07-10'),
        amount: 350,
        isSelected: false,
      }
      
      ;(prisma.flightOption.create as jest.Mock).mockResolvedValue(mockCreatedFlight)

      const result = await createFlightOption(mockTripId, {
        route: 'Berlin → Barcelona',
        departDate: '2026-07-01',
        returnDate: '2026-07-10',
        amount: 350,
      })

      // Verify it created the flight with isSelected: false
      expect(prisma.flightOption.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isSelected: false,
        }),
      })

      expect(result.success).toBe(true)
      expect(result.data?.isSelected).toBe(false)
    })

    it('should handle optional fields correctly (empty strings converted to undefined)', async () => {
      ;(prisma.flightOption.findFirst as jest.Mock).mockResolvedValue(null)
      
      const mockCreatedFlight = {
        id: mockFlightId,
        tripId: mockTripId,
        route: 'Berlin → Mallorca',
        departDate: new Date('2026-06-01'),
        returnDate: new Date('2026-06-10'),
        amount: 400,
        comments: undefined,
        link: undefined,
        isSelected: true,
      }
      
      ;(prisma.flightOption.create as jest.Mock).mockResolvedValue(mockCreatedFlight)

      const result = await createFlightOption(mockTripId, {
        route: 'Berlin → Mallorca',
        departDate: '2026-06-01',
        returnDate: '2026-06-10',
        amount: 400,
        comments: '', // Empty string should be converted to undefined
        link: '',
      })

      expect(result.success).toBe(true)
    })

    it('should return error when validation fails', async () => {
      const result = await createFlightOption(mockTripId, {
        route: '', // Invalid: empty route
        departDate: '2026-06-01',
        returnDate: '2026-06-10',
        amount: 400,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })

    it('should return error when database operation fails', async () => {
      ;(prisma.flightOption.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.flightOption.create as jest.Mock).mockRejectedValue(new Error('DB error'))

      const result = await createFlightOption(mockTripId, {
        route: 'Berlin → Mallorca',
        departDate: '2026-06-01',
        returnDate: '2026-06-10',
        amount: 400,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to create flight option')
    })
  })

  describe('updateFlightOption', () => {
    it('should update flight option successfully', async () => {
      const mockUpdatedFlight = {
        id: mockFlightId,
        tripId: mockTripId,
        route: 'Berlin → Rome',
        amount: 450,
      }
      
      ;(prisma.flightOption.update as jest.Mock).mockResolvedValue(mockUpdatedFlight)

      const result = await updateFlightOption(mockFlightId, {
        route: 'Berlin → Rome',
        amount: 450,
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockUpdatedFlight)
    })
  })

  describe('deleteFlightOption', () => {
    it('should delete flight option successfully', async () => {
      ;(prisma.flightOption.findUnique as jest.Mock).mockResolvedValue({
        id: mockFlightId,
        tripId: mockTripId,
      })
      ;(prisma.flightOption.delete as jest.Mock).mockResolvedValue({ id: mockFlightId })

      const result = await deleteFlightOption(mockFlightId)

      expect(result.success).toBe(true)
      expect(prisma.flightOption.delete).toHaveBeenCalledWith({
        where: { id: mockFlightId },
      })
    })
  })

  describe('selectFlightOption', () => {
    it('should unselect all other flights and select the specified one', async () => {
      ;(prisma.flightOption.updateMany as jest.Mock).mockResolvedValue({ count: 2 })
      ;(prisma.flightOption.update as jest.Mock).mockResolvedValue({
        id: mockFlightId,
        isSelected: true,
      })

      const result = await selectFlightOption(mockTripId, mockFlightId)

      // Verify it unselected all flights first
      expect(prisma.flightOption.updateMany).toHaveBeenCalledWith({
        where: { tripId: mockTripId },
        data: { isSelected: false },
      })

      // Verify it selected the specified flight
      expect(prisma.flightOption.update).toHaveBeenCalledWith({
        where: { id: mockFlightId },
        data: { isSelected: true },
      })

      expect(result.success).toBe(true)
    })
  })
})
