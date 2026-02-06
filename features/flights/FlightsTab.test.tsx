import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import FlightsTab from './FlightsTab'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock the actions
jest.mock('./actions', () => ({
  createFlightOption: jest.fn(),
  updateFlightOption: jest.fn(),
  deleteFlightOption: jest.fn(),
  selectFlightOption: jest.fn(),
}))

// Mock SplitModal
jest.mock('@/features/splits/SplitModal', () => ({
  __esModule: true,
  default: () => null,
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('FlightsTab - Date Field Constraints', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  }

  const mockProps = {
    tripId: 'trip-123',
    flights: [],
    participants: [],
    currency: 'EUR',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('should render departure and return date fields when adding a flight', () => {
    render(<FlightsTab {...mockProps} />)
    
    // Click "Add Flight" button
    const addButton = screen.getByText('Add Flight')
    fireEvent.click(addButton)
    
    // Check if both date fields are present
    expect(screen.getByLabelText(/departure/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/return/i)).toBeInTheDocument()
  })

  it('should not have min attribute on return date when departure date is empty', () => {
    render(<FlightsTab {...mockProps} />)
    
    // Click "Add Flight" button
    const addButton = screen.getByText('Add Flight')
    fireEvent.click(addButton)
    
    const returnDateInput = screen.getByLabelText(/return/i) as HTMLInputElement
    
    // Should not have min attribute when departure is empty
    expect(returnDateInput.getAttribute('min')).toBeFalsy()
  })

  it('should set min attribute on return date equal to departure date', () => {
    render(<FlightsTab {...mockProps} />)
    
    // Click "Add Flight" button
    const addButton = screen.getByText('Add Flight')
    fireEvent.click(addButton)
    
    const departureDateInput = screen.getByLabelText(/departure/i) as HTMLInputElement
    const returnDateInput = screen.getByLabelText(/return/i) as HTMLInputElement
    
    // Set departure date
    fireEvent.change(departureDateInput, { target: { value: '2026-03-15' } })
    
    // Return date should have min attribute equal to departure date
    expect(returnDateInput.getAttribute('min')).toBe('2026-03-15')
  })

  it('should update min attribute when departure date changes', () => {
    render(<FlightsTab {...mockProps} />)
    
    // Click "Add Flight" button
    const addButton = screen.getByText('Add Flight')
    fireEvent.click(addButton)
    
    const departureDateInput = screen.getByLabelText(/departure/i) as HTMLInputElement
    const returnDateInput = screen.getByLabelText(/return/i) as HTMLInputElement
    
    // Set initial departure date
    fireEvent.change(departureDateInput, { target: { value: '2026-03-15' } })
    expect(returnDateInput.getAttribute('min')).toBe('2026-03-15')
    
    // Change departure date
    fireEvent.change(departureDateInput, { target: { value: '2026-04-01' } })
    expect(returnDateInput.getAttribute('min')).toBe('2026-04-01')
  })

  it('should clear min attribute when departure date is cleared', () => {
    render(<FlightsTab {...mockProps} />)
    
    // Click "Add Flight" button
    const addButton = screen.getByText('Add Flight')
    fireEvent.click(addButton)
    
    const departureDateInput = screen.getByLabelText(/departure/i) as HTMLInputElement
    const returnDateInput = screen.getByLabelText(/return/i) as HTMLInputElement
    
    // Set departure date
    fireEvent.change(departureDateInput, { target: { value: '2026-03-15' } })
    expect(returnDateInput.getAttribute('min')).toBe('2026-03-15')
    
    // Clear departure date
    fireEvent.change(departureDateInput, { target: { value: '' } })
    expect(returnDateInput.getAttribute('min')).toBeFalsy()
  })
})
