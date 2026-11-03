-- Store commercial volumes as numeric data without changing historical orders.
ALTER TABLE "Product"
ADD COLUMN "sachetBoxVolumeLiters" INTEGER NOT NULL DEFAULT 15;

UPDATE "Product"
SET "sachetBoxVolumeLiters" = 20
WHERE LOWER("code") = 'magnum';

UPDATE "Product"
SET "sachetBoxVolumeLiters" = 14
WHERE LOWER("code") IN ('cabum', 'pmag');

ALTER TABLE "Package"
ADD COLUMN "capacityLiters" INTEGER;

UPDATE "Package"
SET "capacityLiters" = CASE
  WHEN "type" = 'IBC_1000L' THEN 1000
  WHEN "type" = 'BOMBONA_20L' THEN 20
  ELSE NULL
END;

ALTER TABLE "Product"
ADD CONSTRAINT "Product_sachetBoxVolumeLiters_positive"
CHECK ("sachetBoxVolumeLiters" > 0);

ALTER TABLE "Package"
ADD CONSTRAINT "Package_capacityLiters_positive"
CHECK ("capacityLiters" IS NULL OR "capacityLiters" > 0);
