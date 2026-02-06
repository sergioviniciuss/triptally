import { createLodgingStay, updateLodgingStay, deleteLodgingStay } from './actions'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    lodgingStay: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}))

// Mock Next.js cache revalidation
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

describe('Lodging Actions', () => {
  const mockTripId = 'trip-123'
  const mockStayId = 'stay-123'

  beforeEach(() => {
    jest.clearAllMocks()
    // Suppress console.error in tests
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('createLodgingStay', () => {
    it('should create lodging stay successfully', async () => {
      const mockCreatedStay = {
        id: mockStayId,
        tripId: mockTripId,
        city: 'Palma',
        hotelName: 'Hotel Sol',
        checkIn: new Date('2026-06-01'),
        checkOut: new Date('2026-06-05'),
        amount: 400,
      }
      
      ;(prisma.lodgingStay.create as jest.Mock).mockResolvedValue(mockCreatedStay)

      const result = await createLodgingStay(mockTripId, {
        city: 'Palma',
        hotelName: 'Hotel Sol',
        checkIn: '2026-06-01',
        checkOut: '2026-06-05',
        amount: 400,
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockCreatedStay)
      
      expect(prisma.lodgingStay.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tripId: mockTripId,
          city: 'Palma',
          hotelName: 'Hotel Sol',
          amount: 400,
        }),
      })
    })

    it('should handle optional fields correctly (empty strings converted to undefined)', async () => {
      const mockCreatedStay = {
        id: mockStayId,
        tripId: mockTripId,
        city: 'Palma',
        hotelName: 'Hotel Sol',
        checkIn: new Date('2026-06-01'),
        checkOut: new Date('2026-06-05'),
        amount: 400,
        link: undefined,
        notes: undefined,
      }
      
      ;(prisma.lodgingStay.create as jest.Mock).mockResolvedValue(mockCreatedStay)

      const result = await createLodgingStay(mockTripId, {
        city: 'Palma',
        hotelName: 'Hotel Sol',
        checkIn: '2026-06-01',
        checkOut: '2026-06-05',
        amount: 400,
        link: '', // Empty string should be converted to undefined
        notes: '',
      })

      expect(result.success).toBe(true)
    })

    it('should return error when required fields are missing', async () => {
      const result = await createLodgingStay(mockTripId, {
        city: '', // Invalid: empty city
        hotelName: 'Hotel Sol',
        checkIn: '2026-06-01',
        checkOut: '2026-06-05',
        amount: 400,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })

    it('should return error when database operation fails', async () => {
      ;(prisma.lodgingStay.create as jest.Mock).mockRejectedValue(new Error('DB error'))

      const result = await createLodgingStay(mockTripId, {
        city: 'Palma',
        hotelName: 'Hotel Sol',
        checkIn: '2026-06-01',
        checkOut: '2026-06-05',
        amount: 400,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to create lodging stay')
    })
  })

  describe('updateLodgingStay', () => {
    it('should update lodging stay successfully', async () => {
      const mockUpdatedStay = {
        id: mockStayId,
        tripId: mockTripId,
        city: 'Palma',
        hotelName: 'Hotel Sol Updated',
        amount: 450,
      }
      
      ;(prisma.lodgingStay.update as jest.Mock).mockResolvedValue(mockUpdatedStay)

      const result = await updateLodgingStay(mockStayId, {
        hotelName: 'Hotel Sol Updated',
        amount: 450,
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockUpdatedStay)
    })
  })

  describe('deleteLodgingStay', () => {
    it('should delete lodging stay successfully', async () => {
      ;(prisma.lodgingStay.findUnique as jest.Mock).mockResolvedValue({
        id: mockStayId,
        tripId: mockTripId,
      })
      ;(prisma.lodgingStay.delete as jest.Mock).mockResolvedValue({ id: mockStayId })

      const result = await deleteLodgingStay(mockStayId)

      expect(result.success).toBe(true)
      expect(prisma.lodgingStay.delete).toHaveBeenCalledWith({
        where: { id: mockStayId },
      })
    })
  })
})
