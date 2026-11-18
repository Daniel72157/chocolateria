// Fotos de "Nuestra tierra" con su historia. Sirven de datos de ejemplo (modo demo) y de punto de partida
// para la tabla land_tiles de Supabase (ver el final de supabase/schema.sql). En producción se editan desde el panel.
import type { LandTile } from './types.js';

type Seed = Pick<LandTile, 'name' | 'tag' | 'title' | 'story' | 'width' | 'height'> & { img: string };

export const LAND_SEED: Seed[] = [
  { img: 'tucan', name: 'Tucán', tag: 'Aves', width: 720, height: 1440, title: 'El tucán, sembrador del bosque',
    story: 'Su gran pico colorido no es solo adorno: le sirve para alcanzar frutos en las ramas más delgadas, donde su cuerpo no llegaría.\nAl comer frutos y desplazarse de árbol en árbol, el tucán va dejando semillas por el camino y ayuda a que el bosque se renueve. Verlo cerca de los cultivos es señal de un territorio vivo y bien cuidado.\nPor eso cultivamos el cacao de forma orgánica y agroecológica: para que aves como él sigan siendo parte del paisaje.' },
  { img: 'buho', name: 'Búho', tag: 'Aves', width: 1200, height: 1600, title: 'El búho, guardián de la noche',
    story: 'Mientras el campo descansa, el búho trabaja. Con su vuelo silencioso y su vista de noche, vigila los cultivos y se alimenta de roedores que, de otro modo, dañarían las mazorcas de cacao.\nEs un aliado del agricultor: cuida la cosecha sin necesidad de venenos.\nEsa es la idea detrás de la agroecología: dejar que la naturaleza haga parte del trabajo.' },
  { img: 'armadillo', name: 'Armadillo', tag: 'Fauna', width: 709, height: 945, title: 'El armadillo, arquitecto del suelo',
    story: 'Discreto y de hábitos nocturnos, el armadillo recorre el monte buscando insectos y larvas. Al escarbar, remueve y airea la tierra, y esos huecos terminan sirviendo de refugio a otros animales.\nUn suelo vivo y suelto es la base de un buen cacao. Cuando el armadillo aparece, el terreno está sano.\nCuidar su hogar es cuidar la tierra de donde sale nuestro chocolate.' },
  { img: 'ardilla', name: 'Ardilla', tag: 'Fauna', width: 880, height: 1186, title: 'La ardilla, vecina de las ramas',
    story: 'Ágil y curiosa, la ardilla se mueve por las copas de los árboles de la finca desde la mañana temprano. Entierra y olvida semillas, y así, sin proponérselo, siembra árboles nuevos.\nConvivir con la fauna silvestre es parte de nuestra forma de producir: el cacao crece a la sombra de otros árboles y comparte el espacio con quienes ya vivían allí.' },
  { img: 'urraca', name: 'Urraca', tag: 'Aves', width: 960, height: 1280, title: 'La urraca, la voz del monte',
    story: 'Inteligente y sociable, la urraca vive en grupos y es de las primeras en anunciar el día con su canto. Su presencia delata un bosque con buena comida y refugio.\nComo ella, los agricultores de Santander trabajan en comunidad: se ayudan, se avisan y comparten la cosecha. Esa unión es la que queremos reconocer con cada barra de chocolate.' },
  { img: 'caballos', name: 'Caballos', tag: 'Paisaje', width: 1193, height: 896, title: 'Los caballos, compañeros de trabajo',
    story: 'En las montañas de Santander hay caminos por donde los vehículos no llegan, y allí el caballo sigue siendo un compañero de trabajo: baja la cosecha, sube los insumos y acompaña a la familia campesina.\nCada grano de cacao que llega a nuestra planta empieza su viaje en un recorrido como este, entre potreros y senderos de monte.' },
  { img: 'casa-montana', name: 'La casa', tag: 'Paisaje', width: 1156, height: 671, title: 'La casa, donde empieza todo',
    story: 'Casas como esta, entre cultivos y montaña, son el punto de partida de nuestra historia. En Landázuri, Santander, tierra de tradición cacaotera y de nuestro fundador, las familias han vivido del cacao por generaciones.\nDe allí viene la idea de ZURYCH: comprar directamente a los productores, reducir intermediarios y pagar de forma más justa por su trabajo.' },
  { img: 'iglesia', name: 'La iglesia', tag: 'Paisaje', width: 1600, height: 1056, title: 'La iglesia, el centro del pueblo',
    story: 'En los pueblos cacaoteros, la iglesia y la plaza son el lugar de encuentro: allí se reúnen las familias, se cierran los tratos y se celebran las fiestas de la comunidad.\nCuando hablamos de comercio justo hablamos de esto: de relaciones cercanas, de conocer a quien cultiva y de que el trabajo del campo tenga el reconocimiento que merece.' },
];

/** Forma de datos de ejemplo (modo demo). */
export const landTiles: LandTile[] = LAND_SEED.map((t, i) => ({
  id: `00000000-0000-4000-8000-00000000010${i}`, name: t.name, tag: t.tag, title: t.title, story: t.story,
  image_url: `/photos/${t.img}.webp`, width: t.width, height: t.height, sort_order: i,
}));
