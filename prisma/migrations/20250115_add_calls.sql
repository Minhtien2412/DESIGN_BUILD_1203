-- CreateEnum for CallStatus
CREATE TYPE "CallStatus" AS ENUM ('INITIATED', 'RINGING', 'ANSWERED', 'ENDED', 'MISSED', 'DECLINED');

-- CreateTable for users (if not exists)
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "fcm_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable for calls
CREATE TABLE "calls" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "caller_id" TEXT NOT NULL,
    "callee_id" TEXT NOT NULL,
    "status" "CallStatus" NOT NULL DEFAULT 'INITIATED',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answered_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "duration" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "calls_room_id_key" ON "calls"("room_id");
CREATE INDEX "calls_caller_id_idx" ON "calls"("caller_id");
CREATE INDEX "calls_callee_id_idx" ON "calls"("callee_id");
CREATE INDEX "calls_status_idx" ON "calls"("status");

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_caller_id_fkey" FOREIGN KEY ("caller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "calls" ADD CONSTRAINT "calls_callee_id_fkey" FOREIGN KEY ("callee_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
