'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createNote } from '@/lib/api';
import { useNoteStore } from '@/lib/store/noteStore';

import type { NoteTag } from '@/types/note';
import type { CreateNoteParams } from '@/lib/api';

import css from './NoteForm.module.css';

export default function NoteForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const draft = useNoteStore((state) => state.draft);
  const setDraft = useNoteStore((state) => state.setDraft);
  const clearDraft = useNoteStore((state) => state.clearDraft);

  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createNote,

    onSuccess: async () => {
      clearDraft();

      await queryClient.invalidateQueries({
        queryKey: ['notes'],
      });

      router.push('/notes/filter/all');
    },
  });

  const formAction = async (formData: FormData) => {
    setError(null);

    const title = String(formData.get('title') ?? '').trim();
    const content = String(formData.get('content') ?? '').trim();
    const tag = String(formData.get('tag') ?? 'Todo') as NoteTag;

    if (title.length < 3 || title.length > 50) {
      setError('Title must be between 3 and 50 characters');
      return;
    }

    if (content.length > 500) {
      setError('Content must be at most 500 characters');
      return;
    }

    const noteData: CreateNoteParams = {
      title,
      content,
      tag,
    };

    try {
      await createMutation.mutateAsync(noteData);
    } catch {
      setError('Failed to create note. Please try again.');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <form action={formAction} className={css.form}>
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>

        <input
          id="title"
          type="text"
          name="title"
          className={css.input}
          defaultValue={draft.title}
          minLength={3}
          maxLength={50}
          required
          onChange={(event) => setDraft({ title: event.target.value })}
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>

        <textarea
          id="content"
          name="content"
          rows={8}
          className={css.textarea}
          defaultValue={draft.content}
          maxLength={500}
          onChange={(event) => setDraft({ content: event.target.value })}
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>

        <select
          id="tag"
          name="tag"
          className={css.select}
          defaultValue={draft.tag}
          onChange={(event) => setDraft({ tag: event.target.value as NoteTag })}
        >
          <option value="Todo">Todo</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Shopping">Shopping</option>
        </select>
      </div>

      {error && (
        <p role="alert" className={css.error}>
          {error}
        </p>
      )}

      <div className={css.actions}>
        <button
          type="button"
          className={css.cancelButton}
          onClick={handleCancel}
          disabled={createMutation.isPending}
        >
          Cancel
        </button>

        <button
          type="submit"
          className={css.submitButton}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Creating...' : 'Create note'}
        </button>
      </div>
    </form>
  );
}
