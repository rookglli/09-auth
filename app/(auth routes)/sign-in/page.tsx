'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import { login } from '@/lib/api/clientApi';

import css from './page.module.css';

export default function SignInPage() {
  const router = useRouter();

  const [error, setError] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: login,

    onSuccess: () => {
      setError('');
      router.replace('/profile');
      router.refresh();
    },

    onError: (error: Error) => {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;

        setError(
          typeof message === 'string'
            ? message
            : 'Login failed. Please check your email and password.',
        );
      } else {
        setError('Something went wrong. Please try again.');
      }
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    mutate({
      email,
      password,
    });
  };

  return (
    <main className={css.mainContent}>
      <form className={css.form} onSubmit={handleSubmit}>
        <h1 className={css.formTitle}>Sign in</h1>

        <div className={css.formGroup}>
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            name="email"
            className={css.input}
            autoComplete="email"
            required
          />
        </div>

        <div className={css.formGroup}>
          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            name="password"
            className={css.input}
            autoComplete="current-password"
            required
          />
        </div>

        <div className={css.actions}>
          <button
            type="submit"
            className={css.submitButton}
            disabled={isPending}
          >
            {isPending ? 'Logging in...' : 'Log in'}
          </button>
        </div>

        {error && <p className={css.error}>{error}</p>}
      </form>
    </main>
  );
}
