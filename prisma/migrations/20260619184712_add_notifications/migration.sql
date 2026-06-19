/*
  Warnings:

  - The primary key for the `Notice` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `content` on the `Notice` table. All the data in the column will be lost.
  - You are about to drop the column `urgent` on the `Notice` table. All the data in the column will be lost.
  - The `id` column on the `Notice` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `body` to the `Notice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publishDate` to the `Notice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notice" DROP CONSTRAINT "Notice_pkey",
DROP COLUMN "content",
DROP COLUMN "urgent",
ADD COLUMN     "body" TEXT NOT NULL,
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'General',
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'Normal',
ADD COLUMN     "publishDate" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Notice_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
