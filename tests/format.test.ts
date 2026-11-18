import { describe, expect, it } from 'vitest';
import { cop, mapEmbedUrl, mapLinkUrl, phonePretty, slugify, waUrl } from '../src/lib/format';

describe('slugify', () => {
  it('quita acentos, símbolos y mayúsculas', () => {
    expect(slugify('Café con Leche')).toBe('cafe-con-leche');
    expect(slugify('Ñandú 70%')).toBe('nandu-70');
  });
  it('no deja guiones al principio ni al final', () => {
    expect(slugify('  Chocolate Amargo!! ')).toBe('chocolate-amargo');
    expect(slugify('---x---')).toBe('x');
    expect(slugify('!!!a!!!b!!!')).toBe('a-b');
  });
  it('devuelve vacío si no queda ningún carácter válido', () => {
    expect(slugify('***')).toBe('');
    expect(slugify('')).toBe('');
    expect(slugify('-')).toBe('');
  });
});

describe('phonePretty', () => {
  it('separa un celular colombiano con indicativo', () => {
    expect(phonePretty('573132584586')).toBe('+57 313 258 4586');
  });
  it('deja otros formatos solo con el signo +', () => {
    expect(phonePretty('3132584586')).toBe('+3132584586');
    expect(phonePretty('+1 (555) 010-9999')).toBe('+15550109999');
  });
});

describe('enlaces', () => {
  it('waUrl limpia el número y codifica el texto', () => {
    expect(waUrl('+57 302 555 6304', 'Hola, ¿qué tal?')).toBe('https://wa.me/573025556304?text=Hola%2C%20%C2%BFqu%C3%A9%20tal%3F');
  });
  it('los enlaces de mapa codifican la dirección', () => {
    expect(mapEmbedUrl('Calle 60 #57-22')).toContain('q=Calle%2060%20%2357-22');
    expect(mapLinkUrl('Calle 60 #57-22')).toContain('query=Calle%2060%20%2357-22');
  });
});

describe('cop', () => {
  it('da formato de pesos colombianos sin decimales', () => {
    expect(cop(12500)).toMatch(/12\.500/);
    expect(cop(12500)).not.toMatch(/,/);
  });
});
