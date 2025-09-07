-- CreateEnum
CREATE TYPE "public"."EventStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."Category" AS ENUM ('MUSIC', 'SPORTS', 'THEATER', 'COMEDY', 'CONFERENCE', 'FESTIVAL', 'WORKSHOP', 'OTHER');

-- CreateTable
CREATE TABLE "public"."Tenant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firebaseUid" TEXT,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Venue" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "seatMap" JSONB NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "capacity" INTEGER,
    "location" TEXT,
    "image" TEXT,
    "ownerUid" TEXT,
    "description" TEXT,
    "featuredImage" TEXT,
    "images" TEXT[],

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "created_at" TIMESTAMPTZ(6),
    "status" "public"."EventStatus" NOT NULL DEFAULT 'PENDING',
    "venueId" INTEGER,
    "image" TEXT,
    "endTime" TEXT,
    "startTime" TEXT,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_firebaseUid_key" ON "public"."Tenant"("firebaseUid");

-- AddForeignKey
ALTER TABLE "public"."Venue" ADD CONSTRAINT "Venue_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "public"."Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
