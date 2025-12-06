-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "maritalStatus" TEXT NOT NULL,
    "religion" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "bp" TEXT,
    "temp" REAL,
    "weight" REAL,
    "diagnosis" TEXT,
    "treatment" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Entry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
