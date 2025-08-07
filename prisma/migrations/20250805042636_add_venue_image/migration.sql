/*
  Warnings:

  - You are about to drop the column `address` on the `Venue` table. All the data in the column will be lost.
  - You are about to drop the column `amenities` on the `Venue` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Venue` table. All the data in the column will be lost.
  - You are about to drop the column `contact` on the `Venue` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Venue` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Venue` table. All the data in the column will be lost.
  - You are about to drop the column `seatLayout` on the `Venue` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Venue` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Venue` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `Venue` table. All the data in the column will be lost.
  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SeatType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_venueId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SeatType" DROP CONSTRAINT "SeatType_venueId_fkey";

-- AlterTable
ALTER TABLE "public"."Venue" DROP COLUMN "address",
DROP COLUMN "amenities",
DROP COLUMN "city",
DROP COLUMN "contact",
DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "seatLayout",
DROP COLUMN "state",
DROP COLUMN "updatedAt",
DROP COLUMN "zipCode",
ADD COLUMN     "image" TEXT;

-- DropTable
DROP TABLE "public"."Event";

-- DropTable
DROP TABLE "public"."SeatType";

-- DropEnum
DROP TYPE "public"."EventStatus";

-- CreateTable
CREATE TABLE "public"."events" (
    "id" BIGSERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "created_at" TIMESTAMPTZ(6),

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);
