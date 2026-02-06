import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import ItineraryTab from './ItineraryTab'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock the actions
jest.mock('./actions', () => ({
  createItineraryItem: jest.fn(),
  updateItineraryItem: jest.fn(),
  deleteItineraryItem: jest.fn(),
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('ItineraryTab - Date Field Default and Constraints', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  describe('Date field defaults', () => {
    it('should default date to trip start date when adding first day', () => {
      const tripStartDate = new Date('2026-03-15')
      
      render(
        <ItineraryTab
          tripId="trip-123"
          items={[]}
          tripStartDate={tripStartDate}
          tripEndDate={null}
        />
      )

      // Click "Add Day" button
      const addButton = screen.getByText('Add Day')
      fireEvent.click(addButton)

      const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement
      
      // Should default to trip start date
      expect(dateInput.value).toBe('2026-03-15')
    })

    it('should default date to empty when no trip start date is set', () => {
      render(
        <ItineraryTab
          tripId="trip-123"
          items={[]}
          tripStartDate={null}
          tripEndDate={null}
        />
      )

      // Click "Add Day" button
      const addButton = screen.getByText('Add Day')
      fireEvent.click(addButton)

      const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement
      
      // Should be empty when no trip dates
      expect(dateInput.value).toBe('')
    })

    it('should calculate next day date when adding subsequent days', () => {
      const tripStartDate = new Date('2026-03-15')
      const existingItems = [
        {
          id: '1',
          dayIndex: 1,
          date: '2026-03-15',
          from: 'Berlin',
          to: 'Munich',
          km: 584,
          durationMinutes: 360,
          sleepOvernight: false,
          comments: null,
          pointsOfInterest: null,
          link: null,
        },
      ]
      
      render(
        <ItineraryTab
          tripId="trip-123"
          items={existingItems}
          tripStartDate={tripStartDate}
          tripEndDate={null}
        />
      )

      // Click "+ Add Day" button
      const addButton = screen.getByText('+ Add Day')
      fireEvent.click(addButton)

      const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement
      
      // Should default to next day (March 16)
      expect(dateInput.value).toBe('2026-03-16')
    })
  })

  describe('Date field constraints', () => {
    it('should set min attribute to trip start date', () => {
      const tripStartDate = new Date('2026-03-15')
      const tripEndDate = new Date('2026-03-25')
      
      render(
        <ItineraryTab
          tripId="trip-123"
          items={[]}
          tripStartDate={tripStartDate}
          tripEndDate={tripEndDate}
        />
      )

      const addButton = screen.getByText('Add Day')
      fireEvent.click(addButton)

      const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement
      
      expect(dateInput.getAttribute('min')).toBe('2026-03-15')
    })

    it('should set max attribute to trip end date', () => {
      const tripStartDate = new Date('2026-03-15')
      const tripEndDate = new Date('2026-03-25')
      
      render(
        <ItineraryTab
          tripId="trip-123"
          items={[]}
          tripStartDate={tripStartDate}
          tripEndDate={tripEndDate}
        />
      )

      const addButton = screen.getByText('Add Day')
      fireEvent.click(addButton)

      const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement
      
      expect(dateInput.getAttribute('max')).toBe('2026-03-25')
    })

    it('should not have min/max when trip dates are not set', () => {
      render(
        <ItineraryTab
          tripId="trip-123"
          items={[]}
          tripStartDate={null}
          tripEndDate={null}
        />
      )

      const addButton = screen.getByText('Add Day')
      fireEvent.click(addButton)

      const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement
      
      expect(dateInput.getAttribute('min')).toBeFalsy()
      expect(dateInput.getAttribute('max')).toBeFalsy()
    })

    it('should only set min when only start date is set', () => {
      const tripStartDate = new Date('2026-03-15')
      
      render(
        <ItineraryTab
          tripId="trip-123"
          items={[]}
          tripStartDate={tripStartDate}
          tripEndDate={null}
        />
      )

      const addButton = screen.getByText('Add Day')
      fireEvent.click(addButton)

      const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement
      
      expect(dateInput.getAttribute('min')).toBe('2026-03-15')
      expect(dateInput.getAttribute('max')).toBeFalsy()
    })
  })

  describe('Component rendering', () => {
    it('should render date field when adding itinerary day', () => {
      render(
        <ItineraryTab
          tripId="trip-123"
          items={[]}
          tripStartDate={null}
          tripEndDate={null}
        />
      )

      const addButton = screen.getByText('Add Day')
      fireEvent.click(addButton)

      expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
    })
  })
})
