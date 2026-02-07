'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { UserRole } from '@/types';
import { useToast } from '@/contexts/ToastContext';
import styles from '../events-form.module.css';

export default function NewEventPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateTime: '',
    location: '',
    capacity: 100,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== UserRole.ADMIN) return;

    setLoading(true);
    setError('');

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        date: new Date(formData.dateTime).toISOString(),
        location: formData.location,
        capacity: Number(formData.capacity),
      };

      await api.post('/events', payload);
      addToast('success', 'Event created successfully', 'Event Created');
      router.push('/dashboard/admin/events');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create event');
      addToast('error', 'Failed to create event', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create New Event</h1>

      <div className={styles.card}>
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={styles.fullWidth}>
            <Input
              label="Event Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g. Annual Tech Conference"
            />
          </div>

          <div className={styles.fullWidth}>
            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe the event..."
            />
          </div>

          <Input
            label="Date & Time"
            name="dateTime"
            type="datetime-local"
            value={formData.dateTime}
            onChange={handleChange}
            required
          />

          <Input
            label="Capacity"
            name="capacity"
            type="number"
            min="1"
            value={formData.capacity}
            onChange={handleChange}
            required
          />

          <div className={styles.fullWidth}>
            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="e.g. Convention Center, Room A"
            />
          </div>

          <div className={`${styles.fullWidth} ${styles.actions}`}>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Create Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
