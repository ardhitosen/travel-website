-- Migration: add_visas (VisaType + VisaApplication)
-- Creates VisaType and VisaApplication tables to match prisma/schema.prisma

PRAGMA foreign_keys=off;
BEGIN TRANSACTION;

CREATE TABLE "VisaType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "processingTime" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "imageUrl" TEXT,
    "requirements" JSONB NOT NULL,
    "documents" JSONB NOT NULL,
    "validity" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "VisaApplication" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passportNumber" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "passportExpiry" DATETIME NOT NULL,
    "travelPurpose" TEXT NOT NULL,
    "intendedArrival" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "visaTypeId" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VisaApplication_visaTypeId_fkey" FOREIGN KEY ("visaTypeId") REFERENCES "VisaType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

COMMIT;
PRAGMA foreign_keys=on;
