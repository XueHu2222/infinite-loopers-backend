-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "coins" INTEGER NOT NULL DEFAULT 10,
    "currentCharacterId" INTEGER NOT NULL DEFAULT 1,
    "hasFinishedTour" BOOLEAN NOT NULL DEFAULT false,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "maxXp" INTEGER NOT NULL DEFAULT 100
);
INSERT INTO "new_User" ("coins", "createdAt", "currentCharacterId", "email", "hasFinishedTour", "id", "password", "username") SELECT "coins", "createdAt", "currentCharacterId", "email", "hasFinishedTour", "id", "password", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
