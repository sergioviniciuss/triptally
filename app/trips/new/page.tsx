'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { createTrip } from '@/features/trips/actions'
import { toast } from 'sonner'

export default function NewTripPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const currentYear = new Date().getFullYear()

  const [formData, setFormData] = useState({
    destination: '',
    year: currentYear,
    currency: 'EUR',
    type: 'FLIGHT' as 'FLIGHT' | 'ROAD',
    dateRangeStart: '',
    dateRangeEnd: '',
    isCandidate: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.destination) {
      toast.error('Please enter a destination')
      return
    }

    setLoading(true)

    const name = `${formData.destination} ${formData.year}`
    const result = await createTrip({
      ...formData,
      name,
      dateRangeStart: formData.dateRangeStart || undefined,
      dateRangeEnd: formData.dateRangeEnd || undefined,
    })

    setLoading(false)

    if (result.success) {
      toast.success('Trip created')
      router.push(`/trips/${result.data.id}`)
    } else {
      toast.error(result.error || 'Failed to create trip')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/trips">
              <Button variant="ghost" size="sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create Trip</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Destination *"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="e.g. Mallorca"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Year *"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || currentYear })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="BRL">BRL (R$)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trip Type</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.type === 'FLIGHT' ? 'primary' : 'secondary'}
                  onClick={() => setFormData({ ...formData, type: 'FLIGHT' })}
                >
                  Flight Trip
                </Button>
                <Button
                  type="button"
                  variant={formData.type === 'ROAD' ? 'primary' : 'secondary'}
                  onClick={() => setFormData({ ...formData, type: 'ROAD' })}
                >
                  Road Trip
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date (optional)"
                type="date"
                value={formData.dateRangeStart}
                onChange={(e) => setFormData({ ...formData, dateRangeStart: e.target.value })}
              />
              <Input
                label="End Date (optional)"
                type="date"
                value={formData.dateRangeEnd}
                onChange={(e) => setFormData({ ...formData, dateRangeEnd: e.target.value })}
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isCandidate}
                onChange={(e) => setFormData({ ...formData, isCandidate: e.target.checked })}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">
                Mark as candidate (for comparison)
              </span>
            </label>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Trip'}
              </Button>
              <Link href="/trips">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
