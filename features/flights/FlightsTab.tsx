'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import CurrencyInput from '@/components/ui/CurrencyInput'
import SaveIndicator from '@/components/ui/SaveIndicator'
import SplitModal from '@/features/splits/SplitModal'
import { createFlightOption, updateFlightOption, deleteFlightOption, selectFlightOption } from './actions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { parseCurrency } from '@/lib/currency'
import { toast } from 'sonner'

interface Flight {
  id: string
  route: string
  departDate: string
  returnDate: string
  amount: number
  comments?: string | null
  link?: string | null
  isSelected: boolean
}

interface Participant {
  id: string
  name: string
}

export default function FlightsTab({
  tripId,
  flights: initialFlights,
  participants,
  currency,
}: {
  tripId: string
  flights: Flight[]
  participants: Participant[]
  currency: string
}) {
  const router = useRouter()
  const [flights, setFlights] = useState(initialFlights)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [splitModalOpen, setSplitModalOpen] = useState(false)
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)

  const [formData, setFormData] = useState({
    route: '',
    departDate: '',
    returnDate: '',
    amount: '',
    comments: '',
    link: '',
  })

  const handleAdd = async () => {
    if (!formData.route || !formData.departDate || !formData.returnDate) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaveStatus('saving')
    const result = await createFlightOption(tripId, {
      ...formData,
      amount: parseCurrency(formData.amount as string),
    })
    
    if (result.success) {
      setSaveStatus('saved')
      toast.success('Flight added')
      setFlights([...flights, result.data])
      setFormData({ route: '', departDate: '', returnDate: '', amount: '', comments: '', link: '' })
      setIsAdding(false)
      router.refresh()
      setTimeout(() => setSaveStatus('idle'), 2000)
    } else {
      setSaveStatus('error')
      toast.error(result.error || 'Failed to add flight')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }

  const handleUpdate = async (id: string, data: Partial<Flight>) => {
    setSaveStatus('saving')
    const result = await updateFlightOption(id, data)
    
    if (result.success) {
      setSaveStatus('saved')
      setFlights(flights.map((f) => (f.id === id ? { ...f, ...data } : f)))
      setEditingId(null)
      setTimeout(() => setSaveStatus('idle'), 2000)
    } else {
      setSaveStatus('error')
      toast.error(result.error || 'Failed to update flight')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this flight option?')) return

    const result = await deleteFlightOption(id)
    if (result.success) {
      toast.success('Flight deleted')
      setFlights(flights.filter((f) => f.id !== id))
    } else {
      toast.error(result.error || 'Failed to delete flight')
    }
  }

  const handleSelect = async (id: string) => {
    const result = await selectFlightOption(tripId, id)
    if (result.success) {
      setFlights(flights.map((f) => ({ ...f, isSelected: f.id === id })))
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to select flight')
    }
  }

  const handleOpenSplit = (flight: Flight) => {
    setSelectedFlight(flight)
    setSplitModalOpen(true)
  }

  if (flights.length === 0 && !isAdding) {
    return (
      <>
        <EmptyState
          title="No flight options yet"
          description="Add flight options to compare prices"
          action={<Button onClick={() => setIsAdding(true)}>Add Flight</Button>}
        />
      </>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <SaveIndicator status={saveStatus} />
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm">
            + Add Flight
          </Button>
        )}
      </div>

      {isAdding && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Route *"
              placeholder="e.g. Berlin → Mallorca"
              value={formData.route}
              onChange={(e) => setFormData({ ...formData, route: e.target.value })}
            />
            <CurrencyInput
              label="Price *"
              placeholder="0.00"
              value={formData.amount}
              onChange={(value) => setFormData({ ...formData, amount: value })}
              currency={currency}
            />
            <Input
              label="Departure *"
              type="date"
              value={formData.departDate}
              onChange={(e) => setFormData({ ...formData, departDate: e.target.value })}
            />
            <Input
              label="Return *"
              type="date"
              value={formData.returnDate}
              onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
              min={formData.departDate}
            />
            <Input
              label="Link"
              placeholder="https://..."
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            />
            <Input
              label="Comments"
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleAdd}>Add</Button>
            <Button variant="ghost" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {flights.map((flight) => (
          <Card key={flight.id} className={flight.isSelected ? 'ring-2 ring-primary' : ''}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    checked={flight.isSelected}
                    onChange={() => handleSelect(flight.id)}
                    className="text-primary focus:ring-primary"
                  />
                  <h4 className="font-medium">{flight.route}</h4>
                  {flight.isSelected && (
                    <span className="px-2 py-0.5 text-xs bg-primary-light text-primary rounded">Selected</span>
                  )}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    {formatDate(flight.departDate)} → {formatDate(flight.returnDate)}
                  </p>
                  {flight.comments && <p>{flight.comments}</p>}
                  {flight.link && (
                    <a href={flight.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      View booking
                    </a>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">{formatCurrency(flight.amount, currency)}</p>
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={() => handleOpenSplit(flight)}
                    className="p-1 text-gray-600 hover:text-primary"
                    title="Split expense"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(flight.id)}
                    className="p-1 text-gray-600 hover:text-red-600"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedFlight && (
        <SplitModal
          isOpen={splitModalOpen}
          onClose={() => {
            setSplitModalOpen(false)
            setSelectedFlight(null)
          }}
          tripId={tripId}
          expenseRefType="FLIGHT_OPTION"
          expenseRefId={selectedFlight.id}
          expenseAmount={selectedFlight.amount}
          participants={participants}
          onSave={() => router.refresh()}
        />
      )}
    </div>
  )
}
