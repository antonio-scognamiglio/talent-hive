/*
  Warnings:

  - The values [HIRING_MANAGER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `candidateId` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `hiringManagerId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the `Candidate` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[jobId,userId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cvUrl` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Application` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `createdById` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('NEW', 'SCREENING', 'INTERVIEW', 'OFFER', 'DONE');

-- CreateEnum
CREATE TYPE "FinalDecision" AS ENUM ('HIRED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'RECRUITER', 'CANDIDATE');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CANDIDATE';
COMMIT;

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_userId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_hiringManagerId_fkey";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "candidateId",
DROP COLUMN "status",
ADD COLUMN     "coverLetter" TEXT,
ADD COLUMN     "cvUrl" TEXT NOT NULL,
ADD COLUMN     "finalDecision" "FinalDecision",
ADD COLUMN     "workflowStatus" "WorkflowStatus" NOT NULL DEFAULT 'NEW',
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "hiringManagerId",
ADD COLUMN     "createdById" TEXT NOT NULL;

-- DropTable
DROP TABLE "Candidate";

-- DropEnum
DROP TYPE "ApplicationStatus";

-- CreateIndex
CREATE UNIQUE INDEX "Application_jobId_userId_key" ON "Application"("jobId", "userId");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
