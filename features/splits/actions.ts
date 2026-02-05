'use server'

import { prisma } from '@/lib/prisma'
import { splitSchema } from '@/lib/schema'
import { revalidatePath } from 'next/cache'

export async function getSplit(expenseRefType: string, expenseRefId: string) {
  try {
    const split = await prisma.split.findUnique({
      where: {
        expenseRefType_expenseRefId: {
          expenseRefType,
          expenseRefId,
        },
      },
      include: {
        paidBy: true,
        splitParticipants: {
          include: {
            participant: true,
          },
        },
        splitAllocations: true,
      },
    })

    return { success: true, data: split }
  } catch (error) {
    return { success: false, error: 'Failed to fetch split' }
  }
}

export async function createOrUpdateSplit(tripId: string, data: unknown) {
  try {
    const validated = splitSchema.parse(data)

    // Delete existing split if it exists
    await prisma.split.deleteMany({
      where: {
        expenseRefType: validated.expenseRefType,
        expenseRefId: validated.expenseRefId,
      },
    })

    // Create new split
    const split = await prisma.split.create({
      data: {
        tripId,
        expenseRefType: validated.expenseRefType,
        expenseRefId: validated.expenseRefId,
        paidByParticipantId: validated.paidByParticipantId,
        splitMode: validated.splitMode,
        splitParticipants: {
          create: validated.participantIds.map((participantId) => ({
            participantId,
          })),
        },
        splitAllocations:
          validated.splitMode === 'CUSTOM' && validated.allocations
            ? {
                create: validated.allocations.map((allocation) => ({
                  participantId: allocation.participantId,
                  amount: allocation.amount,
                })),
              }
            : undefined,
      },
    })

    revalidatePath(`/trips/${tripId}`)
    return { success: true, data: split }
  } catch (error) {
    console.error('Split error:', error)
    return { success: false, error: 'Failed to save split' }
  }
}

export async function deleteSplit(expenseRefType: string, expenseRefId: string, tripId: string) {
  try {
    await prisma.split.deleteMany({
      where: {
        expenseRefType,
        expenseRefId,
      },
    })

    revalidatePath(`/trips/${tripId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete split' }
  }
}
