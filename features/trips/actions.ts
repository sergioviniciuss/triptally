'use server'

import { prisma } from '@/lib/prisma'
import { tripSchema, participantSchema } from '@/lib/schema'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth-utils'

export async function listTrips() {
  try {
    const { userId } = await requireAuth()
    
    const trips = await prisma.trip.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        flightOptions: { where: { isSelected: true } },
        transportItems: { where: { isSelected: true } },
        lodgingStays: true,
      },
    })

    return { success: true, data: trips }
  } catch (error) {
    return { success: false, error: 'Failed to fetch trips' }
  }
}

export async function getTrip(tripId: string) {
  try {
    const { userId } = await requireAuth()
    
    const trip = await prisma.trip.findFirst({
      where: { 
        id: tripId,
        userId,
      },
      include: {
        participants: true,
        flightOptions: { orderBy: { departDate: 'asc' } },
        transportItems: true,
        lodgingStays: { orderBy: { checkIn: 'asc' } },
        itineraryItems: { orderBy: { dayIndex: 'asc' } },
      },
    })

    if (!trip) {
      return { success: false, error: 'Trip not found' }
    }

    return { success: true, data: trip }
  } catch (error) {
    return { success: false, error: 'Failed to fetch trip' }
  }
}

export async function createTrip(data: unknown) {
  try {
    const { userId } = await requireAuth()
    const validated = tripSchema.parse(data)

    const trip = await prisma.trip.create({
      data: {
        ...validated,
        userId,
      },
    })

    revalidatePath('/trips')
    return { success: true, data: trip }
  } catch (error) {
    console.error('Error creating trip:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create trip' }
  }
}

export async function updateTrip(tripId: string, data: unknown) {
  try {
    const { userId } = await requireAuth()
    const validated = tripSchema.partial().parse(data)

    // Verify the trip belongs to the user
    const existingTrip = await prisma.trip.findFirst({
      where: { id: tripId, userId },
    })

    if (!existingTrip) {
      return { success: false, error: 'Trip not found' }
    }

    const trip = await prisma.trip.update({
      where: { id: tripId },
      data: validated,
    })

    revalidatePath(`/trips/${tripId}`)
    revalidatePath('/trips')
    return { success: true, data: trip }
  } catch (error) {
    return { success: false, error: 'Failed to update trip' }
  }
}

export async function deleteTrip(tripId: string) {
  try {
    const { userId } = await requireAuth()

    // Verify the trip belongs to the user
    const existingTrip = await prisma.trip.findFirst({
      where: { id: tripId, userId },
    })

    if (!existingTrip) {
      return { success: false, error: 'Trip not found' }
    }

    await prisma.trip.delete({
      where: { id: tripId },
    })

    revalidatePath('/trips')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete trip' }
  }
}

export async function duplicateTrip(tripId: string, clearValues: boolean = false) {
  try {
    const { userId } = await requireAuth()
    
    const originalTrip = await prisma.trip.findFirst({
      where: { id: tripId, userId },
      include: {
        participants: true,
        flightOptions: true,
        transportItems: true,
        lodgingStays: true,
        itineraryItems: true,
      },
    })

    if (!originalTrip) {
      return { success: false, error: 'Trip not found' }
    }

    const newTrip = await prisma.trip.create({
      data: {
        userId,
        name: `${originalTrip.name} (copy)`,
        destination: originalTrip.destination,
        year: originalTrip.year,
        currency: originalTrip.currency,
        type: originalTrip.type,
        isCandidate: false,
        participants: {
          create: originalTrip.participants.map((p) => ({ name: p.name })),
        },
        flightOptions: clearValues
          ? undefined
          : {
              create: originalTrip.flightOptions.map((f) => ({
                route: f.route,
                departDate: f.departDate,
                returnDate: f.returnDate,
                amount: f.amount,
                comments: f.comments,
                baggageInfo: f.baggageInfo,
                perPersonNotes: f.perPersonNotes,
                link: f.link,
                isSelected: f.isSelected,
              })),
            },
        transportItems: clearValues
          ? undefined
          : {
              create: originalTrip.transportItems.map((t) => ({
                label: t.label,
                amount: t.amount,
                link: t.link,
                notes: t.notes,
                isSelected: t.isSelected,
              })),
            },
        lodgingStays: clearValues
          ? undefined
          : {
              create: originalTrip.lodgingStays.map((l) => ({
                city: l.city,
                hotelName: l.hotelName,
                link: l.link,
                checkIn: l.checkIn,
                checkOut: l.checkOut,
                amount: l.amount,
                notes: l.notes,
              })),
            },
        itineraryItems: clearValues
          ? undefined
          : {
              create: originalTrip.itineraryItems.map((i) => ({
                dayIndex: i.dayIndex,
                date: i.date,
                from: i.from,
                to: i.to,
                km: i.km,
                durationMinutes: i.durationMinutes,
                sleepOvernight: i.sleepOvernight,
                comments: i.comments,
                pointsOfInterest: i.pointsOfInterest,
                link: i.link,
              })),
            },
      },
    })

    revalidatePath('/trips')
    return { success: true, data: newTrip }
  } catch (error) {
    return { success: false, error: 'Failed to duplicate trip' }
  }
}

export async function addParticipant(tripId: string, data: unknown) {
  try {
    const validated = participantSchema.parse(data)

    const participant = await prisma.participant.create({
      data: {
        tripId,
        ...validated,
      },
    })

    revalidatePath(`/trips/${tripId}`)
    return { success: true, data: participant }
  } catch (error) {
    return { success: false, error: 'Failed to add participant' }
  }
}

export async function updateParticipant(participantId: string, data: unknown) {
  try {
    const validated = participantSchema.parse(data)

    const participant = await prisma.participant.update({
      where: { id: participantId },
      data: validated,
    })

    const trip = await prisma.participant.findUnique({
      where: { id: participantId },
      select: { tripId: true },
    })

    if (trip) {
      revalidatePath(`/trips/${trip.tripId}`)
    }

    return { success: true, data: participant }
  } catch (error) {
    return { success: false, error: 'Failed to update participant' }
  }
}

export async function deleteParticipant(participantId: string) {
  try {
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      select: { tripId: true },
    })

    await prisma.participant.delete({
      where: { id: participantId },
    })

    if (participant) {
      revalidatePath(`/trips/${participant.tripId}`)
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete participant' }
  }
}
