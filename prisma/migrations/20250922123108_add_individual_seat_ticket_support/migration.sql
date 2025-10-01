-- AlterTable
ALTER TABLE "public"."user_tickets" ADD COLUMN     "eventId" INTEGER,
ALTER COLUMN "bulkTicketId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."user_tickets" ADD CONSTRAINT "user_tickets_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
