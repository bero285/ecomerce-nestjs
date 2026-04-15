/*
  Warnings:

  - You are about to drop the column `checkout` on the `carts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "carts" DROP COLUMN "checkout",
ADD COLUMN     "checkedOut" BOOLEAN NOT NULL DEFAULT false;
