import { calculateBalances, calculateSettlements, Participant, Expense } from './splits'

describe('calculateBalances', () => {
  const participants: Participant[] = [
    { id: '1', name: 'Sérgio' },
    { id: '2', name: 'Vini' },
    { id: '3', name: 'Pai' },
  ]

  it('should calculate equal split with two participants', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        amount: 100,
        split: {
          paidByParticipantId: '1',
          splitMode: 'EQUAL',
          splitParticipants: [{ participantId: '1' }, { participantId: '2' }],
          splitAllocations: [],
        },
      },
    ]

    const balances = calculateBalances(expenses, participants.slice(0, 2))

    expect(balances).toHaveLength(2)
    expect(balances[0]).toEqual({
      participantId: '1',
      participantName: 'Sérgio',
      paid: 100,
      owed: 50,
      balance: 50,
    })
    expect(balances[1]).toEqual({
      participantId: '2',
      participantName: 'Vini',
      paid: 0,
      owed: 50,
      balance: -50,
    })
  })

  it('should calculate equal split with three participants', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        amount: 300,
        split: {
          paidByParticipantId: '1',
          splitMode: 'EQUAL',
          splitParticipants: [
            { participantId: '1' },
            { participantId: '2' },
            { participantId: '3' },
          ],
          splitAllocations: [],
        },
      },
    ]

    const balances = calculateBalances(expenses, participants)

    expect(balances[0].balance).toBe(200) // Paid 300, owed 100
    expect(balances[1].balance).toBe(-100) // Paid 0, owed 100
    expect(balances[2].balance).toBe(-100) // Paid 0, owed 100
  })

  it('should calculate custom split', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        amount: 300,
        split: {
          paidByParticipantId: '1',
          splitMode: 'CUSTOM',
          splitParticipants: [
            { participantId: '1' },
            { participantId: '2' },
            { participantId: '3' },
          ],
          splitAllocations: [
            { participantId: '1', amount: 100 },
            { participantId: '2', amount: 150 },
            { participantId: '3', amount: 50 },
          ],
        },
      },
    ]

    const balances = calculateBalances(expenses, participants)

    expect(balances[0].balance).toBe(200) // Paid 300, owed 100
    expect(balances[1].balance).toBe(-150) // Paid 0, owed 150
    expect(balances[2].balance).toBe(-50) // Paid 0, owed 50
  })

  it('should handle multiple expenses', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        amount: 200,
        split: {
          paidByParticipantId: '1',
          splitMode: 'EQUAL',
          splitParticipants: [{ participantId: '1' }, { participantId: '2' }],
          splitAllocations: [],
        },
      },
      {
        id: 'e2',
        amount: 100,
        split: {
          paidByParticipantId: '2',
          splitMode: 'EQUAL',
          splitParticipants: [{ participantId: '1' }, { participantId: '2' }],
          splitAllocations: [],
        },
      },
    ]

    const balances = calculateBalances(expenses, participants.slice(0, 2))

    expect(balances[0].paid).toBe(200)
    expect(balances[0].owed).toBe(150) // 100 + 50
    expect(balances[0].balance).toBe(50)
    expect(balances[1].paid).toBe(100)
    expect(balances[1].owed).toBe(150) // 100 + 50
    expect(balances[1].balance).toBe(-50)
  })

  it('should handle zero expense', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        amount: 0,
        split: {
          paidByParticipantId: '1',
          splitMode: 'EQUAL',
          splitParticipants: [{ participantId: '1' }],
          splitAllocations: [],
        },
      },
    ]

    const balances = calculateBalances(expenses, participants.slice(0, 1))

    expect(balances[0].balance).toBe(0)
  })

  it('should handle single participant', () => {
    const expenses: Expense[] = [
      {
        id: 'e1',
        amount: 100,
        split: {
          paidByParticipantId: '1',
          splitMode: 'EQUAL',
          splitParticipants: [{ participantId: '1' }],
          splitAllocations: [],
        },
      },
    ]

    const balances = calculateBalances(expenses, participants.slice(0, 1))

    expect(balances[0].paid).toBe(100)
    expect(balances[0].owed).toBe(100)
    expect(balances[0].balance).toBe(0)
  })
})

describe('calculateSettlements', () => {
  it('should calculate simple settlement', () => {
    const balances = [
      { participantId: '1', participantName: 'Sérgio', paid: 100, owed: 50, balance: 50 },
      { participantId: '2', participantName: 'Vini', paid: 0, owed: 50, balance: -50 },
    ]

    const settlements = calculateSettlements(balances)

    expect(settlements).toHaveLength(1)
    expect(settlements[0]).toEqual({
      from: '2',
      to: '1',
      fromName: 'Vini',
      toName: 'Sérgio',
      amount: 50,
    })
  })

  it('should minimize number of transfers', () => {
    const balances = [
      { participantId: '1', participantName: 'Sérgio', paid: 300, owed: 100, balance: 200 },
      { participantId: '2', participantName: 'Vini', paid: 0, owed: 100, balance: -100 },
      { participantId: '3', participantName: 'Pai', paid: 0, owed: 100, balance: -100 },
    ]

    const settlements = calculateSettlements(balances)

    expect(settlements).toHaveLength(2)
    expect(settlements[0].amount).toBe(100)
    expect(settlements[1].amount).toBe(100)
    const totalSettled = settlements.reduce((sum, s) => sum + s.amount, 0)
    expect(totalSettled).toBe(200)
  })

  it('should handle balanced participants', () => {
    const balances = [
      { participantId: '1', participantName: 'Sérgio', paid: 100, owed: 100, balance: 0 },
      { participantId: '2', participantName: 'Vini', paid: 100, owed: 100, balance: 0 },
    ]

    const settlements = calculateSettlements(balances)

    expect(settlements).toHaveLength(0)
  })

  it('should handle complex settlement', () => {
    const balances = [
      { participantId: '1', participantName: 'Sérgio', paid: 200, owed: 100, balance: 100 },
      { participantId: '2', participantName: 'Vini', paid: 50, owed: 100, balance: -50 },
      { participantId: '3', participantName: 'Pai', paid: 50, owed: 100, balance: -50 },
    ]

    const settlements = calculateSettlements(balances)

    const totalSettled = settlements.reduce((sum, s) => sum + s.amount, 0)
    expect(totalSettled).toBe(100)
  })
})
