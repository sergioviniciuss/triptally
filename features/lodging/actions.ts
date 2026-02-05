'use server'

import { prisma } from '@/lib/prisma'
import { lodgingStaySchema } from '@/lib/schema'
import { revalidatePath } from 'next/cache'

export async function createLodgingStay(tripId: string, data: unknown) {
  try {
    const validated = lodgingStaySchema.parse(data)

    const stay = await prisma.lodgingStay.create({
      data: {
        tripId,
        ...validated,
      },
    })

    revalidatePath(`/trips/${tripId}`)
    return { success: true, data: stay }
  } catch (error) {
    return { success: false, error: 'Failed to create lodging stay' }
  }
}

export async function updateLodgingStay(stayId: string, data: unknown) {
  try {
    const validated = lodgingStaySchema.partial().parse(data)

    const stay = await prisma.lodgingStay.update({
      where: { id: stayId },
      data: validated,
    })

    const tripId = stay.tripId
    revalidatePath(`/trips/${tripId}`)
    return { success: true, data: stay }
  } catch (error) {
    return { success: false, error: 'Failed to update lodging stay' }
  }
}

export async function deleteLodgingStay(stayId: string) {
  try {
    const stay = await prisma.lodgingStay.findUnique({
      where: { id: stayId },
      select: { tripId: true },
    })

    await prisma.lodgingStay.delete({
      where: { id: stayId },
    })

    if (stay) {
      revalidatePath(`/trips/${stay.tripId}`)
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete lodging stay' }
  }
}
