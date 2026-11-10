import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { getVisitorId } from '../lib/visitor';
import type { Post, PostDetail, PostFeed, ReactionType } from '../../shared/types';

export const usePostFeed = () =>
  useInfiniteQuery({
    queryKey: ['posts'],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => {
      const p = new URLSearchParams({ visitorId: getVisitorId() });
      if (pageParam) p.set('cursor', pageParam);
      return api<PostFeed>(`/posts?${p}`);
    },
    getNextPageParam: (last) => last.nextCursor,
  });

export const useLatestPosts = (n = 3) =>
  useQuery({ queryKey: ['posts-latest', n], queryFn: async () => (await api<PostFeed>(`/posts?visitorId=${getVisitorId()}`)).items.slice(0, n) });

export const usePost = (id?: string) =>
  useQuery({ queryKey: ['post', id], queryFn: () => api<PostDetail>(`/posts/${id}?visitorId=${getVisitorId()}`), enabled: !!id, retry: false });

const bump = (p: Post, next: ReactionType | null): Post => {
  const counts = { ...p.reactionCounts };
  if (p.myReaction) counts[p.myReaction] = Math.max(0, (counts[p.myReaction] ?? 1) - 1);
  if (next) counts[next] = (counts[next] ?? 0) + 1;
  return { ...p, reactionCounts: counts, myReaction: next };
};

/** Reacción con actualización optimista: tocar la reacción propia la quita. */
export function useReact(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (next: ReactionType | null) => {
      const visitorId = getVisitorId();
      if (next) await api(`/posts/${postId}/reactions`, { method: 'POST', body: JSON.stringify({ visitorId, type: next }) });
      else await api(`/posts/${postId}/reactions`, { method: 'DELETE', body: JSON.stringify({ visitorId }) });
    },
    onMutate: async (next) => {
      await qc.cancelQueries({ queryKey: ['posts'] });
      const snap = qc.getQueriesData({ queryKey: ['posts'] });
      qc.setQueriesData<{ pages: PostFeed[]; pageParams: unknown[] }>({ queryKey: ['posts'], exact: true }, (old) =>
        old && { ...old, pages: old.pages.map((pg) => ({ ...pg, items: pg.items.map((p) => (p.id === postId ? bump(p, next) : p)) })) });
      qc.setQueriesData<PostDetail>({ queryKey: ['post', postId] }, (old) => old && { ...old, ...bump(old, next) });
      qc.setQueriesData<Post[]>({ queryKey: ['posts-latest'] }, (old) => old?.map((p) => (p.id === postId ? bump(p, next) : p)));
      return { snap };
    },
    onError: (_e, _n, ctx) => ctx?.snap.forEach(([key, data]) => qc.setQueryData(key, data)),
  });
}
