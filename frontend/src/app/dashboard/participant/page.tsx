'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/client';
import { Reservation } from '@/types';
import { ReservationCard } from '@/components/reservations/ReservationCard';
import { Loader2, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import styles from './dashboard.module.css';

export default function ParticipantDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = useCallback(async () => {
    // Check if token exists before making the request
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      console.log('No token found, skipping reservation fetch');
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/reservations/my');
      const mappedReservations = response.data.map((res: Reservation & { _id?: string }) => ({
        ...res,
        id: res._id || res.id,
      }));
      setReservations(mappedReservations);
    } catch (error) {
      console.error('Failed to fetch reservations', error);
      // If 401, redirect to login
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          console.log('Unauthorized - redirecting to login');
          router.push('/login');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchReservations();
    }
  }, [user, authLoading, router, fetchReservations]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-500" size={32} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className="flex justify-between items-center mb-8">
        <h1 className={styles.title}>My Reservations</h1>
        <Button onClick={() => router.push('/events')}>Browse Events</Button>
      </div>

      {reservations.length === 0 ? (
        <div className={styles.empty}>
          <Ticket size={48} className="mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-medium mb-2">No reservations yet</h3>
          <p className="mb-6">You haven&apos;t booked any events yet.</p>
          <Button onClick={() => router.push('/events')} variant="outline">
            Browse Events
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {reservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onUpdate={fetchReservations}
            />
          ))}
        </div>
      )}
    </div>
  );
}
