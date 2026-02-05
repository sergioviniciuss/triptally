-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "type" TEXT NOT NULL,
    "dateRangeStart" DATETIME,
    "dateRangeEnd" DATETIME,
    "isCandidate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Participant_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FlightOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "departDate" DATETIME NOT NULL,
    "returnDate" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "comments" TEXT,
    "baggageInfo" TEXT,
    "perPersonNotes" TEXT,
    "link" TEXT,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "FlightOption_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TransportItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "link" TEXT,
    "notes" TEXT,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "TransportItem_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LodgingStay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "hotelName" TEXT NOT NULL,
    "link" TEXT,
    "checkIn" DATETIME NOT NULL,
    "checkOut" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "notes" TEXT,
    CONSTRAINT "LodgingStay_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItineraryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "dayIndex" INTEGER NOT NULL,
    "date" DATETIME,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "km" INTEGER,
    "durationMinutes" INTEGER,
    "sleepOvernight" BOOLEAN NOT NULL DEFAULT false,
    "comments" TEXT,
    "pointsOfInterest" TEXT,
    "link" TEXT,
    CONSTRAINT "ItineraryItem_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Split" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "expenseRefType" TEXT NOT NULL,
    "expenseRefId" TEXT NOT NULL,
    "paidByParticipantId" TEXT NOT NULL,
    "splitMode" TEXT NOT NULL,
    CONSTRAINT "Split_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Split_paidByParticipantId_fkey" FOREIGN KEY ("paidByParticipantId") REFERENCES "Participant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SplitParticipant" (
    "splitId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,

    PRIMARY KEY ("splitId", "participantId"),
    CONSTRAINT "SplitParticipant_splitId_fkey" FOREIGN KEY ("splitId") REFERENCES "Split" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SplitParticipant_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SplitAllocation" (
    "splitId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "amount" REAL NOT NULL,

    PRIMARY KEY ("splitId", "participantId"),
    CONSTRAINT "SplitAllocation_splitId_fkey" FOREIGN KEY ("splitId") REFERENCES "Split" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SplitAllocation_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Split_expenseRefType_expenseRefId_key" ON "Split"("expenseRefType", "expenseRefId");
