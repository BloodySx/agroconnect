-- Replace inherited company-specific demo catalog entries with neutral academic sample names.
-- Existing order relations and price history remain intact.
WITH ranked_products AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC) AS position
  FROM "Product"
)
UPDATE "Product" AS product
SET
  "name" = 'Insumo agrícola ' || ranked_products.position::text,
  "code" = 'AGRO-' || ranked_products.position::text
FROM ranked_products
WHERE product."id" = ranked_products."id";
