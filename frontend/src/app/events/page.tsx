import React from 'react';
import { Event } from '@/types';
import { EventCard } from '@/components/events/EventCard';
import { Calendar } from 'lucide-react';
import styles from './events.module.css';

async function getEvents(): Promise<Event[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/events`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch events');
    }

    const data = await res.json();
    return data.map((event: any) => ({
      ...event,
      id: event._id || event.id,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            Upcoming Events
          </h1>
          <p className={styles.subtitle}>
            Discover and book unique experiences.
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className={styles.emptyState}>
          <Calendar size={64} className={styles.emptyIcon} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '0.5rem' }}>No events found</h3>
          <p>Check back later for new events.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
