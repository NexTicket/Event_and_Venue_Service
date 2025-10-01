-- AlterTable
ALTER TABLE "public"."cart_items" ADD COLUMN     "eventId" INTEGER,
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "seatId" TEXT,
ADD COLUMN     "seatInfo" TEXT,
ADD COLUMN     "seatType" "public"."SeatType",
ALTER COLUMN "bulkTicketId" DROP NOT NULL,
ALTER COLUMN "preferredSeatIds" DROP NOT NULL,
ALTER COLUMN "quantity" SET DEFAULT 1;

-- AddForeignKey
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
