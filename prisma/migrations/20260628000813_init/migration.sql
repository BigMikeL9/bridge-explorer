CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateEnum
CREATE TYPE "BridgeCondition" AS ENUM ('Good', 'Fair', 'Poor', 'Unknown');

-- CreateEnum
CREATE TYPE "PriorityLevel" AS ENUM ('Critical', 'High', 'Medium', 'Low');

-- CreateTable
CREATE TABLE "Bridge" (
    "id" TEXT NOT NULL,
    "structureNumber" TEXT NOT NULL,
    "stateCode" VARCHAR(2) NOT NULL,
    "stateName" TEXT NOT NULL,
    "countyCode" VARCHAR(5) NOT NULL,
    "countyName" TEXT NOT NULL,
    "district" TEXT,
    "facilityCarried" TEXT,
    "location" TEXT,
    "featureIntersected" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "hasValidCoordinates" BOOLEAN NOT NULL DEFAULT false,
    "averageDailyTraffic" INTEGER,
    "trafficYear" INTEGER,
    "truckTrafficPercent" DOUBLE PRECISION,
    "futureAverageDailyTraffic" INTEGER,
    "yearBuilt" INTEGER,
    "yearReconstructed" INTEGER,
    "bridgeAge" INTEGER,
    "lastInspectionDate" TIMESTAMP(3),
    "inspectionFrequencyMonths" INTEGER,
    "nextInspectionDueDate" TIMESTAMP(3),
    "bridgeCondition" "BridgeCondition" NOT NULL DEFAULT 'Unknown',
    "lowestRating" INTEGER,
    "deckCondition" INTEGER,
    "superstructureCondition" INTEGER,
    "substructureCondition" INTEGER,
    "channelCondition" INTEGER,
    "culvertCondition" INTEGER,
    "structuralEvaluation" INTEGER,
    "priorityLevel" "PriorityLevel" NOT NULL DEFAULT 'Low',
    "priorityReasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "structureLengthMeters" DOUBLE PRECISION,
    "maxSpanLengthMeters" DOUBLE PRECISION,
    "roadwayWidthMeters" DOUBLE PRECISION,
    "deckWidthMeters" DOUBLE PRECISION,
    "deckAreaSqMeters" DOUBLE PRECISION,
    "owner" TEXT,
    "maintenanceResponsibility" TEXT,
    "functionalClass" TEXT,
    "tollStatus" TEXT,
    "openStatus" TEXT,
    "scourCritical" TEXT,
    "fractureCritical" BOOLEAN,
    "improvementCost" DOUBLE PRECISION,
    "improvementYear" INTEGER,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3),
    "searchText" TEXT NOT NULL DEFAULT '',
    "coordinateGeometry" geometry(Point,4326),
    "searchVector" tsvector,

    CONSTRAINT "Bridge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bridge_structureNumber_key" ON "Bridge"("structureNumber");

-- CreateIndex
CREATE INDEX "Bridge_stateCode_idx" ON "Bridge"("stateCode");

-- CreateIndex
CREATE INDEX "Bridge_countyCode_idx" ON "Bridge"("countyCode");

-- CreateIndex
CREATE INDEX "Bridge_stateCode_countyCode_idx" ON "Bridge"("stateCode", "countyCode");

-- CreateIndex
CREATE INDEX "Bridge_bridgeCondition_idx" ON "Bridge"("bridgeCondition");

-- CreateIndex
CREATE INDEX "Bridge_priorityLevel_idx" ON "Bridge"("priorityLevel");

-- CreateIndex
CREATE INDEX "Bridge_stateCode_priorityLevel_idx" ON "Bridge"("stateCode", "priorityLevel");

-- CreateIndex
CREATE INDEX "Bridge_stateCode_bridgeCondition_idx" ON "Bridge"("stateCode", "bridgeCondition");

-- CreateIndex
CREATE INDEX "Bridge_averageDailyTraffic_idx" ON "Bridge"("averageDailyTraffic" DESC);

-- CreateIndex
CREATE INDEX "Bridge_bridgeAge_idx" ON "Bridge"("bridgeAge" DESC);

-- CreateIndex
CREATE INDEX "Bridge_lastInspectionDate_idx" ON "Bridge"("lastInspectionDate" DESC);

-- CreateIndex
CREATE INDEX "Bridge_lowestRating_idx" ON "Bridge"("lowestRating");

-- CreateIndex
CREATE INDEX "Bridge_viewCount_idx" ON "Bridge"("viewCount" DESC);

-- CreateIndex
CREATE INDEX "Bridge_lastViewedAt_idx" ON "Bridge"("lastViewedAt" DESC);

-- CreateIndex
CREATE INDEX "Bridge_coordinateGeometry_idx" ON "Bridge" USING GIST ("coordinateGeometry");

-- CreateIndex
CREATE INDEX "Bridge_searchVector_idx" ON "Bridge" USING GIN ("searchVector");
