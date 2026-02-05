import { render, screen, fireEvent } from '@testing-library/react'
import CurrencyInput from './CurrencyInput'

describe('CurrencyInput', () => {
  it('should render with label', () => {
    const onChange = jest.fn()
    render(<CurrencyInput label="Price" value="" onChange={onChange} />)
    
    expect(screen.getByLabelText('Price')).toBeInTheDocument()
  })

  it('should show currency symbol', () => {
    const onChange = jest.fn()
    render(<CurrencyInput label="Price" value="" onChange={onChange} currency="EUR" />)
    
    expect(screen.getByText('€')).toBeInTheDocument()
  })

  it('should show USD symbol', () => {
    const onChange = jest.fn()
    render(<CurrencyInput label="Price" value="" onChange={onChange} currency="USD" />)
    
    expect(screen.getByText('$')).toBeInTheDocument()
  })

  it('should call onChange with formatted value', () => {
    const onChange = jest.fn()
    render(<CurrencyInput label="Price" value="" onChange={onChange} />)
    
    const input = screen.getByLabelText('Price') as HTMLInputElement
    fireEvent.change(input, { target: { value: '123.45' } })
    
    expect(onChange).toHaveBeenCalledWith('123.45')
  })

  it('should filter out non-numeric characters', () => {
    const onChange = jest.fn()
    render(<CurrencyInput label="Price" value="" onChange={onChange} />)
    
    const input = screen.getByLabelText('Price') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'abc123def' } })
    
    expect(onChange).toHaveBeenCalledWith('123')
  })

  it('should handle empty input', () => {
    const onChange = jest.fn()
    render(<CurrencyInput label="Price" value="123" onChange={onChange} />)
    
    const input = screen.getByLabelText('Price') as HTMLInputElement
    fireEvent.change(input, { target: { value: '' } })
    
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('should display error message', () => {
    const onChange = jest.fn()
    render(<CurrencyInput label="Price" value="" onChange={onChange} error="Price is required" />)
    
    expect(screen.getByText('Price is required')).toBeInTheDocument()
  })

  it('should update when value prop changes', () => {
    const onChange = jest.fn()
    const { rerender } = render(<CurrencyInput label="Price" value="100" onChange={onChange} />)
    
    const input = screen.getByLabelText('Price') as HTMLInputElement
    expect(input.value).toBe('100')
    
    rerender(<CurrencyInput label="Price" value="200" onChange={onChange} />)
    expect(input.value).toBe('200')
  })
})
