'use client'

import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef, useState, useEffect } from 'react'
import { formatCurrencyInput, getCurrencySymbol } from '@/lib/currency'

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  label?: string
  error?: string
  value: string | number
  onChange: (value: string) => void
  currency?: string
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, label, error, id, value, onChange, currency = 'EUR', placeholder = '0.00', ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
    const symbol = getCurrencySymbol(currency)
    
    const [displayValue, setDisplayValue] = useState(value.toString())

    useEffect(() => {
      setDisplayValue(value.toString())
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value
      const formatted = formatCurrencyInput(input)
      setDisplayValue(formatted)
      onChange(formatted)
    }

    const handleBlur = () => {
      // Format on blur for better display
      if (displayValue && !isNaN(parseFloat(displayValue))) {
        const num = parseFloat(displayValue)
        setDisplayValue(num.toString())
      }
    }

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{symbol}</span>
          </div>
          <input
            ref={ref}
            id={inputId}
            type="text"
            inputMode="decimal"
            className={cn(
              'w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              error && 'border-red-500',
              className
            )}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    )
  }
)

CurrencyInput.displayName = 'CurrencyInput'

export default CurrencyInput
