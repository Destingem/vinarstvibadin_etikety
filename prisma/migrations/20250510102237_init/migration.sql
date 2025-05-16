-- CreateTable
CREATE TABLE "Winery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "passwordSalt" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Wine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "vintage" INTEGER,
    "batch" TEXT,
    "alcoholContent" REAL,
    "energyValueKJ" REAL,
    "energyValueKcal" REAL,
    "fat" REAL DEFAULT 0,
    "saturatedFat" REAL DEFAULT 0,
    "carbs" REAL DEFAULT 0,
    "sugars" REAL DEFAULT 0,
    "protein" REAL DEFAULT 0,
    "salt" REAL DEFAULT 0,
    "ingredients" TEXT,
    "additionalInfo" TEXT,
    "allergens" TEXT,
    "wineRegion" TEXT,
    "wineSubregion" TEXT,
    "wineVillage" TEXT,
    "wineTract" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "wineryId" TEXT NOT NULL,
    CONSTRAINT "Wine_wineryId_fkey" FOREIGN KEY ("wineryId") REFERENCES "Winery" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Winery_name_key" ON "Winery"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Winery_slug_key" ON "Winery"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Winery_email_key" ON "Winery"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Wine_wineryId_name_vintage_batch_key" ON "Wine"("wineryId", "name", "vintage", "batch");
