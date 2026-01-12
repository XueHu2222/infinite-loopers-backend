-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Not Started',
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "category" TEXT,
    "notes" TEXT,
    "suggestions" TEXT,
    "subtasks" JSONB,
    "duration" INTEGER DEFAULT 0,
    "timeSpent" INTEGER DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME
);
INSERT INTO "new_Task" ("category", "completedAt", "createdAt", "duration", "endDate", "id", "notes", "priority", "status", "subtasks", "suggestions", "timeSpent", "title", "userId") SELECT "category", "completedAt", "createdAt", "duration", "endDate", "id", "notes", "priority", "status", "subtasks", "suggestions", "timeSpent", "title", "userId" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
