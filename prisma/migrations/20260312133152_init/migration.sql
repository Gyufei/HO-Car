-- CreateEnum
CREATE TYPE "BillType" AS ENUM ('ELE', 'WATER');

-- CreateTable
CREATE TABLE "bills" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "BillType" NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "usage" DECIMAL(10,2) NOT NULL,
    "unit_price" DECIMAL(10,4),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_bills_user_year_month_type" ON "bills"("user_id", "year", "month", "type");
