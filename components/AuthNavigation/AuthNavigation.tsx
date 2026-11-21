'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { logout } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';

import css from './AuthNavigation.module.css';

export default function AuthNavigation() {
  const router = useRouter();

  const [error, setError] = useState('');

  const user = useAuthStore((state) => state.user);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const clearIsAuthenticated = useAuthStore(
    (state) => state.clearIsAuthenticated,
  );

  const { mutate: handleLogout, isPending } = useMutation({
    mutationFn: logout,

    onSuccess: () => {
      clearIsAuthenticated();

      setError('');

      router.replace('/sign-in');
      router.refresh();
    },

    onError: () => {
      setError('Logout failed. Please try again.');
    },
  });

  if (!isAuthenticated) {
    return (
      <>
        <li className={css.navigationItem}>
          <Link href="/sign-in" prefetch={false} className={css.navigationLink}>
            Login
          </Link>
        </li>

        <li className={css.navigationItem}>
          <Link href="/sign-up" prefetch={false} className={css.navigationLink}>
            Register
          </Link>
        </li>
      </>
    );
  }

  return (
    <>
      <li className={css.navigationItem}>
        <Link href="/profile" prefetch={false} className={css.navigationLink}>
          Profile
        </Link>
      </li>

      <li className={css.navigationItem}>
        <p className={css.userEmail}>{user?.email}</p>

        <button
          type="button"
          className={css.logoutButton}
          onClick={() => handleLogout()}
          disabled={isPending}
        >
          {isPending ? 'Logging out...' : 'Logout'}
        </button>

        {error && <p role="alert">{error}</p>}
      </li>
    </>
  );
}
