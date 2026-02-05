'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'
import { calculateBalances, calculateSettlements, Participant as ParticipantType, Expense } from '@/lib/splits'
import { calculateTripTotals } from '@/lib/totals'
import { addParticipant, deleteParticipant } from '@/features/trips/actions'
import { toast } from 'sonner'

interface Participant {
  id: string
  name: string
}

interface Split {
  paidByParticipantId: string
  splitMode: string
  splitParticipants: { participantId: string }[]
  splitAllocations: { participantId: string; amount: number }[]
}

interface TripData {
  flightOptions: { id: string; amount: number; isSelected: boolean; split?: Split }[]
  transportItems: { id: string; amount: number; isSelected: boolean; split?: Split }[]
  lodgingStays: { id: string; amount: number; split?: Split }[]
}

export default function TotalTab({
  tripId,
  participants: initialParticipants,
  tripData,
  currency,
  totals,
}: {
  tripId: string
  participants: Participant[]
  tripData: TripData
  currency: string
  totals: { flightsTotal: number; transportTotal: number; lodgingTotal: number; grandTotal: number; totalDays: number }
}) {
  const [participants, setParticipants] = useState(initialParticipants)
  const [isAddingParticipant, setIsAddingParticipant] = useState(false)
  const [newParticipantName, setNewParticipantName] = useState('')
  const [balances, setBalances] = useState<ReturnType<typeof calculateBalances>>([])
  const [settlements, setSettlements] = useState<ReturnType<typeof calculateSettlements>>([])

  useEffect(() => {
    calculateSplits()
  }, [tripData, participants])

  const calculateSplits = () => {
    const expenses: Expense[] = []

    // Add selected flights
    tripData.flightOptions
      .filter((f) => f.isSelected && f.split)
      .forEach((f) => {
        expenses.push({
          id: f.id,
          amount: f.amount,
          split: f.split as any,
        })
      })

    // Add selected transport
    tripData.transportItems
      .filter((t) => t.isSelected && t.split)
      .forEach((t) => {
        expenses.push({
          id: t.id,
          amount: t.amount,
          split: t.split as any,
        })
      })

    // Add all lodging
    tripData.lodgingStays
      .filter((l) => l.split)
      .forEach((l) => {
        expenses.push({
          id: l.id,
          amount: l.amount,
          split: l.split as any,
        })
      })

    const participantsForCalc: ParticipantType[] = participants.map((p) => ({ id: p.id, name: p.name }))
    const newBalances = calculateBalances(expenses, participantsForCalc)
    const newSettlements = calculateSettlements(newBalances)

    setBalances(newBalances)
    setSettlements(newSettlements)
  }

  const handleAddParticipant = async () => {
    if (!newParticipantName.trim()) {
      toast.error('Please enter a name')
      return
    }

    const result = await addParticipant(tripId, { name: newParticipantName })
    if (result.success) {
      toast.success('Participant added')
      setParticipants([...participants, result.data])
      setNewParticipantName('')
      setIsAddingParticipant(false)
    } else {
      toast.error(result.error || 'Failed to add participant')
    }
  }

  const handleDeleteParticipant = async (participantId: string) => {
    if (!confirm('Delete this participant?')) return

    const result = await deleteParticipant(participantId)
    if (result.success) {
      toast.success('Participant deleted')
      setParticipants(participants.filter((p) => p.id !== participantId))
    } else {
      toast.error(result.error || 'Failed to delete participant')
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-gray-600 mb-1">Flights</p>
          <p className="text-xl font-semibold">{formatCurrency(totals.flightsTotal, currency)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 mb-1">Transport</p>
          <p className="text-xl font-semibold">{formatCurrency(totals.transportTotal, currency)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600 mb-1">Lodging</p>
          <p className="text-xl font-semibold">{formatCurrency(totals.lodgingTotal, currency)}</p>
        </Card>
        <Card className="md:col-span-1 col-span-2">
          <p className="text-sm text-gray-600 mb-1">Total Days</p>
          <p className="text-xl font-semibold">{totals.totalDays}</p>
        </Card>
      </div>

      <Card className="bg-primary-light border-primary">
        <p className="text-sm text-gray-700 mb-1">Grand Total</p>
        <p className="text-3xl font-bold text-primary">{formatCurrency(totals.grandTotal, currency)}</p>
        <p className="text-sm text-gray-600 mt-1">
          {totals.totalDays > 0 && `${formatCurrency(totals.grandTotal / totals.totalDays, currency)} per day`}
        </p>
      </Card>

      {/* Participants */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Participants</h3>
          <Button onClick={() => setIsAddingParticipant(true)} size="sm">
            + Add
          </Button>
        </div>

        {participants.length === 0 && (
          <p className="text-gray-500 text-sm">No participants yet. Add participants to split costs.</p>
        )}

        <div className="space-y-2">
          {participants.map((p) => (
            <div key={p.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
              <span>{p.name}</span>
              <button
                onClick={() => handleDeleteParticipant(p.id)}
                className="text-sm text-gray-600 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <Modal isOpen={isAddingParticipant} onClose={() => setIsAddingParticipant(false)} title="Add Participant">
          <div className="space-y-4">
            <Input
              label="Name"
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              placeholder="e.g. João"
            />
            <div className="flex gap-2">
              <Button onClick={handleAddParticipant} className="flex-1">
                Add
              </Button>
              <Button variant="ghost" onClick={() => setIsAddingParticipant(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </Card>

      {/* Balances */}
      {balances.length > 0 && (
        <Card>
          <h3 className="font-semibold text-lg mb-4">Balance per Person</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-sm font-medium text-gray-700">Person</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-700">Paid</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-700">Owes</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-700">Balance</th>
                </tr>
              </thead>
              <tbody>
                {balances.map((b) => (
                  <tr key={b.participantId} className="border-b last:border-b-0">
                    <td className="py-2">{b.participantName}</td>
                    <td className="text-right py-2">{formatCurrency(b.paid, currency)}</td>
                    <td className="text-right py-2">{formatCurrency(b.owed, currency)}</td>
                    <td
                      className={`text-right py-2 font-semibold ${
                        b.balance > 0 ? 'text-green-600' : b.balance < 0 ? 'text-red-600' : ''
                      }`}
                    >
                      {formatCurrency(b.balance, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Settlements */}
      {settlements.length > 0 && (
        <Card>
          <h3 className="font-semibold text-lg mb-4">Who Owes Whom</h3>
          <div className="space-y-2">
            {settlements.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{s.fromName}</span>
                  <span className="text-gray-600">pays</span>
                  <span className="font-medium">{s.toName}</span>
                </div>
                <span className="font-semibold text-primary">{formatCurrency(s.amount, currency)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
