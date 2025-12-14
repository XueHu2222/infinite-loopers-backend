-- CreateTable
CREATE TABLE "Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Not Started',
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME
);
