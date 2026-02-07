import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, ArrowLeft } from 'lucide-react';
import { Event } from '@/types';
import { BookingCard } from '@/components/events/BookingCard';
import styles from './EventDetails.module.css';

async function getEvent(id: string): Promise<Event | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/events/${id}`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const data = await res.json();
    return {
      ...data,
      id: data._id || data.id,
    };
  } catch (error) {
    return null;
  }
}

async function getRemainingSeats(id: string): Promise<number> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/events/${id}/seats`, {
      cache: 'no-store',
    });

    if (!res.ok) return 0;
    return res.json();
  } catch (error) {
    return 0;
  }
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  const remainingSeats = await getRemainingSeats(id);

  const eventDate = new Date(event.date).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });

  return (
    <div className={styles.container}>
      <Link href="/events" className={styles.backLink}>
        <ArrowLeft size={16} />
        Back to Events
      </Link>

      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>{event.title}</h1>
          <div className={styles.heroMeta}>
            <div className={styles.metaItem}>
              <Calendar size={20} />
              <span>{eventDate}</span>
            </div>
            <div className={styles.metaItem}>
              <MapPin size={20} />
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        <div>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>About this Event</h2>
            <div className={styles.description}>
              {event.description}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Location</h2>
            <p className="text-slate-400 mb-4">{event.location}</p>
            {/* Map placeholder or integration could go here */}
            <div className="w-full h-48 bg-slate-800 rounded-lg flex items-center justify-center text-slate-600">
              Map View Unavailable
            </div>
          </div>
        </div>

        <div>
          <BookingCard event={event} remainingSeats={remainingSeats} />
        </div>
      </div>
    </div>
  );
}
