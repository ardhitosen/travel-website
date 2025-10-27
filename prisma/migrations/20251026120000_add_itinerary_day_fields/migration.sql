-- Migration: add title, description and imageUrl to ItineraryDay
-- Generated: 2025-10-26

PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

-- Add nullable text columns for per-day structured content
ALTER TABLE "ItineraryDay" ADD COLUMN "title" TEXT;
ALTER TABLE "ItineraryDay" ADD COLUMN "description" TEXT;
ALTER TABLE "ItineraryDay" ADD COLUMN "imageUrl" TEXT;

COMMIT;
PRAGMA foreign_keys=ON;
