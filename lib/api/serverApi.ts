import 'server-only';

import { cookies } from 'next/headers';
import type { AxiosResponse } from 'axios';

import api from './api';

import type { Note, NoteTag } from '@/types/note';
import type { User } from '@/types/user';

// Типы для получения заметок

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

// Тип ответа при проверке сессии

export interface SessionResponse {
  success: boolean;
}

// Получение списка заметок на сервере

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

// Получение заметки по ID

export const fetchNoteById = async (id: string): Promise<Note> => {
  const cookieStore = await cookies();

  const response = await api.get<Note>(`/notes/${id}`, {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  return response.data;
};

// Получение данных пользователя

export const getMe = async (): Promise<User> => {
  const cookieStore = await cookies();

  const response = await api.get<User>('/users/me', {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  return response.data;
};

// Проверка действующей сессии

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