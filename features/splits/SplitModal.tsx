'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import CurrencyInput from '@/components/ui/CurrencyInput'
import { createOrUpdateSplit, getSplit } from './actions'
import { parseCurrency } from '@/lib/currency'
import { toast } from 'sonner'

interface Participant {
  id: string
  name: string
}

interface SplitModalProps {
  isOpen: boolean
  onClose: () => void
  tripId: string
  expenseRefType: 'FLIGHT_OPTION' | 'TRANSPORT_ITEM' | 'LODGING_STAY'
  expenseRefId: string
  expenseAmount: number
  participants: Participant[]
  onSave?: () => void
}

export default function SplitModal({
  isOpen,
  onClose,
  tripId,
  expenseRefType,
  expenseRefId,
  expenseAmount,
  participants,
  onSave,
}: SplitModalProps) {
  const [paidBy, setPaidBy] = useState('')
  const [splitMode, setSplitMode] = useState<'EQUAL' | 'CUSTOM'>('EQUAL')
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && expenseRefId) {
      loadSplit()
    }
  }, [isOpen, expenseRefId])

  const loadSplit = async () => {
    const result = await getSplit(expenseRefType, expenseRefId)
    if (result.success && result.data) {
      setPaidBy(result.data.paidByParticipantId)
      setSplitMode(result.data.splitMode as 'EQUAL' | 'CUSTOM')
      setSelectedParticipants(result.data.splitParticipants.map((sp) => sp.participantId))

      if (result.data.splitMode === 'CUSTOM') {
        const amounts: Record<string, string> = {}
        result.data.splitAllocations.forEach((a) => {
          amounts[a.participantId] = a.amount.toString()
        })
        setCustomAmounts(amounts)
      }
    } else {
      // Default: paid by first participant, split among all
      if (participants.length > 0) {
        setPaidBy(participants[0].id)
        setSelectedParticipants(participants.map((p) => p.id))
      }
    }
  }

  const handleSave = async () => {
    if (!paidBy || selectedParticipants.length === 0) {
      toast.error('Please select who paid and who to split between')
      return
    }

    if (splitMode === 'CUSTOM') {
      const total = selectedParticipants.reduce((sum, pid) => sum + parseCurrency(customAmounts[pid] || '0'), 0)
      if (Math.abs(total - expenseAmount) > 0.01) {
        toast.error(`Custom amounts must sum to ${expenseAmount}`)
        return
      }
    }

    setLoading(true)
    const result = await createOrUpdateSplit(tripId, {
      expenseRefType,
      expenseRefId,
      paidByParticipantId: paidBy,
      splitMode,
      participantIds: selectedParticipants,
      allocations:
        splitMode === 'CUSTOM'
          ? selectedParticipants.map((pid) => ({
              participantId: pid,
              amount: parseCurrency(customAmounts[pid] || '0'),
            }))
          : undefined,
    })

    setLoading(false)

    if (result.success) {
      toast.success('Split saved')
      onSave?.()
      onClose()
    } else {
      toast.error(result.error || 'Failed to save split')
    }
  }

  const toggleParticipant = (participantId: string) => {
    if (selectedParticipants.includes(participantId)) {
      setSelectedParticipants(selectedParticipants.filter((id) => id !== participantId))
    } else {
      setSelectedParticipants([...selectedParticipants, participantId])
    }
  }

  const equalAmount = selectedParticipants.length > 0 ? expenseAmount / selectedParticipants.length : 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Split Expense" size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Paid by</label>
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select participant</option>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Split between</label>
          <div className="space-y-2">
            {participants.map((p) => (
              <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedParticipants.includes(p.id)}
                  onChange={() => toggleParticipant(p.id)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span>{p.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Split mode</label>
          <div className="flex gap-2">
            <Button
              variant={splitMode === 'EQUAL' ? 'primary' : 'secondary'}
              onClick={() => setSplitMode('EQUAL')}
              size="sm"
            >
              Equal
            </Button>
            <Button
              variant={splitMode === 'CUSTOM' ? 'primary' : 'secondary'}
              onClick={() => setSplitMode('CUSTOM')}
              size="sm"
            >
              Custom
            </Button>
          </div>
        </div>

        {splitMode === 'EQUAL' && selectedParticipants.length > 0 && (
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              Each person owes: <span className="font-medium">{equalAmount.toFixed(2)}</span>
            </p>
          </div>
        )}

        {splitMode === 'CUSTOM' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Custom amounts</label>
            {selectedParticipants.map((pid) => {
              const participant = participants.find((p) => p.id === pid)
              return (
                <CurrencyInput
                  key={pid}
                  label={participant?.name}
                  value={customAmounts[pid] || ''}
                  onChange={(value) =>
                    setCustomAmounts({ ...customAmounts, [pid]: value })
                  }
                />
              )
            })}
            <p className="text-sm text-gray-600">
              Total:{' '}
              <span className="font-medium">
                {selectedParticipants.reduce((sum, pid) => sum + parseCurrency(customAmounts[pid] || '0'), 0).toFixed(2)}
              </span>{' '}
              / {expenseAmount.toFixed(2)}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} disabled={loading} className="flex-1">
            {loading ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}
