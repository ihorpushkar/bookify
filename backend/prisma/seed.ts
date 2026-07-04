import { BookingStatus, PrismaClient, Role } from '@prisma/client';
import { DEFAULT_WORKING_HOURS } from '../src/constants/workingHours';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

const userSelect = { id: true, email: true, name: true, role: true } as const;

function daysFromNow(days: number, hour: number, minute = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function main() {
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: 'admin@bookify.test',
      password: await hashPassword('admin123'),
      name: 'Admin User',
      role: Role.ADMIN,
    },
    select: userSelect,
  });

  const provider1User = await prisma.user.create({
    data: {
      email: 'barber@bookify.test',
      password: await hashPassword('provider123'),
      name: 'Alex Barber',
      role: Role.PROVIDER,
      providerProfile: {
        create: {
          bio: 'Professional barber with 10 years of experience.',
          workingHours: DEFAULT_WORKING_HOURS,
        },
      },
    },
    select: userSelect,
  });

  const provider2User = await prisma.user.create({
    data: {
      email: 'tutor@bookify.test',
      password: await hashPassword('provider123'),
      name: 'Maria Tutor',
      role: Role.PROVIDER,
      providerProfile: {
        create: {
          bio: 'English and math tutoring for students.',
          workingHours: DEFAULT_WORKING_HOURS,
        },
      },
    },
    select: userSelect,
  });

  const provider1 = await prisma.providerProfile.findUniqueOrThrow({
    where: { userId: provider1User.id },
  });

  const provider2 = await prisma.providerProfile.findUniqueOrThrow({
    where: { userId: provider2User.id },
  });

  const client1 = await prisma.user.create({
    data: {
      email: 'client1@bookify.test',
      password: await hashPassword('client123'),
      name: 'John Client',
      role: Role.CLIENT,
    },
    select: userSelect,
  });

  const client2 = await prisma.user.create({
    data: {
      email: 'client2@bookify.test',
      password: await hashPassword('client123'),
      name: 'Jane Client',
      role: Role.CLIENT,
    },
    select: userSelect,
  });

  const services = await Promise.all([
    prisma.service.create({
      data: {
        providerId: provider1.id,
        name: 'Haircut',
        description: 'Classic haircut',
        durationMin: 30,
        price: 25,
      },
    }),
    prisma.service.create({
      data: {
        providerId: provider1.id,
        name: 'Beard Trim',
        description: 'Beard shaping and trim',
        durationMin: 20,
        price: 15,
      },
    }),
    prisma.service.create({
      data: {
        providerId: provider1.id,
        name: 'Haircut + Beard',
        description: 'Full grooming package',
        durationMin: 45,
        price: 35,
      },
    }),
    prisma.service.create({
      data: {
        providerId: provider2.id,
        name: 'Math Tutoring',
        description: '60-minute math session',
        durationMin: 60,
        price: 40,
      },
    }),
    prisma.service.create({
      data: {
        providerId: provider2.id,
        name: 'English Tutoring',
        description: '60-minute English session',
        durationMin: 60,
        price: 40,
      },
    }),
  ]);

  const [haircut, beardTrim, , mathTutoring, englishTutoring] = services;

  const bookingData = [
    {
      clientId: client1.id,
      serviceId: haircut.id,
      providerId: provider1.id,
      startTime: daysFromNow(1, 10),
      endTime: daysFromNow(1, 10, 30),
      status: BookingStatus.PENDING,
    },
    {
      clientId: client2.id,
      serviceId: haircut.id,
      providerId: provider1.id,
      startTime: daysFromNow(1, 11),
      endTime: daysFromNow(1, 11, 30),
      status: BookingStatus.CONFIRMED,
    },
    {
      clientId: client1.id,
      serviceId: beardTrim.id,
      providerId: provider1.id,
      startTime: daysFromNow(2, 14),
      endTime: daysFromNow(2, 14, 20),
      status: BookingStatus.CONFIRMED,
    },
    {
      clientId: client2.id,
      serviceId: mathTutoring.id,
      providerId: provider2.id,
      startTime: daysFromNow(1, 15),
      endTime: daysFromNow(1, 16),
      status: BookingStatus.PENDING,
    },
    {
      clientId: client1.id,
      serviceId: englishTutoring.id,
      providerId: provider2.id,
      startTime: daysFromNow(3, 10),
      endTime: daysFromNow(3, 11),
      status: BookingStatus.CONFIRMED,
    },
    {
      clientId: client2.id,
      serviceId: mathTutoring.id,
      providerId: provider2.id,
      startTime: daysFromNow(-2, 12),
      endTime: daysFromNow(-2, 13),
      status: BookingStatus.COMPLETED,
    },
    {
      clientId: client1.id,
      serviceId: haircut.id,
      providerId: provider1.id,
      startTime: daysFromNow(-5, 9),
      endTime: daysFromNow(-5, 9, 30),
      status: BookingStatus.COMPLETED,
    },
    {
      clientId: client2.id,
      serviceId: beardTrim.id,
      providerId: provider1.id,
      startTime: daysFromNow(4, 16),
      endTime: daysFromNow(4, 16, 20),
      status: BookingStatus.CANCELLED,
    },
    {
      clientId: client1.id,
      serviceId: mathTutoring.id,
      providerId: provider2.id,
      startTime: daysFromNow(5, 13),
      endTime: daysFromNow(5, 14),
      status: BookingStatus.PENDING,
    },
    {
      clientId: client2.id,
      serviceId: englishTutoring.id,
      providerId: provider2.id,
      startTime: daysFromNow(-1, 17),
      endTime: daysFromNow(-1, 18),
      status: BookingStatus.CANCELLED,
    },
  ];

  await prisma.booking.createMany({ data: bookingData });

  console.log('Seed complete:');
  console.log(`  Admin:    ${admin.email} / admin123`);
  console.log(`  Provider: ${provider1User.email} / provider123`);
  console.log(`  Provider: ${provider2User.email} / provider123`);
  console.log(`  Client:   ${client1.email} / client123`);
  console.log(`  Client:   ${client2.email} / client123`);
  console.log(`  Services: ${services.length}, Bookings: ${bookingData.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
