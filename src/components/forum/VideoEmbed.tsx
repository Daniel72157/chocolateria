import { PlayCircle } from 'lucide-react';
import { toEmbed } from '../../lib/video';

export default function VideoEmbed({ url, title }: { url: string; title: string }) {
  const e = toEmbed(url);
  if (e.kind === 'link') {
    return (
      <a href={e.src} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 bg-ink p-8 font-semibold text-papel hover:bg-bosque">
        <PlayCircle size={28} aria-hidden /> Ver el video
      </a>
    );
  }
  return (
    <div className="aspect-video w-full overflow-hidden bg-ink">
      {e.kind === 'video'
        ? <video src={e.src} controls preload="metadata" className="h-full w-full" title={title} />
        : <iframe src={e.src} title={title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="h-full w-full border-0" />}
    </div>
  );
}
