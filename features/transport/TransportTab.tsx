'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import CurrencyInput from '@/components/ui/CurrencyInput'
import SplitModal from '@/features/splits/SplitModal'
import { createTransportItem, updateTransportItem, deleteTransportItem, selectTransportItem } from './actions'
import { formatCurrency } from '@/lib/utils'
import { parseCurrency } from '@/lib/currency'
import { toast } from 'sonner'

interface TransportItem {
  id: string
  label: string
  amount: number
  link?: string | null
  notes?: string | null
  isSelected: boolean
}

interface Participant {
  id: string
  name: string
}

export default function TransportTab({
  tripId,
  items: initialItems,
  participants,
  currency,
}: {
  tripId: string
  items: TransportItem[]
  participants: Participant[]
  currency: string
}) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [isAdding, setIsAdding] = useState(false)
  const [splitModalOpen, setSplitModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<TransportItem | null>(null)
  const [formData, setFormData] = useState({ label: '', amount: '', link: '', notes: '' })

  const handleAdd = async () => {
    if (!formData.label) {
      toast.error('Please enter a label')
      return
    }

    const result = await createTransportItem(tripId, {
      ...formData,
      amount: parseCurrency(formData.amount as string),
    })
    if (result.success) {
      toast.success('Transport item added')
      setItems([...items, result.data])
      setFormData({ label: '', amount: '', link: '', notes: '' })
      setIsAdding(false)
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to add item')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transport item?')) return
    const result = await deleteTransportItem(id)
    if (result.success) {
      toast.success('Item deleted')
      setItems(items.filter((i) => i.id !== id))
    } else {
      toast.error(result.error || 'Failed to delete item')
    }
  }

  const handleSelect = async (id: string) => {
    const result = await selectTransportItem(tripId, id)
    if (result.success) {
      setItems(items.map((i) => ({ ...i, isSelected: i.id === id })))
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to select item')
    }
  }

  const handleOpenSplit = (item: TransportItem) => {
    setSelectedItem(item)
    setSplitModalOpen(true)
  }

  if (items.length === 0 && !isAdding) {
    return (
      <EmptyState
        title="No transport items yet"
        description="Add car rental, fuel, or public transport costs"
        action={<Button onClick={() => setIsAdding(true)}>Add Transport</Button>}
      />
    )
  }

  const total = items.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-semibold">{formatCurrency(total, currency)}</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm">
            + Add Item
          </Button>
        )}
      </div>

      {isAdding && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Label *"
              placeholder="e.g. Car rental"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
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
            <Input
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
        {items.map((item) => (
          <Card key={item.id} className={item.isSelected ? 'ring-2 ring-primary' : ''}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    checked={item.isSelected}
                    onChange={() => handleSelect(item.id)}
                    className="text-primary focus:ring-primary"
                  />
                  <h4 className="font-medium">{item.label}</h4>
                  {item.isSelected && (
                    <span className="px-2 py-0.5 text-xs bg-primary-light text-primary rounded">Selected</span>
                  )}
                </div>
                {item.notes && <p className="text-sm text-gray-600">{item.notes}</p>}
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    View link
                  </a>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">{formatCurrency(item.amount, currency)}</p>
                <div className="flex gap-1 mt-2">
                  <button onClick={() => handleOpenSplit(item)} className="p-1 text-gray-600 hover:text-primary" title="Split">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-600 hover:text-red-600" title="Delete">
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

      {selectedItem && (
        <SplitModal
          isOpen={splitModalOpen}
          onClose={() => {
            setSplitModalOpen(false)
            setSelectedItem(null)
          }}
          tripId={tripId}
          expenseRefType="TRANSPORT_ITEM"
          expenseRefId={selectedItem.id}
          expenseAmount={selectedItem.amount}
          participants={participants}
          onSave={() => router.refresh()}
        />
      )}
    </div>
  )
}
