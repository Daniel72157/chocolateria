import { Cookie, Heart, ThumbsUp } from 'lucide-react';
import { useReact } from '../../hooks/usePosts';
import type { Post, ReactionType } from '../../../shared/types';

const R: { type: ReactionType; label: string; Icon: typeof Heart }[] = [
  { type: 'me_gusta', label: 'Me gusta', Icon: ThumbsUp },
  { type: 'me_encanta', label: 'Me encanta', Icon: Heart },
  { type: 'delicioso', label: 'Delicioso', Icon: Cookie },
];

export default function Reactions({ post }: { post: Pick<Post, 'id' | 'reactionCounts' | 'myReaction'> }) {
  const react = useReact(post.id);
  const total = Object.values(post.reactionCounts).reduce((a, b) => a + (b ?? 0), 0);
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Reacciones">
      {R.map(({ type, label, Icon }) => {
        const mine = post.myReaction === type;
        return (
          <button key={type} type="button" aria-pressed={mine} onClick={() => react.mutate(mine ? null : type)}
            className={`flex min-h-[44px] items-center gap-2 rounded-full px-4 font-semibold transition active:scale-95 ${mine ? 'bg-bosque text-papel' : 'bg-crema hover:bg-arena'}`}>
            <Icon size={18} aria-hidden fill={mine ? 'currentColor' : 'none'} /> {label}
            <span className="num text-base">{post.reactionCounts[type] ?? 0}</span>
          </button>
        );
      })}
      <span className="num ml-1 text-base text-tierra">{total} en total</span>
    </div>
  );
}
