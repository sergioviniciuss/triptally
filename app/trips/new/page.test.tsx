import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import NewTripPage from './page'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock the actions
jest.mock('@/features/trips/actions', () => ({
  createTrip: jest.fn(),
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('NewTripPage - Date Field Constraints', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('should render start date and end date fields', () => {
    render(<NewTripPage />)
    
    // Check if both date fields are present
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
  })

  it('should not have min attribute on end date when start date is empty', () => {
    render(<NewTripPage />)
    
    const endDateInput = screen.getByLabelText(/end date/i) as HTMLInputElement
    
    // Should not have min attribute when start date is empty
    expect(endDateInput.getAttribute('min')).toBeFalsy()
  })

  it('should set min attribute on end date equal to start date', () => {
    render(<NewTripPage />)
    
    const startDateInput = screen.getByLabelText(/start date/i) as HTMLInputElement
    const endDateInput = screen.getByLabelText(/end date/i) as HTMLInputElement
    
    // Set start date
    fireEvent.change(startDateInput, { target: { value: '2026-03-15' } })
    
    // End date should have min attribute equal to start date
    expect(endDateInput.getAttribute('min')).toBe('2026-03-15')
  })

  it('should update min attribute when start date changes', () => {
    render(<NewTripPage />)
    
    const startDateInput = screen.getByLabelText(/start date/i) as HTMLInputElement
    const endDateInput = screen.getByLabelText(/end date/i) as HTMLInputElement
    
    // Set initial start date
    fireEvent.change(startDateInput, { target: { value: '2026-03-15' } })
    expect(endDateInput.getAttribute('min')).toBe('2026-03-15')
    
    // Change start date
    fireEvent.change(startDateInput, { target: { value: '2026-04-01' } })
    expect(endDateInput.getAttribute('min')).toBe('2026-04-01')
  })

  it('should clear min attribute when start date is cleared', () => {
    render(<NewTripPage />)
    
    const startDateInput = screen.getByLabelText(/start date/i) as HTMLInputElement
    const endDateInput = screen.getByLabelText(/end date/i) as HTMLInputElement
    
    // Set start date
    fireEvent.change(startDateInput, { target: { value: '2026-03-15' } })
    expect(endDateInput.getAttribute('min')).toBe('2026-03-15')
    
    // Clear start date
    fireEvent.change(startDateInput, { target: { value: '' } })
    expect(endDateInput.getAttribute('min')).toBeFalsy()
  })
})
