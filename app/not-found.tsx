import type { Metadata } from 'next';

import css from './not-found.module.css';

export const metadata: Metadata = {
  title: '404 - Page not found | NoteHub',
  description: 'The requested page could not be found on NoteHub.',
  openGraph: {
    title: '404 - Page not found | NoteHub',
    description: 'The requested page could not be found on NoteHub.',
    url: 'https://08-zustand-xi-ashen-68.vercel.app/404',
    images: [
      {
        url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
        width: 1200,
        height: 630,
        alt: 'NoteHub - Page not found',
      },
    ],
  },
};

export default function NotFound() {
  return (
    <main>
      <h1 className={css.title}>404 - Page not found</h1>
      <p className={css.description}>
        Sorry, the page you are looking for does not exist.
      </p>
    </main>
  );
}
