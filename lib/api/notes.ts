import type { Note, NoteTag } from '@/types/note';

import { api } from './client';

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

// Получение одной заметки
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
