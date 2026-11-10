import { Link, useParams } from 'react-router-dom';
import Seo from '../components/ui/Seo';
import PostCard from '../components/forum/PostCard';
import Comments from '../components/forum/Comments';
import Skeleton from '../components/ui/Skeleton';
import { usePost } from '../hooks/usePosts';
import NotFound from './NotFound';

export default function PostDetail() {
  const { id } = useParams();
  const { data: post, isLoading, isError } = usePost(id);
  if (isError) return <NotFound />;
  return (
    <div className="wrap py-10 md:py-16">
      <div className="mx-auto max-w-[680px]">
        <Link to="/blog" className="mb-5 inline-block font-semibold underline">← Volver al blog</Link>
        {isLoading || !post ? <Skeleton className="h-80" /> : (
          <>
            <Seo title={`Publicación · ${post.body?.slice(0, 50) ?? 'Blog'}`} description={post.body?.slice(0, 150)} path={`/blog/${post.id}`} image={post.post_media[0]?.url} />
            <h1 className="sr-only">Entrada del blog</h1>
            <PostCard post={post} full />
            <Comments postId={post.id} comments={post.comments} allow={post.allow_comments !== false} />
          </>
        )}
      </div>
    </div>
  );
}
