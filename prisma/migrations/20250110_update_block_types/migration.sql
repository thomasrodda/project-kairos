-- AlterEnum
-- This migration updates the BlockType enum to match frontend values
-- WARNING: This migration requires careful handling of existing data

-- Step 1: Create new enum type
CREATE TYPE "BlockType_new" AS ENUM ('paragraph', 'h1', 'h2', 'h3', 'bullet');

-- Step 2: Update existing data to new values
-- Note: This assumes you have existing data with old enum values
-- If you have no data yet, you can skip this step
ALTER TABLE "blocks" 
  ALTER COLUMN "type" TYPE text;

UPDATE "blocks" 
SET "type" = CASE 
  WHEN "type" = 'PARAGRAPH' THEN 'paragraph'
  WHEN "type" = 'HEADING1' THEN 'h1' 
  WHEN "type" = 'HEADING2' THEN 'h2'
  WHEN "type" = 'BULLET' THEN 'bullet'
  ELSE "type"
END;

-- Step 3: Change column type to new enum
ALTER TABLE "blocks" 
  ALTER COLUMN "type" TYPE "BlockType_new" 
  USING ("type"::text::"BlockType_new");

-- Step 4: Drop old enum and rename new one
DROP TYPE "BlockType";
ALTER TYPE "BlockType_new" RENAME TO "BlockType";