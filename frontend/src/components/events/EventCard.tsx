import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Event } from '@/types';
import styles from './EventCard.module.css';

interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  const eventDate = new Date(event.date).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link href={`/events/${event.id}`} style={{ textDecoration: 'none' }}>
      <Card className={styles.card}>
        <div className={styles.imagePlaceholder}>
          <Calendar size={48} opacity={0.5} />
        </div>

        <div className={styles.content}>
          <div className={styles.date}>
            <Calendar size={14} />
            <span>{eventDate}</span>
          </div>

          <h3 className={styles.title}>{event.title}</h3>

          <p className={styles.description}>{event.description}</p>

          <div className={styles.footer}>
            <div className={styles.location}>
              <MapPin size={14} />
              <span>{event.location}</span>
            </div>

            <div className={styles.seats}>
              <Users size={12} style={{ display: 'inline', marginRight: 4 }} />
              {event.capacity} seats
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
