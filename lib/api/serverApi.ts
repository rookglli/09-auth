import 'server-only';

import { cookies } from 'next/headers';
import type { AxiosResponse } from 'axios';

import api from './api';

import type { Note, NoteTag } from '@/types/note';
import type { User } from '@/types/user';

export interface FetchNotesParams {
  page: number;
  perPage: number;
  search?: string;
  tag?: NoteTag;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface SessionResponse {
  success: boolean;
}

export const fetchNotes = async ({
  page,
  perPage,
  search,
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> => {
  const cookieStore = await cookies();

  const response = await api.get<FetchNotesResponse>('/notes', {
    params: {
      page,
      perPage,
      search,
      ...(tag && { tag }),
    },
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  return response.data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const cookieStore = await cookies();

  const response = await api.get<Note>(`/notes/${id}`, {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  return response.data;
};

export const getMe = async (): Promise<User> => {
  const cookieStore = await cookies();

  const response = await api.get<User>('/users/me', {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  return response.data;
};

export const checkSession = async (): Promise<
  AxiosResponse<SessionResponse>
> => {
  const cookieStore = await cookies();

  const response = await api.get<SessionResponse>('/auth/session', {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  return response;
};
