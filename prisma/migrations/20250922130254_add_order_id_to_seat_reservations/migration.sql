-- AlterTable
ALTER TABLE "public"."seat_reservations" ADD COLUMN     "orderId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."seat_reservations" ADD CONSTRAINT "seat_reservations_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."user_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
