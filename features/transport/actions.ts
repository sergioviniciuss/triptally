'use server'

import { prisma } from '@/lib/prisma'
import { transportItemSchema } from '@/lib/schema'
import { revalidatePath } from 'next/cache'

export async function createTransportItem(tripId: string, data: unknown) {
  try {
    const validated = transportItemSchema.parse(data)

    const item = await prisma.transportItem.create({
      data: {
        tripId,
        ...validated,
      },
    })

    revalidatePath(`/trips/${tripId}`)
    return { success: true, data: item }
  } catch (error) {
    return { success: false, error: 'Failed to create transport item' }
  }
}

export async function updateTransportItem(itemId: string, data: unknown) {
  try {
    const validated = transportItemSchema.partial().parse(data)

    const item = await prisma.transportItem.update({
      where: { id: itemId },
      data: validated,
    })

    const tripId = item.tripId
    revalidatePath(`/trips/${tripId}`)
    return { success: true, data: item }
  } catch (error) {
    return { success: false, error: 'Failed to update transport item' }
  }
}

export async function deleteTransportItem(itemId: string) {
  try {
    const item = await prisma.transportItem.findUnique({
      where: { id: itemId },
      select: { tripId: true },
    })

    await prisma.transportItem.delete({
      where: { id: itemId },
    })

    if (item) {
      revalidatePath(`/trips/${item.tripId}`)
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete transport item' }
  }
}

export async function selectTransportItem(tripId: string, itemId: string) {
  try {
    // Unselect all transport items for this trip
    await prisma.transportItem.updateMany({
      where: { tripId },
      data: { isSelected: false },
    })

    // Select the specified item
    await prisma.transportItem.update({
      where: { id: itemId },
      data: { isSelected: true },
    })

    revalidatePath(`/trips/${tripId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to select transport item' }
  }
}
