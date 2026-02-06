import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import LodgingTab from './LodgingTab'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock the actions
jest.mock('./actions', () => ({
  createLodgingStay: jest.fn(),
  updateLodgingStay: jest.fn(),
  deleteLodgingStay: jest.fn(),
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

describe('LodgingTab - Date Field Constraints', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  }

  const mockProps = {
    tripId: 'trip-123',
    stays: [],
    participants: [],
    currency: 'EUR',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('should render check-in and check-out date fields when adding lodging', () => {
    render(<LodgingTab {...mockProps} />)
    
    // Click "Add Lodging" button
    const addButton = screen.getByText('Add Lodging')
    fireEvent.click(addButton)
    
    // Check if both date fields are present
    expect(screen.getByLabelText(/check-in/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/check-out/i)).toBeInTheDocument()
  })

  it('should not have min attribute on check-out date when check-in date is empty', () => {
    render(<LodgingTab {...mockProps} />)
    
    // Click "Add Lodging" button
    const addButton = screen.getByText('Add Lodging')
    fireEvent.click(addButton)
    
    const checkOutDateInput = screen.getByLabelText(/check-out/i) as HTMLInputElement
    
    // Should not have min attribute when check-in is empty
    expect(checkOutDateInput.getAttribute('min')).toBeFalsy()
  })

  it('should set min attribute on check-out date equal to check-in date', () => {
    render(<LodgingTab {...mockProps} />)
    
    // Click "Add Lodging" button
    const addButton = screen.getByText('Add Lodging')
    fireEvent.click(addButton)
    
    const checkInDateInput = screen.getByLabelText(/check-in/i) as HTMLInputElement
    const checkOutDateInput = screen.getByLabelText(/check-out/i) as HTMLInputElement
    
    // Set check-in date
    fireEvent.change(checkInDateInput, { target: { value: '2026-03-15' } })
    
    // Check-out date should have min attribute equal to check-in date
    expect(checkOutDateInput.getAttribute('min')).toBe('2026-03-15')
  })

  it('should update min attribute when check-in date changes', () => {
    render(<LodgingTab {...mockProps} />)
    
    // Click "Add Lodging" button
    const addButton = screen.getByText('Add Lodging')
    fireEvent.click(addButton)
    
    const checkInDateInput = screen.getByLabelText(/check-in/i) as HTMLInputElement
    const checkOutDateInput = screen.getByLabelText(/check-out/i) as HTMLInputElement
    
    // Set initial check-in date
    fireEvent.change(checkInDateInput, { target: { value: '2026-03-15' } })
    expect(checkOutDateInput.getAttribute('min')).toBe('2026-03-15')
    
    // Change check-in date
    fireEvent.change(checkInDateInput, { target: { value: '2026-04-01' } })
    expect(checkOutDateInput.getAttribute('min')).toBe('2026-04-01')
  })

  it('should clear min attribute when check-in date is cleared', () => {
    render(<LodgingTab {...mockProps} />)
    
    // Click "Add Lodging" button
    const addButton = screen.getByText('Add Lodging')
    fireEvent.click(addButton)
    
    const checkInDateInput = screen.getByLabelText(/check-in/i) as HTMLInputElement
    const checkOutDateInput = screen.getByLabelText(/check-out/i) as HTMLInputElement
    
    // Set check-in date
    fireEvent.change(checkInDateInput, { target: { value: '2026-03-15' } })
    expect(checkOutDateInput.getAttribute('min')).toBe('2026-03-15')
    
    // Clear check-in date
    fireEvent.change(checkInDateInput, { target: { value: '' } })
    expect(checkOutDateInput.getAttribute('min')).toBeFalsy()
  })
})
