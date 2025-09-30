-- Migration: add_banner_title_description
-- Adds optional title and description columns to BannerSlide

PRAGMA foreign_keys=off;
BEGIN TRANSACTION;

ALTER TABLE "BannerSlide" ADD COLUMN "title" TEXT;
ALTER TABLE "BannerSlide" ADD COLUMN "description" TEXT;

COMMIT;
PRAGMA foreign_keys=on;
