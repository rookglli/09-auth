import type { Metadata } from 'next';

import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from '@tanstack/react-query';

import { fetchNotes } from '@/lib/api';
import type { NoteTag } from '@/types/note';

import NotesClient from './Notes.client';

interface NotesPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

const BASE_URL = 'https://08-zustand-xi-ashen-68.vercel.app';

const OG_IMAGE = 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg';

// SEO-метаданные для страницы фильтрации заметок
export async function generateMetadata({
  params,
}: NotesPageProps): Promise<Metadata> {
  const { slug } = await params;

  const filter = slug[0] ?? 'all';

  const filterName =
    filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1);

  const title = `${filterName} Notes | NoteHub`;

  const description =
    filter === 'all'
      ? 'Browse and manage all your personal notes in NoteHub.'
      : `Browse and manage your ${filterName} notes in NoteHub.`;

  const url = `${BASE_URL}/notes/filter/${slug.join('/')}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${filterName} Notes - NoteHub`,
        },
      ],
    },
  };
}

// Серверный компонент страницы заметок
export default async function Notes({ params }: NotesPageProps) {
  const { slug } = await params;

  const tag = slug[0] === 'all' ? undefined : (slug[0] as NoteTag);

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['notes', 1, '', tag],
    queryFn: () =>
      fetchNotes({
        page: 1,
        perPage: 12,
        search: '',
        tag,
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient key={tag ?? 'all'} tag={tag} />
    </HydrationBoundary>
  );
}
