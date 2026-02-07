'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/client';
import { UserRole } from '@/types';
import { Calendar, List } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ events: 0, reservations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== UserRole.ADMIN) {
        router.push('/login');
        return;
      }

      // Fetch stats
      const fetchData = async () => {
        // Check if token exists before making requests
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          console.log('No token found, redirecting to login');
          router.push('/login');
          setLoading(false);
          return;
        }

        try {
          const [eventsRes, reservationsRes] = await Promise.all([
            api.get('/events/admin/all'),
            api.get('/reservations'),
          ]);
          setStats({
            events: eventsRes.data.length,
            reservations: reservationsRes.data.length,
          });
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
          console.error('Failed to fetch admin stats', error);
          // If 401, redirect to login
          if (error.response?.status === 401) {
            console.log('Unauthorized - redirecting to login');
            localStorage.clear();
            router.push('/login');
          }
        } finally {
          setLoading(false);
        }
      };

      // Small delay to ensure token is available after login redirect
      setTimeout(() => {
        fetchData();
      }, 150);
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-500" size={32} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Dashboard</h1>

      <div className={styles.statsGrid}>
        <div className={styles.card}>
          <div className={styles.statValue}>{stats.events}</div>
          <div className={styles.statLabel}>Total Events</div>
        </div>
        <div className={styles.card}>
          <div className={styles.statValue}>{stats.reservations}</div>
          <div className={styles.statLabel}>Total Reservations</div>
        </div>
      </div>

      <div className={styles.navGrid}>
        <Link href="/dashboard/admin/events" className={styles.navCard}>
          <Calendar size={32} className={styles.navIcon} />
          <div className={styles.navTitle}>Manage Events</div>
          <div className={styles.navDesc}>Create, edit, publish, or cancel events</div>
        </Link>

        <Link href="/dashboard/admin/reservations" className={styles.navCard}>
          <List size={32} className={styles.navIcon} />
          <div className={styles.navTitle}>Manage Reservations</div>
          <div className={styles.navDesc}>View and manage all user reservations</div>
        </Link>
      </div>
    </div>
  );
}
