'use server'

import { prisma } from '@/lib/prisma'
import { itineraryItemSchema } from '@/lib/schema'
import { revalidatePath } from 'next/cache'

export async function createItineraryItem(tripId: string, data: unknown) {
  try {
    const validated = itineraryItemSchema.parse(data)

    const item = await prisma.itineraryItem.create({
      data: {
        tripId,
        ...validated,
      },
    })

    revalidatePath(`/trips/${tripId}`)
    return { success: true, data: item }
  } catch (error) {
    console.error('Failed to create itinerary item:', error)
    return { success: false, error: 'Failed to create itinerary item' }
  }
}

export async function updateItineraryItem(itemId: string, data: unknown) {
  try {
    const validated = itineraryItemSchema.partial().parse(data)

    const item = await prisma.itineraryItem.update({
      where: { id: itemId },
      data: validated,
    })

    const tripId = item.tripId
    revalidatePath(`/trips/${tripId}`)
    return { success: true, data: item }
  } catch (error) {
    console.error('Failed to update itinerary item:', error)
    return { success: false, error: 'Failed to update itinerary item' }
  }
}

export async function deleteItineraryItem(itemId: string) {
  try {
    const item = await prisma.itineraryItem.findUnique({
      where: { id: itemId },
      select: { tripId: true },
    })

    await prisma.itineraryItem.delete({
      where: { id: itemId },
    })

    if (item) {
      revalidatePath(`/trips/${item.tripId}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Failed to delete itinerary item:', error)
    return { success: false, error: 'Failed to delete itinerary item' }
  }
}
