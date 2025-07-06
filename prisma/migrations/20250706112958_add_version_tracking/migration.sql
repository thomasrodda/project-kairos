-- AlterTable
ALTER TABLE "blocks" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "page_snapshots" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "snapshotData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "block_changes" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "oldContent" TEXT,
    "newContent" TEXT,
    "oldFormatting" JSONB,
    "newFormatting" JSONB,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "block_changes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "page_snapshots_pageId_idx" ON "page_snapshots"("pageId");

-- CreateIndex
CREATE INDEX "page_snapshots_createdAt_idx" ON "page_snapshots"("createdAt");

-- CreateIndex
CREATE INDEX "block_changes_blockId_idx" ON "block_changes"("blockId");

-- CreateIndex
CREATE INDEX "block_changes_changedBy_idx" ON "block_changes"("changedBy");

-- CreateIndex
CREATE INDEX "block_changes_changedAt_idx" ON "block_changes"("changedAt");

-- AddForeignKey
ALTER TABLE "page_snapshots" ADD CONSTRAINT "page_snapshots_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_changes" ADD CONSTRAINT "block_changes_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_changes" ADD CONSTRAINT "block_changes_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
