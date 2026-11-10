import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../../lib/api';
import { ago } from '../../lib/format';
import { commentInput } from '../../../shared/schemas';
import { Input, Textarea } from '../ui/Field';
import { toast } from '../../store/toast';
import type { z } from 'zod';
import type { PostComment } from '../../../shared/types';

type Form = z.infer<typeof commentInput>;

export default function Comments({ postId, comments, allow = true }: { postId: string; comments: PostComment[]; allow?: boolean }) {
  const qc = useQueryClient();
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(commentInput),
    defaultValues: { authorName: localStorage.getItem('comment_name') ?? '', body: '', website: '' },
  });
  const onSubmit = async (f: Form) => {
    try {
      await api(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(f) });
      localStorage.setItem('comment_name', f.authorName);
      reset({ authorName: f.authorName, body: '', website: '' });
      setSent(true);
      qc.invalidateQueries({ queryKey: ['post', postId] });
    } catch (e) { toast.error(e instanceof ApiError ? e.message : 'No se pudo enviar el comentario'); }
  };
  return (
    <section aria-labelledby="coms" className="mt-8">
      <h2 id="coms" className="t-h3 font-display text-3xl">Comentarios</h2>
      {comments.length === 0 && <p className="mt-3">Todavía no hay comentarios. ¡Sé la primera persona en escribir!</p>}
      <ul className="mt-4 grid gap-3">
        {comments.map((c) => (
          <li key={c.id} className="bg-papel p-4">
            <p className="flex flex-wrap items-baseline justify-between gap-2"><strong>{c.author_name}</strong><time className="t-small text-tierra" dateTime={c.created_at}>{ago(c.created_at)}</time></p>
            <p className="mt-1 whitespace-pre-line">{c.body}</p>
          </li>
        ))}
      </ul>

      {allow ? (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 grid gap-4 bg-papel p-5">
          <h3 className="font-sans text-lg font-extrabold tracking-normal">Deja tu comentario</h3>
          <Input label="Tu nombre" autoComplete="given-name" error={errors.authorName?.message} {...register('authorName')} />
          <Textarea label="Tu comentario" error={errors.body?.message} {...register('body')} />
          <div className="sr-only-field" aria-hidden><label>No llenar<input tabIndex={-1} autoComplete="off" {...register('website')} /></label></div>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary justify-self-start">{isSubmitting ? 'Enviando…' : 'Enviar comentario'}</button>
          <p role="status" aria-live="polite" className={sent ? 'font-semibold' : 'sr-only'}>{sent && 'Gracias, tu comentario se publicará cuando lo revisemos.'}</p>
        </form>
      ) : <p className="mt-6 bg-papel p-4">Esta publicación no admite comentarios.</p>}
    </section>
  );
}
