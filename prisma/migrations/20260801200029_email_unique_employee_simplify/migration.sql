-- AlterTable: email is now unique (still nullable — existing accounts
-- without one aren't broken; new/edited accounts are required to set one).
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
