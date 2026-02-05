import { parseCurrency, formatCurrencyDisplay, formatCurrencyInput, getCurrencySymbol } from './currency'

describe('parseCurrency', () => {
  it('should parse plain numbers', () => {
    expect(parseCurrency('100')).toBe(100)
    expect(parseCurrency('1234.56')).toBe(1234.56)
    expect(parseCurrency('0.99')).toBe(0.99)
  })

  it('should handle empty or invalid input', () => {
    expect(parseCurrency('')).toBe(0)
    expect(parseCurrency('abc')).toBe(0)
    expect(parseCurrency('$')).toBe(0)
  })

  it('should parse currency with symbols', () => {
    expect(parseCurrency('$100')).toBe(100)
    expect(parseCurrency('€1,234.56')).toBe(1234.56)
    expect(parseCurrency('£99.99')).toBe(99.99)
    expect(parseCurrency('R$ 250.00')).toBe(250)
  })

  it('should handle thousand separators with comma', () => {
    expect(parseCurrency('1,234.56')).toBe(1234.56)
    expect(parseCurrency('10,000.00')).toBe(10000)
    expect(parseCurrency('1,234,567.89')).toBe(1234567.89)
  })

  it('should handle European format (comma as decimal)', () => {
    expect(parseCurrency('1234,56')).toBe(1234.56)
    expect(parseCurrency('1.234,56')).toBe(1234.56)
    expect(parseCurrency('10.000,50')).toBe(10000.50)
  })

  it('should handle ambiguous comma format', () => {
    // Single comma with 2 digits after = decimal
    expect(parseCurrency('99,50')).toBe(99.50)
    
    // Single comma with more digits = thousands separator
    expect(parseCurrency('1,234')).toBe(1234)
  })

  it('should handle edge cases', () => {
    expect(parseCurrency('0')).toBe(0)
    expect(parseCurrency('0.00')).toBe(0)
    expect(parseCurrency('.50')).toBe(0.50)
    expect(parseCurrency('123.')).toBe(123)
  })

  it('should preserve precision', () => {
    expect(parseCurrency('661.93')).toBe(661.93)
    expect(parseCurrency('1293.00')).toBe(1293)
    expect(parseCurrency('340.24')).toBe(340.24)
  })
})

describe('formatCurrencyDisplay', () => {
  it('should format with default Euro symbol', () => {
    expect(formatCurrencyDisplay(100)).toBe('€100.00')
    expect(formatCurrencyDisplay(1234.56)).toBe('€1234.56')
  })

  it('should format with custom currency symbol', () => {
    expect(formatCurrencyDisplay(100, '$')).toBe('$100.00')
    expect(formatCurrencyDisplay(99.99, '£')).toBe('£99.99')
    expect(formatCurrencyDisplay(250, 'R$')).toBe('R$250.00')
  })

  it('should always show 2 decimal places', () => {
    expect(formatCurrencyDisplay(100, '$')).toBe('$100.00')
    expect(formatCurrencyDisplay(99.9, '$')).toBe('$99.90')
    expect(formatCurrencyDisplay(0.5, '€')).toBe('€0.50')
  })
})

describe('formatCurrencyInput', () => {
  it('should preserve valid numeric input', () => {
    expect(formatCurrencyInput('123')).toBe('123')
    expect(formatCurrencyInput('123.45')).toBe('123.45')
    expect(formatCurrencyInput('1234')).toBe('1234')
  })

  it('should remove non-numeric characters', () => {
    expect(formatCurrencyInput('$123')).toBe('123')
    expect(formatCurrencyInput('€1,234.56')).toBe('1,234.56')
    expect(formatCurrencyInput('abc123def')).toBe('123')
  })

  it('should handle multiple dots', () => {
    expect(formatCurrencyInput('12.34.56')).toBe('12.3456')
  })

  it('should return empty string for empty input', () => {
    expect(formatCurrencyInput('')).toBe('')
    expect(formatCurrencyInput('$')).toBe('')
  })
})

describe('getCurrencySymbol', () => {
  it('should return correct symbols for known currencies', () => {
    expect(getCurrencySymbol('EUR')).toBe('€')
    expect(getCurrencySymbol('USD')).toBe('$')
    expect(getCurrencySymbol('GBP')).toBe('£')
    expect(getCurrencySymbol('BRL')).toBe('R$')
  })

  it('should return currency code for unknown currencies', () => {
    expect(getCurrencySymbol('JPY')).toBe('JPY')
    expect(getCurrencySymbol('CHF')).toBe('CHF')
  })
})
