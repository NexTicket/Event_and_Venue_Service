/*
  Warnings:

  - A unique constraint covering the columns `[firebaseUid]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Tenant" ADD COLUMN     "firebaseUid" TEXT;

-- AlterTable
ALTER TABLE "public"."Venue" ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "location" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_firebaseUid_key" ON "public"."Tenant"("firebaseUid");
