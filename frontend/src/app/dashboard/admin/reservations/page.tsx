'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/client';
import { Reservation, ReservationStatus, UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { XCircle, CheckCircle } from 'lucide-react';
import styles from './reservations-admin.module.css';
import { useToast } from '@/contexts/ToastContext';

export default function AdminReservationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  // const [loading, setLoading] = useState(true); // unused
  const { addToast } = useToast();

  const fetchReservations = async () => {
    try {
      const response = await api.get('/reservations');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedReservations = response.data.map((res: any) => ({
        ...res,
        id: res._id || res.id,
      }));
      setReservations(mappedReservations);
    } catch (error) {
      console.error('Failed to fetch reservations', error);
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== UserRole.ADMIN) {
        router.push('/login');
        return;
      }
      fetchReservations();
    }
  }, [user, authLoading, router]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      // Assuming endpoint exists or abuse cancel endpoint for now
      // The backend has `PATCH /reservations/:id/status` but in controller?
      // `ReservationsController`: `@Patch(':id/status')`
      await api.patch(`/reservations/${id}/status`, { status });
      addToast('success', `Reservation marked as ${status.toLowerCase()}`, 'Status Updated');
      fetchReservations();
    } catch {
      addToast('error', 'Failed to update reservation status', 'Update Failed');
    }
  };

  const getStatusClass = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.CONFIRMED: return styles.statusPublished; // Green
      case ReservationStatus.PENDING: return styles.statusDraft; // Gray
      case ReservationStatus.CANCELED: return styles.statusCanceled; // Red
      case ReservationStatus.REFUSED: return styles.statusCanceled;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manage Reservations</h1>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Event</th>
              <th className={styles.th}>User</th>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((res) => (
              <tr key={res.id}>
                <td className={styles.td}>{res.event?.title || 'Unknown Event'}</td>
                <td className={styles.td}>{res.user?.email || 'Unknown User'}</td>
                <td className={styles.td}>
                  {new Date(res.createdAt).toLocaleDateString()}
                </td>
                <td className={styles.td}>
                  <span className={`${styles.status} ${getStatusClass(res.status)}`}>
                    {res.status}
                  </span>
                </td>
                <td className={styles.td}>
                  <div className={styles.actions}>
                    {res.status === ReservationStatus.PENDING && (
                      <>
                        <Button size="sm" onClick={() => handleUpdateStatus(res.id, ReservationStatus.CONFIRMED)}>
                          <CheckCircle size={14} className="mr-2" />
                          Confirm
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleUpdateStatus(res.id, ReservationStatus.REFUSED)}>
                          <XCircle size={14} className="mr-2" />
                          Refuse
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
