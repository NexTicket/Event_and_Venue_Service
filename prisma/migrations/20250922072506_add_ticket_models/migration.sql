-- CreateEnum
CREATE TYPE "public"."SeatType" AS ENUM ('VIP', 'REGULAR');

-- CreateEnum
CREATE TYPE "public"."TicketStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."TransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "public"."bulk_tickets" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "venueId" INTEGER NOT NULL,
    "seatType" "public"."SeatType" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "totalSeats" INTEGER NOT NULL,
    "availableSeats" INTEGER NOT NULL,
    "seatPrefix" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bulk_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cart_items" (
    "id" SERIAL NOT NULL,
    "firebaseUid" TEXT NOT NULL,
    "bulkTicketId" INTEGER NOT NULL,
    "preferredSeatIds" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_orders" (
    "id" SERIAL NOT NULL,
    "firebaseUid" TEXT NOT NULL,
    "orderReference" TEXT NOT NULL,
    "paymentIntentId" TEXT,
    "stripePaymentId" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "serviceFee" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "user_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_tickets" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "bulkTicketId" INTEGER NOT NULL,
    "firebaseUid" TEXT NOT NULL,
    "seatId" TEXT NOT NULL,
    "pricePaid" DOUBLE PRECISION NOT NULL,
    "status" "public"."TicketStatus" NOT NULL DEFAULT 'SOLD',
    "qrCodeData" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transactions" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "transactionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "transactionReference" TEXT,
    "status" "public"."TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_orders_orderReference_key" ON "public"."user_orders"("orderReference");

-- CreateIndex
CREATE UNIQUE INDEX "user_orders_paymentIntentId_key" ON "public"."user_orders"("paymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_transactionId_key" ON "public"."transactions"("transactionId");

-- AddForeignKey
ALTER TABLE "public"."bulk_tickets" ADD CONSTRAINT "bulk_tickets_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bulk_tickets" ADD CONSTRAINT "bulk_tickets_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "public"."Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_bulkTicketId_fkey" FOREIGN KEY ("bulkTicketId") REFERENCES "public"."bulk_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_tickets" ADD CONSTRAINT "user_tickets_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."user_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_tickets" ADD CONSTRAINT "user_tickets_bulkTicketId_fkey" FOREIGN KEY ("bulkTicketId") REFERENCES "public"."bulk_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."user_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
