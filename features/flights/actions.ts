'use server'

import { prisma } from '@/lib/prisma'
import { flightOptionSchema } from '@/lib/schema'
import { revalidatePath } from 'next/cache'

export async function createFlightOption(tripId: string, data: unknown) {
  try {
    const validated = flightOptionSchema.parse(data)

    const flight = await prisma.flightOption.create({
      data: {
        tripId,
        ...validated,
      },
    })

    revalidatePath(`/trips/${tripId}`)
    return { success: true, data: flight }
  } catch (error) {
    return { success: false, error: 'Failed to create flight option' }
  }
}

export async function updateFlightOption(flightId: string, data: unknown) {
  try {
    const validated = flightOptionSchema.partial().parse(data)

    const flight = await prisma.flightOption.update({
      where: { id: flightId },
      data: validated,
    })

    const tripId = flight.tripId
    revalidatePath(`/trips/${tripId}`)
    return { success: true, data: flight }
  } catch (error) {
    return { success: false, error: 'Failed to update flight option' }
  }
}

export async function deleteFlightOption(flightId: string) {
  try {
    const flight = await prisma.flightOption.findUnique({
      where: { id: flightId },
      select: { tripId: true },
    })

    await prisma.flightOption.delete({
      where: { id: flightId },
    })

    if (flight) {
      revalidatePath(`/trips/${flight.tripId}`)
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete flight option' }
  }
}

export async function selectFlightOption(tripId: string, flightId: string) {
  try {
    // Unselect all flights for this trip
    await prisma.flightOption.updateMany({
      where: { tripId },
      data: { isSelected: false },
    })

    // Select the specified flight
    await prisma.flightOption.update({
      where: { id: flightId },
      data: { isSelected: true },
    })

    revalidatePath(`/trips/${tripId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to select flight option' }
  }
}
