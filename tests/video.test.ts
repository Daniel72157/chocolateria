import { describe, expect, it } from 'vitest';
import { toEmbed } from '../src/lib/video';

describe('toEmbed', () => {
  it('reconoce los enlaces de YouTube', () => {
    const esperado = { kind: 'iframe', src: 'https://www.youtube-nocookie.com/embed/abc123' };
    expect(toEmbed('https://www.youtube.com/watch?v=abc123')).toEqual(esperado);
    expect(toEmbed('https://m.youtube.com/watch?v=abc123&t=5s')).toEqual(esperado);
    expect(toEmbed('https://youtu.be/abc123')).toEqual(esperado);
    expect(toEmbed('https://www.youtube.com/shorts/abc123')).toEqual(esperado);
  });
  it('reconoce Vimeo, Facebook y Google Drive', () => {
    expect(toEmbed('https://vimeo.com/123456')).toEqual({ kind: 'iframe', src: 'https://player.vimeo.com/video/123456' });
    expect(toEmbed('https://www.facebook.com/zurych/videos/99')).toMatchObject({ kind: 'iframe' });
    expect(toEmbed('https://fb.watch/xyz')).toMatchObject({ kind: 'iframe' });
    expect(toEmbed('https://drive.google.com/file/d/AbC-1_2/view?usp=sharing')).toEqual({ kind: 'iframe', src: 'https://drive.google.com/file/d/AbC-1_2/preview' });
  });
  it('reproduce directamente los archivos de video', () => {
    expect(toEmbed('https://sitio.com/video.MP4')).toEqual({ kind: 'video', src: 'https://sitio.com/video.MP4' });
  });
  it('ofrece un enlace simple cuando no puede incrustar', () => {
    expect(toEmbed('https://youtube.com/@canal')).toMatchObject({ kind: 'link' });
    expect(toEmbed('https://vimeo.com/canal')).toMatchObject({ kind: 'link' });
    expect(toEmbed('https://drive.google.com/drive/folders/1')).toMatchObject({ kind: 'link' });
    expect(toEmbed('https://otro.com/pagina')).toEqual({ kind: 'link', src: 'https://otro.com/pagina' });
    expect(toEmbed('esto no es un enlace')).toEqual({ kind: 'link', src: 'esto no es un enlace' });
  });
});
