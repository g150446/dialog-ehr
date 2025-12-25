-- AlterTable: Add isAdmin column
ALTER TABLE "users" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Data migration: Update existing ADMIN users
UPDATE "users" SET "isAdmin" = true WHERE "role" = 'ADMIN';

-- Data migration: Change ADMIN users to DOCTOR role
UPDATE "users" SET "role" = 'DOCTOR' WHERE "role" = 'ADMIN';

-- Data migration: Change other deprecated roles to valid ones
UPDATE "users" SET "role" = 'DOCTOR' WHERE "role" = 'RESIDENT';
UPDATE "users" SET "role" = 'NURSE' WHERE "role" = 'HEAD_NURSE';
UPDATE "users" SET "role" = 'NURSE' WHERE "role" = 'VIEWER';

-- AlterEnum: Remove deprecated values from UserRole
ALTER TYPE "UserRole" RENAME TO "UserRole_old";

CREATE TYPE "UserRole" AS ENUM ('DOCTOR', 'NURSE', 'PHARMACIST', 'MEDICAL_CLERK');

ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole" USING ("role"::text::"UserRole");
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'NURSE';

DROP TYPE "UserRole_old";
