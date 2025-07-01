/*
  Warnings:

  - You are about to drop the column `total` on the `orders` table. All the data in the column will be lost.
  - Added the required column `amount` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Made the column `shippingInfo` on table `orders` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "total",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "shippingInfo" SET NOT NULL;

-- CreateIndex
CREATE INDEX "cart_items_cartId_idx" ON "cart_items"("cartId");

-- CreateIndex
CREATE INDEX "cart_items_productId_idx" ON "cart_items"("productId");

-- CreateIndex
CREATE INDEX "cart_items_variantId_idx" ON "cart_items"("variantId");

-- CreateIndex
CREATE INDEX "carts_userId_idx" ON "carts"("userId");
