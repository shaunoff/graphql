-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT E'user',
    "refreshToken" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Day" (
    "id" INTEGER NOT NULL,
    "mmyyyy" CHAR(6) NOT NULL,
    "mmddyyyy" CHAR(8) NOT NULL,
    "actualDate" TEXT NOT NULL,
    "dayName" VARCHAR(9) NOT NULL,
    "dayOfMonth" INTEGER NOT NULL,
    "dayOfYear" INTEGER NOT NULL,
    "daySuffix" VARCHAR(4) NOT NULL,
    "isWeekend" BOOLEAN NOT NULL,
    "monthName" VARCHAR(9) NOT NULL,
    "monthNameAbbreviated" CHAR(3) NOT NULL,
    "monthOfYear" INTEGER NOT NULL,
    "unix" BIGINT NOT NULL,
    "weekOfYear" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,

    CONSTRAINT "Day_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
