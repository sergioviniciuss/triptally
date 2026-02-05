import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create a trip
  const trip = await prisma.trip.create({
    data: {
      name: 'Mallorca 2024',
      destination: 'Mallorca',
      year: 2024,
      currency: 'EUR',
      type: 'FLIGHT',
      dateRangeStart: new Date('2024-07-09'),
      dateRangeEnd: new Date('2024-07-12'),
      isCandidate: false,
    },
  })

  console.log('Created trip:', trip.name)

  // Create participants
  const sergio = await prisma.participant.create({
    data: {
      tripId: trip.id,
      name: 'Sérgio',
    },
  })

  const vini = await prisma.participant.create({
    data: {
      tripId: trip.id,
      name: 'Vini',
    },
  })

  const pai = await prisma.participant.create({
    data: {
      tripId: trip.id,
      name: 'Pai',
    },
  })

  console.log('Created participants:', sergio.name, vini.name, pai.name)

  // Create flight options
  const flight1 = await prisma.flightOption.create({
    data: {
      tripId: trip.id,
      route: 'Berlin → Mallorca',
      departDate: new Date('2024-07-09'),
      returnDate: new Date('2024-07-12'),
      amount: 661.93,
      comments: '– €24.26 Building – €128.18 family fare',
      isSelected: true,
    },
  })

  const flight2 = await prisma.flightOption.create({
    data: {
      tripId: trip.id,
      route: 'Berlin → Mallorca',
      departDate: new Date('2024-07-09'),
      returnDate: new Date('2024-07-10'),
      amount: 709.40,
      link: 'https://www.kayak.com',
      isSelected: false,
    },
  })

  console.log('Created flight options')

  // Create transport items
  const transport1 = await prisma.transportItem.create({
    data: {
      tripId: trip.id,
      label: 'Car rental',
      amount: 340.24,
      isSelected: true,
    },
  })

  console.log('Created transport items')

  // Create lodging stay
  const lodging1 = await prisma.lodgingStay.create({
    data: {
      tripId: trip.id,
      city: 'Palma',
      hotelName: 'Beachfront Villa',
      checkIn: new Date('2024-07-09'),
      checkOut: new Date('2024-07-12'),
      amount: 1293.00,
    },
  })

  console.log('Created lodging stays')

  // Create splits for flight
  const flightSplit = await prisma.split.create({
    data: {
      tripId: trip.id,
      expenseRefType: 'FLIGHT_OPTION',
      expenseRefId: flight1.id,
      paidByParticipantId: sergio.id,
      splitMode: 'EQUAL',
      splitParticipants: {
        create: [
          { participantId: sergio.id },
          { participantId: vini.id },
          { participantId: pai.id },
        ],
      },
    },
  })

  // Create split for transport
  const transportSplit = await prisma.split.create({
    data: {
      tripId: trip.id,
      expenseRefType: 'TRANSPORT_ITEM',
      expenseRefId: transport1.id,
      paidByParticipantId: vini.id,
      splitMode: 'EQUAL',
      splitParticipants: {
        create: [
          { participantId: sergio.id },
          { participantId: vini.id },
        ],
      },
    },
  })

  // Create split for lodging
  const lodgingSplit = await prisma.split.create({
    data: {
      tripId: trip.id,
      expenseRefType: 'LODGING_STAY',
      expenseRefId: lodging1.id,
      paidByParticipantId: pai.id,
      splitMode: 'CUSTOM',
      splitParticipants: {
        create: [
          { participantId: sergio.id },
          { participantId: vini.id },
          { participantId: pai.id },
        ],
      },
      splitAllocations: {
        create: [
          { participantId: sergio.id, amount: 400.00 },
          { participantId: vini.id, amount: 400.00 },
          { participantId: pai.id, amount: 493.00 },
        ],
      },
    },
  })

  console.log('Created splits')
  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
