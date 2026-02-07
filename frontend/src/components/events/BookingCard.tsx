'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Event } from '@/types';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api/client';
import { useToast } from '@/contexts/ToastContext';
import styles from './BookingCard.module.css';

interface BookingCardProps {
  event: Event;
  remainingSeats: number;
}

export const BookingCard = ({ event, remainingSeats }: BookingCardProps) => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated && user) {
      setChecking(true);
      api.get('/reservations/my')
        .then((res) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const found = res.data.find((r: any) =>
            (r.event && (r.event._id === event.id || r.event.id === event.id)) ||
            r.event === event.id
          );

          if (found && (found.status === 'pending' || found.status === 'confirmed')) {
            setExistingStatus(found.status);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setChecking(false));
    }
  }, [isAuthenticated, user, event.id]);

  const handleReserve = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/reservations', { eventId: event.id });
      setSuccess(true);
      addToast('success', 'Reservation request sent successfully', 'Reservation Pending');
      router.refresh();
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (err.response?.status === 401) {
        addToast('error', 'Please login to reserve a spot', 'Unauthorized');
        router.push('/login');
        return;
      }
      const msg = err.response?.data?.message || 'Failed to reserve event';
      setError(msg);
      addToast('error', msg, 'Reservation Failed');
    } finally {
      setLoading(false);
    }
  };

  const isFull = remainingSeats <= 0;

  if (success) {
    return (
      <div className={styles.card}>
        <div className={styles.success}>
          <p className="font-bold mb-2">Reservation Request Sent!</p>
          <p className="text-sm">Your reservation is pending confirmation.</p>
        </div>
        <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard/participant')}>
          View My Reservations
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.price}>Free</div>
      <div className={styles.label}>per person</div>

      <div className={styles.separator} />

      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>Status</span>
        <span className={styles.infoValue}>
          {isFull ? 'Sold Out' : 'Available'}
        </span>
      </div>

      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>Remaining Seats</span>
        <span className={styles.infoValue}>{remainingSeats}</span>
      </div>

      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>Total Capacity</span>
        <span className={styles.infoValue}>{event.capacity}</span>
      </div>

      <div className={styles.separator} />

      {error && <div className={styles.error}>{error}</div>}

      <Button
        className="w-full"
        onClick={handleReserve}
        disabled={isFull || loading || checking || !!existingStatus}
        isLoading={loading || checking}
        variant={isFull || !!existingStatus ? 'secondary' : 'primary'}
      >
        {existingStatus ? `Reservation ${existingStatus.charAt(0).toUpperCase() + existingStatus.slice(1)}` :
          isFull ? 'Sold Out' :
            isAuthenticated ? 'Reserve Spot' : 'Login to Reserve'}
      </Button>

      <p className={styles.message}>
        You won&apos;t be charged yet.
      </p>
    </div>
  );
};
