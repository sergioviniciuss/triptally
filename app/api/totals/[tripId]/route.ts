import { NextRequest, NextResponse } from 'next/server'
import { calculateTripTotals } from '@/lib/totals'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const totals = await calculateTripTotals(tripId)
    return NextResponse.json(totals)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate totals' }, { status: 500 })
  }
}
