'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, Download, XCircle } from 'lucide-react';
import { Reservation, ReservationStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api/client';
import { useToast } from '@/contexts/ToastContext';
import { useConfirm } from '@/contexts/ConfirmationDialogContext';
import styles from './ReservationCard.module.css';

interface ReservationCardProps {
  reservation: Reservation;
  onUpdate: () => void;
}

export const ReservationCard = ({ reservation, onUpdate }: ReservationCardProps) => {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const { openDialog } = useConfirm();

  const handleCancel = async () => {
    openDialog({
      title: 'Cancel Reservation',
      description: 'Are you sure you want to cancel this reservation?',
      confirmText: 'Cancel Reservation',
      variant: 'danger',
      onConfirm: async () => {
        setLoading(true);
        try {
          await api.delete(`/reservations/${reservation.id}/cancel`);
          addToast('success', 'Reservation canceled successfully', 'Success');
          onUpdate();
        } catch (error) {
          addToast('error', 'Failed to cancel reservation', 'Error');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleDownloadTicket = async () => {
    try {
      const response = await api.get(`/reservations/${reservation.id}/ticket`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket of ${reservation.event.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast('success', 'Ticket downloaded successfully', 'Download Complete');
    } catch (error) {
      addToast('error', 'Failed to download ticket. The event might not happen soon enough or ticket generation failed.', 'Download Failed');
    }
  };

  const getStatusClass = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.CONFIRMED: return styles.statusConfirmed;
      case ReservationStatus.PENDING: return styles.statusPending;
      case ReservationStatus.REFUSED: return styles.statusRefused;
      case ReservationStatus.CANCELED: return styles.statusCanceled;
      default: return '';
    }
  };

  if (!reservation.event) {
    return null;
  }

  const eventDate = new Date(reservation.event.date).toLocaleDateString();

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <Link href={`/events/${reservation.event.id}`} className={styles.eventTitle}>
            {reservation.event.title}
          </Link>
          <div className={styles.date}>
            <Calendar size={14} />
            <span>{eventDate}</span>
          </div>
        </div>
        <div className={`${styles.status} ${getStatusClass(reservation.status)}`}>
          {reservation.status}
        </div>
      </div>

      <div className={styles.actions}>
        {reservation.status === ReservationStatus.CONFIRMED && (
          <Button size="sm" onClick={handleDownloadTicket} disabled={loading} variant="secondary">
            <Download size={14} className="mr-2" />
            Ticket
          </Button>
        )}

        {(reservation.status === ReservationStatus.PENDING ||
          reservation.status === ReservationStatus.CONFIRMED) && (
            <Button
              size="sm"
              variant="danger"
              onClick={handleCancel}
              disabled={loading}
              isLoading={loading}
            >
              <XCircle size={14} className="mr-2" />
              Cancel
            </Button>
          )}
      </div>
    </div>
  );
};
