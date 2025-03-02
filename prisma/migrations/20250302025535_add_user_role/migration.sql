-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "settings" JSONB,
    "activity" JSONB,
    "skills" JSONB,
    "reputation" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("activity", "createdAt", "email", "emailVerified", "id", "image", "name", "password", "reputation", "settings", "skills", "updatedAt") SELECT "activity", "createdAt", "email", "emailVerified", "id", "image", "name", "password", "reputation", "settings", "skills", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
