'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import { updateMe } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';

import type { User } from '@/types/user';

import css from './page.module.css';

interface EditProfileFormProps {
  user: User;
}

function EditProfileForm({ user }: EditProfileFormProps) {
  const router = useRouter();

  const setUser = useAuthStore((state) => state.setUser);

  const [username, setUsername] = useState(user.username);
  const [error, setError] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: updateMe,

    onSuccess: (updatedUser) => {
      setUser(updatedUser);

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
            : 'Failed to update profile. Please try again.',
        );
      } else {
        setError('Something went wrong. Please try again.');
      }
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError('Username cannot be empty.');
      return;
    }

    mutate({
      username: trimmedUsername,
    });
  };

  const handleCancel = () => {
    router.push('/profile');
  };

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <h1 className={css.formTitle}>Edit Profile</h1>

        {user.avatar && (
          <Image
            src={user.avatar}
            alt="User Avatar"
            width={120}
            height={120}
            className={css.avatar}
          />
        )}

        <form className={css.profileInfo} onSubmit={handleSubmit}>
          <div className={css.usernameWrapper}>
            <label htmlFor="username">Username:</label>

            <input
              id="username"
              type="text"
              name="username"
              className={css.input}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>

          <p>Email: {user.email}</p>

          <div className={css.actions}>
            <button
              type="submit"
              className={css.saveButton}
              disabled={isPending}
            >
              {isPending ? 'Saving...' : 'Save'}
            </button>

            <button
              type="button"
              className={css.cancelButton}
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </button>
          </div>

          {error && <p role="alert">{error}</p>}
        </form>
      </div>
    </main>
  );
}

export default function EditProfilePage() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <main className={css.mainContent}>
        <div className={css.profileCard}>
          <p>Loading profile...</p>
        </div>
      </main>
    );
  }

  return <EditProfileForm key={user.email} user={user} />;
}
