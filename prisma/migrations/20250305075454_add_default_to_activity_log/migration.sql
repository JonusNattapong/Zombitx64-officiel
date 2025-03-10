/*
  Warnings:

  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ParticipatedChallenges` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserCollaborations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `createdAt` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `ip` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `ActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `count` on the `ApiUsage` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ApiUsage` table. All the data in the column will be lost.
  - You are about to drop the column `endpoint` on the `ApiUsage` table. All the data in the column will be lost.
  - You are about to drop the column `errors` on the `ApiUsage` table. All the data in the column will be lost.
  - You are about to drop the column `lastError` on the `ApiUsage` table. All the data in the column will be lost.
  - You are about to drop the column `quota` on the `ApiUsage` table. All the data in the column will be lost.
  - You are about to drop the column `responseTime` on the `ApiUsage` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ApiUsage` table. All the data in the column will be lost.
  - You are about to drop the column `categories` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `difficulty` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `prerequisites` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `resources` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `reward` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `rules` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `submissions` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Collaboration` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Collaboration` table. All the data in the column will be lost.
  - You are about to drop the column `maxMembers` on the `Collaboration` table. All the data in the column will be lost.
  - You are about to drop the column `resources` on the `Collaboration` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Collaboration` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Collaboration` table. All the data in the column will be lost.
  - You are about to drop the column `tasks` on the `Collaboration` table. All the data in the column will be lost.
  - You are about to drop the column `timeline` on the `Collaboration` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Collaboration` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Collaboration` table. All the data in the column will be lost.
  - You are about to drop the column `visibility` on the `Collaboration` table. All the data in the column will be lost.
  - You are about to drop the column `certificates` on the `LearningProgress` table. All the data in the column will be lost.
  - You are about to drop the column `completed` on the `LearningProgress` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `LearningProgress` table. All the data in the column will be lost.
  - You are about to drop the column `lastAccessed` on the `LearningProgress` table. All the data in the column will be lost.
  - You are about to drop the column `progress` on the `LearningProgress` table. All the data in the column will be lost.
  - You are about to drop the column `quizScores` on the `LearningProgress` table. All the data in the column will be lost.
  - You are about to drop the column `timeSpent` on the `LearningProgress` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `LearningProgress` table. All the data in the column will be lost.
  - You are about to drop the column `action` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `read` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `changelog` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `demoUrl` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `documentation` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `downloads` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `extendedMetrics` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `featured` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `fileHash` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `license` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `metrics` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sourceUrl` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `subcategory` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `helpful` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `sellerId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Skill` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `Skill` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Skill` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `Skill` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `paymentProof` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `qrCodeData` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `qrCodeExpiry` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `reference` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `refundReason` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `walletAddress` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `emailNotifications` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `marketingEmails` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `promptpayId` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `pushNotifications` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `UserSettings` table. All the data in the column will be lost.
  - Added the required column `apiKey` to the `ApiUsage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Challenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Challenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Collaboration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Collaboration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revieweeId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewerId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Made the column `comment` on table `Review` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "VerificationToken_identifier_token_key";

-- DropIndex
DROP INDEX "VerificationToken_token_key";

-- DropIndex
DROP INDEX "_ParticipatedChallenges_B_index";

-- DropIndex
DROP INDEX "_ParticipatedChallenges_AB_unique";

-- DropIndex
DROP INDEX "_UserCollaborations_B_index";

-- DropIndex
DROP INDEX "_UserCollaborations_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Event";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VerificationToken";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_ParticipatedChallenges";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_UserCollaborations";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT '',
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ActivityLog" ("id", "userId") SELECT "id", "userId" FROM "ActivityLog";
DROP TABLE "ActivityLog";
ALTER TABLE "new_ActivityLog" RENAME TO "ActivityLog";
CREATE TABLE "new_ApiUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    CONSTRAINT "ApiUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ApiUsage" ("id", "userId") SELECT "id", "userId" FROM "ApiUsage";
DROP TABLE "ApiUsage";
ALTER TABLE "new_ApiUsage" RENAME TO "ApiUsage";
CREATE TABLE "new_Challenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Challenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Challenge" ("id") SELECT "id" FROM "Challenge";
DROP TABLE "Challenge";
ALTER TABLE "new_Challenge" RENAME TO "Challenge";
CREATE TABLE "new_Collaboration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Collaboration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Collaboration" ("id") SELECT "id" FROM "Collaboration";
DROP TABLE "Collaboration";
ALTER TABLE "new_Collaboration" RENAME TO "Collaboration";
CREATE TABLE "new_LearningProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    CONSTRAINT "LearningProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LearningProgress" ("courseId", "id", "userId") SELECT "courseId", "id", "userId" FROM "LearningProgress";
DROP TABLE "LearningProgress";
ALTER TABLE "new_LearningProgress" RENAME TO "LearningProgress";
CREATE TABLE "new_Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Notification" ("id", "userId") SELECT "id", "userId" FROM "Notification";
DROP TABLE "Notification";
ALTER TABLE "new_Notification" RENAME TO "Notification";
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Product_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("id") SELECT "id" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE TABLE "new_Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("comment", "id", "rating") SELECT "comment", "id", "rating" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
CREATE TABLE "new_Skill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Skill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Skill" ("id", "name", "userId") SELECT "id", "name", "userId" FROM "Skill";
DROP TABLE "Skill";
ALTER TABLE "new_Skill" RENAME TO "Skill";
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    CONSTRAINT "Transaction_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("buyerId", "id", "productId", "sellerId") SELECT "buyerId", "id", "productId", "sellerId" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE TABLE "new_UserSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserSettings" ("id", "userId") SELECT "id", "userId" FROM "UserSettings";
DROP TABLE "UserSettings";
ALTER TABLE "new_UserSettings" RENAME TO "UserSettings";
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
