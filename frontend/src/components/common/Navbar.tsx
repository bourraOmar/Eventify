'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Calendar } from 'lucide-react';
import styles from './Navbar.module.css';
import { UserRole } from '@/types';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Calendar className={styles.logoIcon} />
          <span>Eventify</span>
        </Link>

        <div className={styles.navLinks}>
          <Link
            href="/events"
            className={`${styles.link} ${pathname === '/events' ? styles.linkActive : ''}`}
          >
            Browse Events
          </Link>

          {isAuthenticated && (
            <Link
              href={user?.role === UserRole.ADMIN ? '/dashboard/admin' : '/dashboard/participant'}
              className={`${styles.link} ${pathname.includes('/dashboard') ? styles.linkActive : ''}`}
            >
              Dashboard
            </Link>
          )}
        </div>

        <div className={styles.userMenu}>
          {isAuthenticated ? (
            <>
              <span className={styles.welcome}>
                Hi, {user?.name || user?.email?.split('@')[0] || 'User'}
              </span>
              <Button variant="outline" onClick={logout} className="ml-2">
                Logout
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
