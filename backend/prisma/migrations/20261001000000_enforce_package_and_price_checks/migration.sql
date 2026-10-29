-- AlterTable
ALTER TABLE "ProductPrice" ADD CONSTRAINT "ProductPrice_price_check" CHECK ("ProductPrice"."price" > 0);

-- AlterTable
ALTER TABLE "ClientProductPrice" ADD CONSTRAINT "ClientProductPrice_price_check" CHECK ("ClientProductPrice"."price" > 0);
