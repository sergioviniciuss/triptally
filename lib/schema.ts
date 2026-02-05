import { z } from 'zod'

export const tripSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  destination: z.string().min(1, 'Destination is required'),
  year: z.number().int().min(2000).max(2100),
  currency: z.string().length(3).default('EUR'),
  type: z.enum(['FLIGHT', 'ROAD']),
  dateRangeStart: z.string().optional().transform(val => val ? new Date(val) : undefined),
  dateRangeEnd: z.string().optional().transform(val => val ? new Date(val) : undefined),
  isCandidate: z.boolean().default(false),
})

export const participantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

export const flightOptionSchema = z.object({
  route: z.string().min(1, 'Route is required'),
  departDate: z.string().transform(val => new Date(val)),
  returnDate: z.string().transform(val => new Date(val)),
  amount: z.number().min(0),
  comments: z.string().optional(),
  baggageInfo: z.string().optional(),
  perPersonNotes: z.string().optional(),
  link: z.string().optional(),
  isSelected: z.boolean().default(false),
})

export const transportItemSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  amount: z.number().min(0),
  link: z.string().optional(),
  notes: z.string().optional(),
  isSelected: z.boolean().default(false),
})

export const lodgingStaySchema = z.object({
  city: z.string().min(1, 'City is required'),
  hotelName: z.string().min(1, 'Hotel name is required'),
  link: z.string().optional(),
  checkIn: z.string().transform(val => new Date(val)),
  checkOut: z.string().transform(val => new Date(val)),
  amount: z.number().min(0),
  notes: z.string().optional(),
})

export const itineraryItemSchema = z.object({
  dayIndex: z.number().int().min(1),
  date: z.string().optional().transform(val => val ? new Date(val) : undefined),
  from: z.string().min(1, 'From is required'),
  to: z.string().min(1, 'To is required'),
  km: z.number().int().min(0).optional(),
  durationMinutes: z.number().int().min(0).optional(),
  sleepOvernight: z.boolean().default(false),
  comments: z.string().optional(),
  pointsOfInterest: z.string().optional(),
  link: z.string().optional(),
})

export const splitSchema = z.object({
  expenseRefType: z.enum(['FLIGHT_OPTION', 'TRANSPORT_ITEM', 'LODGING_STAY']),
  expenseRefId: z.string(),
  paidByParticipantId: z.string(),
  splitMode: z.enum(['EQUAL', 'CUSTOM']),
  participantIds: z.array(z.string()).min(1),
  allocations: z.array(z.object({
    participantId: z.string(),
    amount: z.number(),
  })).optional(),
})

export type TripInput = z.infer<typeof tripSchema>
export type ParticipantInput = z.infer<typeof participantSchema>
export type FlightOptionInput = z.infer<typeof flightOptionSchema>
export type TransportItemInput = z.infer<typeof transportItemSchema>
export type LodgingStayInput = z.infer<typeof lodgingStaySchema>
export type ItineraryItemInput = z.infer<typeof itineraryItemSchema>
export type SplitInput = z.infer<typeof splitSchema>
