export interface Participant {
  id: string
  name: string
}

export interface Expense {
  id: string
  amount: number
  split?: {
    paidByParticipantId: string
    splitMode: 'EQUAL' | 'CUSTOM'
    splitParticipants: { participantId: string }[]
    splitAllocations: { participantId: string; amount: number }[]
  }
}

export interface ParticipantBalance {
  participantId: string
  participantName: string
  paid: number
  owed: number
  balance: number
}

export interface Settlement {
  from: string
  to: string
  fromName: string
  toName: string
  amount: number
}

export function calculateBalances(
  expenses: Expense[],
  participants: Participant[]
): ParticipantBalance[] {
  const balances: Record<string, { paid: number; owed: number }> = {}

  // Initialize balances
  participants.forEach((p) => {
    balances[p.id] = { paid: 0, owed: 0 }
  })

  // Calculate paid and owed for each expense
  expenses.forEach((expense) => {
    if (!expense.split) return

    const { paidByParticipantId, splitMode, splitParticipants, splitAllocations } = expense.split

    // Add to paid amount
    if (balances[paidByParticipantId]) {
      balances[paidByParticipantId].paid += expense.amount
    }

    // Calculate owed amounts
    if (splitMode === 'EQUAL') {
      const numParticipants = splitParticipants.length
      if (numParticipants > 0) {
        const amountPerPerson = expense.amount / numParticipants
        splitParticipants.forEach((sp) => {
          if (balances[sp.participantId]) {
            balances[sp.participantId].owed += amountPerPerson
          }
        })
      }
    } else if (splitMode === 'CUSTOM') {
      splitAllocations.forEach((allocation) => {
        if (balances[allocation.participantId]) {
          balances[allocation.participantId].owed += allocation.amount
        }
      })
    }
  })

  // Calculate final balances
  return participants.map((p) => ({
    participantId: p.id,
    participantName: p.name,
    paid: balances[p.id]?.paid || 0,
    owed: balances[p.id]?.owed || 0,
    balance: (balances[p.id]?.paid || 0) - (balances[p.id]?.owed || 0),
  }))
}

export function calculateSettlements(
  balances: ParticipantBalance[]
): Settlement[] {
  const settlements: Settlement[] = []

  // Separate debtors (negative balance) and creditors (positive balance)
  const debtors = balances
    .filter((b) => b.balance < -0.01)
    .map((b) => ({ ...b, balance: -b.balance }))
    .sort((a, b) => b.balance - a.balance)

  const creditors = balances
    .filter((b) => b.balance > 0.01)
    .sort((a, b) => b.balance - a.balance)

  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]

    const amount = Math.min(debtor.balance, creditor.balance)

    settlements.push({
      from: debtor.participantId,
      to: creditor.participantId,
      fromName: debtor.participantName,
      toName: creditor.participantName,
      amount: Math.round(amount * 100) / 100,
    })

    debtor.balance -= amount
    creditor.balance -= amount

    if (debtor.balance < 0.01) i++
    if (creditor.balance < 0.01) j++
  }

  return settlements
}
