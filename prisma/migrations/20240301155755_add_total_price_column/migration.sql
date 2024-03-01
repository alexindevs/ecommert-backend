/*
  Warnings:

  - You are about to drop the column `total` on the `Cart` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "total",
ADD COLUMN     "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;
