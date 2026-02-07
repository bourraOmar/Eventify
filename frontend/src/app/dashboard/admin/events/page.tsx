'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/client';
import { Event, EventStatus, UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { Plus, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useConfirm } from '@/contexts/ConfirmationDialogContext';
import styles from './events-admin.module.css';

export default function AdminEventsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  // const [loading, setLoading] = useState(true); // Removed unused state
  const { addToast } = useToast();
  const { openDialog } = useConfirm();

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events/admin/all');
      // Map _id to id if needed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedEvents = response.data.map((event: any) => ({
        ...event,
        id: event._id || event.id,
      }));
      setEvents(mappedEvents);
    } catch (error) {
      console.error('Failed to fetch events', error);
      addToast('error', 'Failed to fetch events', 'Error');
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
      fetchEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  const handlePublish = async (id: string) => {
    openDialog({
      title: 'Publish Event',
      description: 'Are you sure you want to publish this event? It will be visible to all users.',
      confirmText: 'Publish',
      onConfirm: async () => {
        try {
          await api.patch(`/events/${id}`, { status: EventStatus.PUBLISHED });
          addToast('success', 'Event published successfully', 'Published');
          fetchEvents();
        } catch (error) {
          console.error(error);
          addToast('error', 'Failed to publish event', 'Error');
        }
      },
    });
  };

  const handleCancel = async (id: string) => {
    openDialog({
      title: 'Cancel Event',
      description: 'Are you sure you want to cancel this event? Existing reservations might be affected.',
      confirmText: 'Cancel Event',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api.patch(`/events/${id}`, { status: EventStatus.CANCELED });
          addToast('success', 'Event canceled successfully', 'Canceled');
          fetchEvents();
        } catch (error) {
          console.error(error);
          addToast('error', 'Failed to cancel event', 'Error');
        }
      },
    });
  };

  const handleDelete = async (id: string) => {
    openDialog({
      title: 'Delete Event',
      description: 'Are you sure you want to delete this event? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/events/${id}`);
          addToast('success', 'Event deleted successfully', 'Deleted');
          fetchEvents();
        } catch {
          addToast('error', 'Failed to delete event', 'Error');
        }
      },
    });
  };

  const getStatusClass = (status: EventStatus) => {
    switch (status) {
      case EventStatus.PUBLISHED: return styles.statusPublished;
      case EventStatus.DRAFT: return styles.statusDraft;
      case EventStatus.CANCELED: return styles.statusCanceled;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manage Events</h1>
        <Link href="/dashboard/admin/events/new">
          <Button>
            <Plus size={16} className="mr-2" />
            New Event
          </Button>
        </Link>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Title</th>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Capacity</th>
              <th className={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td className={styles.td}>
                  <div className="font-bold">{event.title}</div>
                  <div className="text-sm text-slate-500">{event.location}</div>
                </td>
                <td className={styles.td}>
                  {new Date(event.date).toLocaleDateString()}
                </td>
                <td className={styles.td}>
                  <span className={`${styles.status} ${getStatusClass(event.status)}`}>
                    {event.status}
                  </span>
                </td>
                <td className={styles.td}>{event.capacity}</td>
                <td className={styles.td}>
                  <div className={styles.actions}>
                    {event.status === EventStatus.DRAFT && (
                      <Button size="sm" onClick={() => handlePublish(event.id)}>
                        <CheckCircle size={14} className="mr-2" />
                        Publish
                      </Button>
                    )}
                    {event.status !== EventStatus.CANCELED && (
                      <Button size="sm" variant="danger" onClick={() => handleCancel(event.id)}>
                        <XCircle size={14} className="mr-2" />
                        Cancel
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(event.id)}>
                      <Trash2 size={14} />
                    </Button>
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
