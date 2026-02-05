# TripTally

A mobile-first web app for planning trips with built-in cost splitting, inspired by the Google Sheets workflow for trip planning.

## Features

- **Trip Management**: Create, duplicate, and compare multiple trip candidates
- **Flight Tracking**: Multiple flight options with selection for totals
- **Transport Planning**: Car rentals, fuel, and public transport costs
- **Lodging Management**: Multiple stays with check-in/check-out tracking
- **Road Trip Mode**: Itinerary planning with day-by-day routes
- **Cost Splitting**: Equal or custom split with automatic balance calculation
- **Settlement Suggestions**: Minimal transfers to settle balances
- **Auto-save**: Changes saved automatically with visual feedback
- **Mobile-First**: Responsive design optimized for phones and tablets

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (Prisma ORM)
- **Validation**: Zod
- **Forms**: React Hook Form
- **Notifications**: Sonner (toast)
- **Testing**: Jest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ and yarn (or npm)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd triptally
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Initialize the database:
```bash
yarn prisma generate
yarn prisma migrate dev --name init
yarn prisma db seed
```

5. Run the development server:
```bash
yarn dev
```

6. Open [http://localhost:3000/trips](http://localhost:3000/trips) in your browser

## Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn test` - Run tests
- `yarn test:watch` - Run tests in watch mode
- `yarn prisma generate` - Generate Prisma client
- `yarn prisma migrate dev` - Run database migrations
- `yarn prisma db seed` - Seed database with example data
- `yarn prisma studio` - Open Prisma Studio (database GUI)

## Project Structure

```
triptally/
├── app/                    # Next.js app router pages
│   ├── trips/             # Trips list and detail pages
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/
│   └── ui/                # Reusable UI components
├── features/              # Feature-based modules
│   ├── trips/            # Trip management
│   ├── flights/          # Flight options
│   ├── transport/        # Transport items
│   ├── lodging/          # Lodging stays
│   ├── itinerary/        # Road trip itinerary
│   ├── splits/           # Cost splitting
│   └── total/            # Totals and balances
├── lib/                   # Shared utilities
│   ├── prisma.ts         # Prisma client
│   ├── schema.ts         # Zod schemas
│   ├── splits.ts         # Split calculation logic
│   ├── totals.ts         # Total calculation logic
│   └── utils.ts          # Utility functions
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seed
└── README.md
```

## Usage

### Creating a Trip

1. Click "+ Create Trip" on the trips list page
2. Enter destination, year, currency, and trip type (Flight or Road)
3. Optionally add start/end dates and mark as candidate for comparison
4. Click "Create Trip"

### Adding Expenses

Navigate to any tab (Flights, Transport, Lodging) and click "+ Add" to create entries. Each entry can have:
- Amount and details
- Links to bookings
- Notes and comments
- Selection status (for flights/transport to determine totals)

### Splitting Costs

1. Click the split icon ($ or +) on any expense
2. Select who paid for the expense
3. Choose who to split between
4. Select equal split or enter custom amounts
5. Save the split

### Viewing Balances

Go to the "Total" tab to see:
- Summary of all costs by category
- Grand total and per-day average
- Balance per person (paid vs owed)
- Settlement suggestions (who should pay whom)

### Road Trip Mode

When creating a trip, select "Road Trip" to replace the Flights tab with an Itinerary tab where you can plan day-by-day routes with distances, durations, and points of interest.

### Duplicating Trips

From the trips list, click "Duplicate" on any trip card to create a copy. You can optionally clear values while keeping the structure (useful for planning similar trips to the same destination).

## Database Schema

The app uses SQLite with the following main models:

- **Trip**: Core trip data (name, destination, year, currency, type)
- **Participant**: People on the trip
- **FlightOption**: Flight choices with selection
- **TransportItem**: Transportation costs
- **LodgingStay**: Accommodation bookings
- **ItineraryItem**: Road trip daily routes
- **Split**: Cost split configuration
- **SplitParticipant**: Who is included in a split
- **SplitAllocation**: Custom split amounts

## Contributing

Feel free to open issues or submit pull requests!

## License

MIT
