const fs = require('fs');
const path = require('path');

const content = `-- Create ClientProductPrice table
CREATE TABLE "ClientProductPrice" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientProductPrice_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "ClientProductPrice_userId_idx" ON "ClientProductPrice"("userId");
CREATE INDEX "ClientProductPrice_productId_idx" ON "ClientProductPrice"("productId");
CREATE INDEX "ClientProductPrice_packageId_idx" ON "ClientProductPrice"("packageId");

-- Add unique constraint
ALTER TABLE "ClientProductPrice" ADD CONSTRAINT "ClientProductPrice_userId_productId_packageId_key" UNIQUE ("userId", "productId", "packageId");

-- Add foreign keys
ALTER TABLE "ClientProductPrice" ADD CONSTRAINT "ClientProductPrice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "ClientProductPrice" ADD CONSTRAINT "ClientProductPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE;
ALTER TABLE "ClientProductPrice" ADD CONSTRAINT "ClientProductPrice_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE;

-- Add unique constraint on Package.type
ALTER TABLE "Package" ADD CONSTRAINT "Package_type_key" UNIQUE ("type");
`;

const migrationDir = path.join(__dirname, 'prisma', 'migrations', '20260916000000_add_client_product_price');
if (!fs.existsSync(migrationDir)) {
    fs.mkdirSync(migrationDir, { recursive: true });
}
fs.writeFileSync(path.join(migrationDir, 'migration.sql'), content, 'utf8');
console.log('Migration file written successfully');