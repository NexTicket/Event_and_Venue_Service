/*
  Warnings:

  - You are about to drop the column `checkinOfficers` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `eventAdmins` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."events" DROP COLUMN "checkinOfficers",
DROP COLUMN "eventAdmins",
ADD COLUMN     "checkinOfficerUids" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "eventAdminUid" TEXT;
