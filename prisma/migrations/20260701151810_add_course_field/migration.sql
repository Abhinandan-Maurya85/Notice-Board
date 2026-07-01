-- AlterTable
ALTER TABLE "Notice" ADD COLUMN     "targetCourse" TEXT DEFAULT 'ALL';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "course" TEXT;
