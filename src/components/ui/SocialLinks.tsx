import { Facebook, Instagram, Music2 } from 'lucide-react';

export type Socials = { instagram?: string | null; facebook?: string | null; tiktok?: string | null };

/** Enlaces a las redes de un local. `text` = enlaces subrayados (pie de página); `buttons` = botones con ícono. */
export default function SocialLinks({ instagram, facebook, tiktok, variant = 'text', label }: Socials & { variant?: 'text' | 'buttons'; label?: string }) {
  const links = [
    { name: 'Instagram', href: instagram, Icon: Instagram },
    { name: 'Facebook', href: facebook, Icon: Facebook },
    { name: 'TikTok', href: tiktok, Icon: Music2 },
  ].filter((l): l is { name: string; href: string; Icon: typeof Instagram } => !!l.href);
  if (!links.length) return null;
  const aria = (name: string) => (label ? `${name} de ${label}` : name);
  if (variant === 'buttons') {
    return <>{links.map(({ name, href, Icon }) => (
      <a key={name} className="btn btn-light" href={href} target="_blank" rel="noopener noreferrer" aria-label={aria(name)}><Icon size={20} aria-hidden /> {name}</a>
    ))}</>;
  }
  return (
    <p className="flex flex-wrap gap-x-4 gap-y-1 font-semibold">
      {links.map(({ name, href }) => <a key={name} className="underline" href={href} target="_blank" rel="noopener noreferrer" aria-label={aria(name)}>{name}</a>)}
    </p>
  );
}
