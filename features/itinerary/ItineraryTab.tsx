'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import { createItineraryItem, updateItineraryItem, deleteItineraryItem } from './actions'
import { toast } from 'sonner'

interface ItineraryItem {
  id: string
  dayIndex: number
  date?: string | null
  from: string
  to: string
  km?: number | null
  durationMinutes?: number | null
  sleepOvernight: boolean
  comments?: string | null
  pointsOfInterest?: string | null
  link?: string | null
}

export default function ItineraryTab({
  tripId,
  items: initialItems,
}: {
  tripId: string
  items: ItineraryItem[]
}) {
  const [items, setItems] = useState(initialItems)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    dayIndex: items.length + 1,
    date: '',
    from: '',
    to: '',
    km: 0,
    durationMinutes: 0,
    sleepOvernight: false,
    comments: '',
    pointsOfInterest: '',
    link: '',
  })

  const handleAdd = async () => {
    if (!formData.from || !formData.to) {
      toast.error('Please fill in from and to')
      return
    }

    const result = await createItineraryItem(tripId, formData)
    if (result.success) {
      toast.success('Day added')
      setItems([...items, result.data])
      setFormData({
        dayIndex: items.length + 2,
        date: '',
        from: formData.to, // Next day starts from where this day ends
        to: '',
        km: 0,
        durationMinutes: 0,
        sleepOvernight: false,
        comments: '',
        pointsOfInterest: '',
        link: '',
      })
      setIsAdding(false)
    } else {
      toast.error(result.error || 'Failed to add day')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this day?')) return
    const result = await deleteItineraryItem(id)
    if (result.success) {
      toast.success('Day deleted')
      setItems(items.filter((i) => i.id !== id))
    } else {
      toast.error(result.error || 'Failed to delete day')
    }
  }

  if (items.length === 0 && !isAdding) {
    return (
      <EmptyState
        title="No itinerary yet"
        description="Add days to plan your road trip route"
        action={<Button onClick={() => setIsAdding(true)}>Add Day</Button>}
      />
    )
  }

  const drivingDays = items.filter((i) => i.sleepOvernight).length
  const totalKm = items.reduce((sum, i) => sum + (i.km || 0), 0)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div>
            <p className="text-sm text-gray-600">Days</p>
            <p className="text-2xl font-semibold">{items.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Overnight</p>
            <p className="text-2xl font-semibold">{drivingDays}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total km</p>
            <p className="text-2xl font-semibold">{totalKm}</p>
          </div>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm">
            + Add Day
          </Button>
        )}
      </div>

      {isAdding && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Day"
              type="number"
              value={formData.dayIndex}
              onChange={(e) => setFormData({ ...formData, dayIndex: parseInt(e.target.value) || 1 })}
            />
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <Input
              label="From *"
              value={formData.from}
              onChange={(e) => setFormData({ ...formData, from: e.target.value })}
            />
            <Input
              label="To *"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
            />
            <Input
              label="Distance (km)"
              type="number"
              value={formData.km}
              onChange={(e) => setFormData({ ...formData, km: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Duration (minutes)"
              type="number"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
            />
            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.sleepOvernight}
                  onChange={(e) => setFormData({ ...formData, sleepOvernight: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700">Sleep overnight</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <Input
                label="Points of interest"
                value={formData.pointsOfInterest}
                onChange={(e) => setFormData({ ...formData, pointsOfInterest: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Comments"
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleAdd}>Add Day</Button>
            <Button variant="ghost" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-primary">Day {item.dayIndex}</span>
                  {item.sleepOvernight && (
                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">Overnight</span>
                  )}
                </div>
                <p className="font-medium">
                  {item.from} → {item.to}
                </p>
                {(item.km || item.durationMinutes) && (
                  <p className="text-sm text-gray-600 mt-1">
                    {item.km && `${item.km} km`}
                    {item.km && item.durationMinutes && ' • '}
                    {item.durationMinutes && `${Math.floor(item.durationMinutes / 60)}h ${item.durationMinutes % 60}m`}
                  </p>
                )}
                {item.pointsOfInterest && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">POI:</span> {item.pointsOfInterest}
                  </p>
                )}
                {item.comments && <p className="text-sm text-gray-600 mt-1">{item.comments}</p>}
              </div>
              <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-600 hover:text-red-600" title="Delete">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
