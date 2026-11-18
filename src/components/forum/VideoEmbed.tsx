import { PlayCircle } from 'lucide-react';

type Embed = { kind: 'iframe'; src: string } | { kind: 'video'; src: string } | { kind: 'link'; src: string };

/** Convierte el enlace que pega el administrador en algo que se pueda reproducir en la página. */
export function toEmbed(raw: string): Embed {
  let u: URL;
  try { u = new URL(raw.trim()); } catch { return { kind: 'link', src: raw }; }
  const host = u.hostname.replace(/^www\.|^m\./, '');
  if (host === 'youtu.be') return { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}` };
  if (host.endsWith('youtube.com')) {
    const id = u.searchParams.get('v') ?? u.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]+)/)?.[1];
    if (id) return { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${id}` };
  }
  if (host === 'vimeo.com') {
    const id = u.pathname.match(/^\/(\d+)/)?.[1];
    if (id) return { kind: 'iframe', src: `https://player.vimeo.com/video/${id}` };
  }
  if (host === 'facebook.com' || host === 'fb.watch') return { kind: 'iframe', src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u.href)}&show_text=false` };
  if (host === 'drive.google.com') {
    const id = u.pathname.match(/\/file\/d\/([\w-]+)/)?.[1];
    if (id) return { kind: 'iframe', src: `https://drive.google.com/file/d/${id}/preview` };
  }
  if (/\.(mp4|webm|mov)$/i.test(u.pathname)) return { kind: 'video', src: u.href };
  return { kind: 'link', src: u.href };
}

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
