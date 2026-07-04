import { format } from 'date-fns';
import prisma from '../config/database';
import { NotFoundError } from '../types';
import { sendEmailSafe } from './emailService';

async function getBookingEmailContext(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { select: { name: true } },
      client: { select: { name: true, email: true } },
      provider: {
        select: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  return booking;
}

function formatBookingTime(startTime: Date, endTime: Date): string {
  return `${format(startTime, 'PPP p')} – ${format(endTime, 'p')}`;
}

function emailLayout(title: string, body: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827;">
      <h2 style="color: #4f46e5;">Bookify</h2>
      <h3>${title}</h3>
      ${body}
      <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
        This is an automated message from Bookify.
      </p>
    </div>
  `;
}

export async function sendNewBookingEmailToProvider(bookingId: string): Promise<void> {
  const booking = await getBookingEmailContext(bookingId);

  sendEmailSafe({
    to: booking.provider.user.email,
    subject: `New booking request: ${booking.service.name}`,
    html: emailLayout(
      'New booking request',
      `
        <p>Hi ${booking.provider.user.name},</p>
        <p><strong>${booking.client.name}</strong> requested a booking:</p>
        <ul>
          <li><strong>Service:</strong> ${booking.service.name}</li>
          <li><strong>When:</strong> ${formatBookingTime(booking.startTime, booking.endTime)}</li>
          <li><strong>Status:</strong> ${booking.status}</li>
        </ul>
        <p>Log in to your provider dashboard to confirm or cancel this booking.</p>
      `,
    ),
  });
}

export async function sendBookingConfirmedEmailToClient(bookingId: string): Promise<void> {
  const booking = await getBookingEmailContext(bookingId);

  sendEmailSafe({
    to: booking.client.email,
    subject: `Booking confirmed: ${booking.service.name}`,
    html: emailLayout(
      'Your booking is confirmed',
      `
        <p>Hi ${booking.client.name},</p>
        <p>Your booking with <strong>${booking.provider.user.name}</strong> has been confirmed.</p>
        <ul>
          <li><strong>Service:</strong> ${booking.service.name}</li>
          <li><strong>When:</strong> ${formatBookingTime(booking.startTime, booking.endTime)}</li>
        </ul>
        <p>See you soon!</p>
      `,
    ),
  });
}

export function notifyProviderOfNewBooking(bookingId: string): void {
  sendNewBookingEmailToProvider(bookingId).catch((error) => {
    console.error('Failed to notify provider of new booking:', error);
  });
}

export function notifyClientOfBookingConfirmation(bookingId: string): void {
  sendBookingConfirmedEmailToClient(bookingId).catch((error) => {
    console.error('Failed to notify client of booking confirmation:', error);
  });
}
