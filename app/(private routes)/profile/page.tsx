import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import axios from 'axios';

import { getMe } from '@/lib/api/serverApi';

import css from './page.module.css';

export const metadata: Metadata = {
  title: 'Profile | NoteHub',
  description: 'View your personal NoteHub profile information.',
  openGraph: {
    title: 'Profile | NoteHub',
    description: 'View your personal NoteHub profile information.',
  },
};

export default async function ProfilePage() {
  let user;

  try {
    user = await getMe();
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 401 || error.response?.status === 403)
    ) {
      redirect('/sign-in');
    }

    throw error;
  }

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <div className={css.header}>
          <h1 className={css.formTitle}>Profile Page</h1>

          <Link href="/profile/edit" className={css.editProfileButton}>
            Edit Profile
          </Link>
        </div>

        <div className={css.avatarWrapper}>
          <Image
            src={user.avatar}
            alt="User Avatar"
            width={120}
            height={120}
            className={css.avatar}
          />
        </div>

        <div className={css.profileInfo}>
          <p>Username: {user.username}</p>

          <p>Email: {user.email}</p>
        </div>
      </div>
    </main>
  );
}
