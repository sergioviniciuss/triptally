import { createTransportItem, updateTransportItem, deleteTransportItem, selectTransportItem } from './actions'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    transportItem: {
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

describe('Transport Actions', () => {
  const mockTripId = 'trip-123'
  const mockItemId = 'item-123'

  beforeEach(() => {
    jest.clearAllMocks()
    // Suppress console.error in tests
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('createTransportItem', () => {
    it('should auto-select the first transport item when no selected items exist', async () => {
      // Mock: no existing selected item
      ;(prisma.transportItem.findFirst as jest.Mock).mockResolvedValue(null)
      
      const mockCreatedItem = {
        id: mockItemId,
        tripId: mockTripId,
        label: 'Car Rental - Avis',
        amount: 120,
        isSelected: true,
      }
      
      ;(prisma.transportItem.create as jest.Mock).mockResolvedValue(mockCreatedItem)

      const result = await createTransportItem(mockTripId, {
        label: 'Car Rental - Avis',
        amount: 120,
      })

      // Verify it checked for existing selected items
      expect(prisma.transportItem.findFirst).toHaveBeenCalledWith({
        where: { tripId: mockTripId, isSelected: true },
      })

      // Verify it created the item with isSelected: true
      expect(prisma.transportItem.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tripId: mockTripId,
          label: 'Car Rental - Avis',
          isSelected: true,
        }),
      })

      expect(result.success).toBe(true)
      expect(result.data?.isSelected).toBe(true)
    })

    it('should NOT auto-select when a selected item already exists', async () => {
      // Mock: existing selected item
      ;(prisma.transportItem.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-item',
        isSelected: true,
      })
      
      const mockCreatedItem = {
        id: 'new-item',
        tripId: mockTripId,
        label: 'Fuel',
        amount: 50,
        isSelected: false,
      }
      
      ;(prisma.transportItem.create as jest.Mock).mockResolvedValue(mockCreatedItem)

      const result = await createTransportItem(mockTripId, {
        label: 'Fuel',
        amount: 50,
      })

      // Verify it created the item with isSelected: false
      expect(prisma.transportItem.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isSelected: false,
        }),
      })

      expect(result.success).toBe(true)
      expect(result.data?.isSelected).toBe(false)
    })

    it('should handle optional fields correctly (empty strings converted to undefined)', async () => {
      ;(prisma.transportItem.findFirst as jest.Mock).mockResolvedValue(null)
      
      const mockCreatedItem = {
        id: mockItemId,
        tripId: mockTripId,
        label: 'Car Rental',
        amount: 120,
        link: undefined,
        notes: undefined,
        isSelected: true,
      }
      
      ;(prisma.transportItem.create as jest.Mock).mockResolvedValue(mockCreatedItem)

      const result = await createTransportItem(mockTripId, {
        label: 'Car Rental',
        amount: 120,
        link: '', // Empty string should be converted to undefined
        notes: '',
      })

      expect(result.success).toBe(true)
    })

    it('should return error when validation fails', async () => {
      const result = await createTransportItem(mockTripId, {
        label: '', // Invalid: empty label
        amount: 120,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })
  })

  describe('updateTransportItem', () => {
    it('should update transport item successfully', async () => {
      const mockUpdatedItem = {
        id: mockItemId,
        tripId: mockTripId,
        label: 'Car Rental - Updated',
        amount: 150,
      }
      
      ;(prisma.transportItem.update as jest.Mock).mockResolvedValue(mockUpdatedItem)

      const result = await updateTransportItem(mockItemId, {
        label: 'Car Rental - Updated',
        amount: 150,
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockUpdatedItem)
    })
  })

  describe('deleteTransportItem', () => {
    it('should delete transport item successfully', async () => {
      ;(prisma.transportItem.findUnique as jest.Mock).mockResolvedValue({
        id: mockItemId,
        tripId: mockTripId,
      })
      ;(prisma.transportItem.delete as jest.Mock).mockResolvedValue({ id: mockItemId })

      const result = await deleteTransportItem(mockItemId)

      expect(result.success).toBe(true)
      expect(prisma.transportItem.delete).toHaveBeenCalledWith({
        where: { id: mockItemId },
      })
    })
  })

  describe('selectTransportItem', () => {
    it('should unselect all other items and select the specified one', async () => {
      ;(prisma.transportItem.updateMany as jest.Mock).mockResolvedValue({ count: 2 })
      ;(prisma.transportItem.update as jest.Mock).mockResolvedValue({
        id: mockItemId,
        isSelected: true,
      })

      const result = await selectTransportItem(mockTripId, mockItemId)

      // Verify it unselected all items first
      expect(prisma.transportItem.updateMany).toHaveBeenCalledWith({
        where: { tripId: mockTripId },
        data: { isSelected: false },
      })

      // Verify it selected the specified item
      expect(prisma.transportItem.update).toHaveBeenCalledWith({
        where: { id: mockItemId },
        data: { isSelected: true },
      })

      expect(result.success).toBe(true)
    })
  })
})
