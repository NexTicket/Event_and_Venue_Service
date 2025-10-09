-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "amenities" JSONB,
ADD COLUMN     "availability" JSONB,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "type" TEXT;
