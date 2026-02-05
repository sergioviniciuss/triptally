'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import CurrencyInput from '@/components/ui/CurrencyInput'
import SplitModal from '@/features/splits/SplitModal'
import { createLodgingStay, updateLodgingStay, deleteLodgingStay } from './actions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { parseCurrency } from '@/lib/currency'
import { toast } from 'sonner'

interface LodgingStay {
  id: string
  city: string
  hotelName: string
  link?: string | null
  checkIn: string
  checkOut: string
  amount: number
  notes?: string | null
}

interface Participant {
  id: string
  name: string
}

export default function LodgingTab({
  tripId,
  stays: initialStays,
  participants,
  currency,
}: {
  tripId: string
  stays: LodgingStay[]
  participants: Participant[]
  currency: string
}) {
  const router = useRouter()
  const [stays, setStays] = useState(initialStays)
  const [isAdding, setIsAdding] = useState(false)
  const [splitModalOpen, setSplitModalOpen] = useState(false)
  const [selectedStay, setSelectedStay] = useState<LodgingStay | null>(null)
  const [formData, setFormData] = useState({ city: '', hotelName: '', link: '', checkIn: '', checkOut: '', amount: '', notes: '' })

  const handleAdd = async () => {
    if (!formData.city || !formData.hotelName || !formData.checkIn || !formData.checkOut) {
      toast.error('Please fill in all required fields')
      return
    }

    const result = await createLodgingStay(tripId, {
      ...formData,
      amount: parseCurrency(formData.amount as string),
    })
    if (result.success) {
      toast.success('Lodging added')
      setStays([...stays, result.data])
      setFormData({ city: '', hotelName: '', link: '', checkIn: '', checkOut: '', amount: '', notes: '' })
      setIsAdding(false)
    } else {
      toast.error(result.error || 'Failed to add lodging')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lodging?')) return
    const result = await deleteLodgingStay(id)
    if (result.success) {
      toast.success('Lodging deleted')
      setStays(stays.filter((s) => s.id !== id))
    } else {
      toast.error(result.error || 'Failed to delete lodging')
    }
  }

  const handleOpenSplit = (stay: LodgingStay) => {
    setSelectedStay(stay)
    setSplitModalOpen(true)
  }

  if (stays.length === 0 && !isAdding) {
    return (
      <EmptyState
        title="No lodging yet"
        description="Add hotels, Airbnbs, or other accommodations"
        action={<Button onClick={() => setIsAdding(true)}>Add Lodging</Button>}
      />
    )
  }

  const total = stays.reduce((sum, stay) => sum + stay.amount, 0)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-semibold">{formatCurrency(total, currency)}</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm">
            + Add Lodging
          </Button>
        )}
      </div>

      {isAdding && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="City *"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="Hotel/Airbnb *"
              value={formData.hotelName}
              onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
            />
            <Input
              label="Check-in *"
              type="date"
              value={formData.checkIn}
              onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
            />
            <Input
              label="Check-out *"
              type="date"
              value={formData.checkOut}
              onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
            />
            <CurrencyInput
              label="Price *"
              placeholder="0.00"
              value={formData.amount}
              onChange={(value) => setFormData({ ...formData, amount: value })}
              currency={currency}
            />
            <Input
              label="Link"
              placeholder="https://..."
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            />
            <div className="md:col-span-2">
              <Input
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
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
        {stays.map((stay) => (
          <Card key={stay.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium">{stay.hotelName}</h4>
                <p className="text-sm text-gray-600">{stay.city}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {formatDate(stay.checkIn)} → {formatDate(stay.checkOut)}
                </p>
                {stay.notes && <p className="text-sm text-gray-600 mt-1">{stay.notes}</p>}
                {stay.link && (
                  <a href={stay.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-1 block">
                    View booking
                  </a>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">{formatCurrency(stay.amount, currency)}</p>
                <div className="flex gap-1 mt-2">
                  <button onClick={() => handleOpenSplit(stay)} className="p-1 text-gray-600 hover:text-primary" title="Split">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(stay.id)} className="p-1 text-gray-600 hover:text-red-600" title="Delete">
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

      {selectedStay && (
        <SplitModal
          isOpen={splitModalOpen}
          onClose={() => {
            setSplitModalOpen(false)
            setSelectedStay(null)
          }}
          tripId={tripId}
          expenseRefType="LODGING_STAY"
          expenseRefId={selectedStay.id}
          expenseAmount={selectedStay.amount}
          participants={participants}
          onSave={() => router.refresh()}
        />
      )}
    </div>
  )
}
