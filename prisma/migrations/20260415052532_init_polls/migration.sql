-- CreateTable
CREATE TABLE "MeetingPoll" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT,
    "reserveTimes" BOOLEAN NOT NULL DEFAULT false,
    "showVotes" BOOLEAN NOT NULL DEFAULT true,
    "link" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Created',
    "votes" INTEGER NOT NULL DEFAULT 0,
    "selections" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingPoll_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MeetingPoll_link_key" ON "MeetingPoll"("link");

-- AddForeignKey
ALTER TABLE "MeetingPoll" ADD CONSTRAINT "MeetingPoll_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
