// Contenido editable de la página. Para agregar algo basta con añadir un elemento a la lista.

/** Historia corta de cada foto de "Nuestra tierra" (clave = nombre del archivo en /photos). */
export const STORIES: Record<string, { title: string; text: string }> = {
  tucan: { title: 'El tucán', text: 'PENDIENTE: escribe aquí la pequeña historia relacionada con esta foto.' },
  buho: { title: 'El búho', text: 'PENDIENTE: escribe aquí la pequeña historia relacionada con esta foto.' },
  armadillo: { title: 'El armadillo', text: 'PENDIENTE: escribe aquí la pequeña historia relacionada con esta foto.' },
  ardilla: { title: 'La ardilla', text: 'PENDIENTE: escribe aquí la pequeña historia relacionada con esta foto.' },
  urraca: { title: 'La urraca', text: 'PENDIENTE: escribe aquí la pequeña historia relacionada con esta foto.' },
  caballos: { title: 'Los caballos', text: 'PENDIENTE: escribe aquí la pequeña historia relacionada con esta foto.' },
  'casa-montana': { title: 'La casa', text: 'PENDIENTE: escribe aquí la pequeña historia relacionada con esta foto.' },
  iglesia: { title: 'La iglesia', text: 'PENDIENTE: escribe aquí la pequeña historia relacionada con esta foto.' },
};

export type Award = { title: string; issuer: string; year: string; image?: string; description?: string };
/** Sellos, reconocimientos y premios. `image` = ruta de la imagen del certificado, ej. '/awards/premio-1.webp'. */
export const AWARDS: Award[] = [
  // { title: 'Nombre del premio', issuer: 'Entidad que lo otorga', year: '2025', image: '/awards/premio-1.webp', description: 'Opcional' },
];

export type Interview = { title: string; outlet: string; date: string; url?: string; image?: string; summary?: string };
/** Entrevistas realizadas. `url` = enlace a la entrevista (video, nota o podcast). */
export const INTERVIEWS: Interview[] = [
  // { title: 'Título de la entrevista', outlet: 'Medio', date: '2025-05-10', url: 'https://…', image: '/interviews/entrevista-1.webp', summary: 'Resumen corto' },
];

export const PLANT = {
  phone: '313 258 4586', tel: '+573132584586',
  address: 'Calle 5C #53D-57, piso 3, barrio Gala, Bogotá',
  hours: ['Lunes a viernes: 8 am a 5 pm'],
};
