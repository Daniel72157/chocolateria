import { Helmet } from 'react-helmet-async';

const site = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export default function Seo({ title, description, image, path, jsonLd, noindex }: {
  title: string; description?: string; image?: string; path?: string; jsonLd?: object; noindex?: boolean;
}) {
  const url = path ? `${site}${path}` : undefined;
  const img = image ? (image.startsWith('http') ? image : `${site}${image}`) : `${site}/og-image.jpg`;
  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {noindex && <meta name="robots" content="noindex" />}
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={img} />
      {url && <meta property="og:url" content={url} />}
      {url && <link rel="canonical" href={url} />}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
