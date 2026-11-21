import api from './api';

import type { Note, NoteTag } from '@/types/note';
import type { User } from '@/types/user';

// Типы для работы с заметками

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

export interface CreateNoteParams {
  title: string;
  content: string;
  tag: NoteTag;
}

// Типы для авторизации

interface AuthCredentials {
  email: string;
  password: string;
}

interface SessionResponse {
  success: boolean;
}

// Получение списка заметок

export const fetchNotes = async ({
  page,
  perPage,
  search,
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> => {
  const response = await api.get<FetchNotesResponse>('/notes', {
    params: {
      page,
      perPage,
      search,
      ...(tag && { tag }),
    },
  });

  return response.data;
};

// Получение заметки по ID

export const fetchNoteById = async (id: string): Promise<Note> => {
  const response = await api.get<Note>(`/notes/${id}`);

  return response.data;
};

// Создание заметки

export const createNote = async (noteData: CreateNoteParams): Promise<Note> => {
  const response = await api.post<Note>('/notes', noteData);

  return response.data;
};

// Удаление заметки

export const deleteNote = async (id: string): Promise<Note> => {
  const response = await api.delete<Note>(`/notes/${id}`);

  return response.data;
};

// Регистрация пользователя

export const register = async (credentials: AuthCredentials): Promise<User> => {
  const response = await api.post<User>('/auth/register', credentials);

  return response.data;
};

// Авторизация пользователя

export const login = async (credentials: AuthCredentials): Promise<User> => {
  const response = await api.post<User>('/auth/login', credentials);

  return response.data;
};

// Выход из аккаунта

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

// Проверка сессии

export const checkSession = async (): Promise<boolean> => {
  const response = await api.get<SessionResponse>('/auth/session');

  return response.data.success;
};

// Получение данных текущего пользователя

export const getMe = async (): Promise<User> => {
  const response = await api.get<User>('/users/me');

  return response.data;
};

// Обновление профиля пользователя

export const updateMe = async (data: Pick<User, 'username'>): Promise<User> => {
  const response = await api.patch<User>('/users/me', data);

  return response.data;
};
