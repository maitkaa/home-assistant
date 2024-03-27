-- CreateEnum
CREATE TYPE "MeasurePoint" AS ENUM ('BEDROOM', 'LIVING_ROOM', 'OUTSIDE');

-- CreateTable
CREATE TABLE "Mesurements" (
    "id" TEXT NOT NULL,
    "measurePoint" "MeasurePoint" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mesurements_pkey" PRIMARY KEY ("id")
);
