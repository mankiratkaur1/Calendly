import { PrismaClient, BookingStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.booking.deleteMany();
  await prisma.dateOverride.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.meetingPoll.deleteMany();
  await prisma.eventType.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      name: "Mankirat Kaur",
      email: "alex.johnson@example.com",
      username: "alex",
      timezone: "America/New_York",
      avatarUrl: null,
    },
  });

  const eventTypes = await prisma.eventType.createMany({
    data: [
      {
        userId: user.id,
        name: "15 Minute Meeting",
        slug: "15min",
        durationMinutes: 15,
        description: "Quick check-in or standup.",
        color: "#0069ff",
      },
      {
        userId: user.id,
        name: "30 Minute Meeting",
        slug: "30min",
        durationMinutes: 30,
        description: "Standard meeting for planning or feedback.",
        color: "#00a2ff",
      },
      {
        userId: user.id,
        name: "60 Minute Meeting",
        slug: "60min",
        durationMinutes: 60,
        description: "Deep work session or extended discussion.",
        color: "#7c3aed",
      },
    ],
  });

  const savedEventTypes = await prisma.eventType.findMany({ where: { userId: user.id } });

  const availabilityData = [];
  for (let day = 0; day < 7; day++) {
    if (day >= 1 && day <= 5) {
      availabilityData.push({
        userId: user.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true,
      });
    } else {
      availabilityData.push({
        userId: user.id,
        dayOfWeek: day,
        startTime: "00:00",
        endTime: "00:00",
        isAvailable: false,
      });
    }
  }

  await prisma.availability.createMany({ data: availabilityData });

  const now = new Date();
  const upcomingBase = new Date(now);
  upcomingBase.setDate(now.getDate() + 3);
  upcomingBase.setHours(10, 0, 0, 0);

  const bookingsData = [
    {
      eventTypeId: savedEventTypes.find((event) => event.slug === "15min")!.id,
      inviteeName: "Sophia Lee",
      inviteeEmail: "sophia.lee@example.com",
      startTime: new Date(upcomingBase),
      endTime: new Date(upcomingBase.getTime() + 15 * 60 * 1000),
      status: BookingStatus.CONFIRMED,
    },
    {
      eventTypeId: savedEventTypes.find((event) => event.slug === "30min")!.id,
      inviteeName: "Mason Patel",
      inviteeEmail: "mason.patel@example.com",
      startTime: new Date(upcomingBase.getTime() + 2 * 60 * 60 * 1000),
      endTime: new Date(upcomingBase.getTime() + 2 * 60 * 60 * 1000 + 30 * 60 * 1000),
      status: BookingStatus.CONFIRMED,
    },
    {
      eventTypeId: savedEventTypes.find((event) => event.slug === "60min")!.id,
      inviteeName: "Olivia Kim",
      inviteeEmail: "olivia.kim@example.com",
      startTime: new Date(upcomingBase.getTime() + 4 * 60 * 60 * 1000),
      endTime: new Date(upcomingBase.getTime() + 5 * 60 * 60 * 1000),
      status: BookingStatus.CONFIRMED,
    },
    {
      eventTypeId: savedEventTypes.find((event) => event.slug === "15min")!.id,
      inviteeName: "Liam Carter",
      inviteeEmail: "liam.carter@example.com",
      startTime: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
      status: BookingStatus.CANCELLED,
      cancelReason: "Client requested reschedule.",
    },
    {
      eventTypeId: savedEventTypes.find((event) => event.slug === "60min")!.id,
      inviteeName: "Emma Garcia",
      inviteeEmail: "emma.garcia@example.com",
      startTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      status: BookingStatus.CONFIRMED,
    },
  ];

  await prisma.booking.createMany({ data: bookingsData });

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
