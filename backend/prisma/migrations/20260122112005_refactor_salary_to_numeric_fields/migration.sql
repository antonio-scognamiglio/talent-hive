/*
  Warnings:

  - You are about to drop the column `salaryRange` on the `Job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "salaryRange",
ADD COLUMN     "salaryCurrency" TEXT DEFAULT 'EUR',
ADD COLUMN     "salaryMax" INTEGER,
ADD COLUMN     "salaryMin" INTEGER;
