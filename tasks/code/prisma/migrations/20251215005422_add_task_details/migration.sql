-- AlterTable
ALTER TABLE "Task" ADD COLUMN "notes" TEXT;
ALTER TABLE "Task" ADD COLUMN "subtasks" JSONB;
ALTER TABLE "Task" ADD COLUMN "suggestions" TEXT;
