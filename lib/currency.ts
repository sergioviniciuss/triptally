/**
 * Parse a currency string to a number
 * Handles various formats: "1,234.56", "1234.56", "$1,234.56", "€1.234,56"
 */
export function parseCurrency(value: string): number {
  if (!value) return 0
  
  // Remove currency symbols and spaces
  const cleaned = value.replace(/[^0-9.,]/g, '')
  
  // Handle empty or invalid input
  if (!cleaned) return 0
  
  // Check if comma is used as decimal separator (European format)
  const hasComma = cleaned.includes(',')
  const hasDot = cleaned.includes('.')
  
  let normalized: string
  
  if (hasComma && hasDot) {
    // Both present - determine which is decimal separator
    const lastComma = cleaned.lastIndexOf(',')
    const lastDot = cleaned.lastIndexOf('.')
    
    if (lastComma > lastDot) {
      // Comma is decimal: 1.234,56 -> 1234.56
      normalized = cleaned.replace(/\./g, '').replace(',', '.')
    } else {
      // Dot is decimal: 1,234.56 -> 1234.56
      normalized = cleaned.replace(/,/g, '')
    }
  } else if (hasComma) {
    // Only comma - could be thousands or decimal
    const parts = cleaned.split(',')
    if (parts.length === 2 && parts[1].length <= 2) {
      // Likely decimal: 1234,56 -> 1234.56
      normalized = cleaned.replace(',', '.')
    } else {
      // Likely thousands: 1,234 -> 1234
      normalized = cleaned.replace(/,/g, '')
    }
  } else {
    // Only dots or plain number
    normalized = cleaned
  }
  
  const parsed = parseFloat(normalized)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Format a number as currency for display (not in input)
 */
export function formatCurrencyDisplay(value: number, currencySymbol: string = '€'): string {
  return `${currencySymbol}${value.toFixed(2)}`
}

/**
 * Format value for the currency input field as user types
 * Returns the formatted string that should be shown in the input
 */
export function formatCurrencyInput(value: string): string {
  // Remove non-numeric characters except dots and commas
  const cleaned = value.replace(/[^0-9.,]/g, '')
  
  if (!cleaned) return ''
  
  // For simplicity during input, just ensure valid decimal format
  // Don't add thousand separators while typing (annoying UX)
  const parts = cleaned.split('.')
  if (parts.length > 2) {
    // Multiple dots - keep only first as decimal
    return parts[0] + '.' + parts.slice(1).join('')
  }
  
  return cleaned
}

/**
 * Get currency symbol from currency code
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    'EUR': '€',
    'USD': '$',
    'GBP': '£',
    'BRL': 'R$',
  }
  return symbols[currency] || currency
}
