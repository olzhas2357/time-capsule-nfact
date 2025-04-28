-- CreateTable
CREATE TABLE "Capsule" (
    "id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attachments" JSONB NOT NULL,

    CONSTRAINT "Capsule_pkey" PRIMARY KEY ("id")
);
