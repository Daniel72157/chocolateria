-- =========================================
-- Nuestra tierra (inicio): fotos con su historia, editables desde el panel.
-- Se puede ejecutar varias veces: los datos iniciales solo se insertan si la tabla está vacía.
-- =========================================
create table if not exists land_tiles (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  tag text,
  title text,
  story text,
  image_url text not null,
  image_path text not null,   -- ruta en Storage ('seed/...' = foto de ejemplo del sitio)
  width int,
  height int,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists land_tiles_order_idx on land_tiles (is_published, sort_order);
alter table land_tiles enable row level security;
do $$ begin
  create policy "public read land" on land_tiles for select using (is_published);
exception when duplicate_object then null; end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('land', 'land', true, 5242880, array['image/webp','image/jpeg','image/png'])
on conflict (id) do nothing;

insert into land_tiles (name, tag, title, story, image_url, image_path, width, height, sort_order)
select * from (values
  ('Tucán', 'Aves', 'El tucán, sembrador del bosque', 'Su gran pico colorido no es solo adorno: le sirve para alcanzar frutos en las ramas más delgadas, donde su cuerpo no llegaría.
Al comer frutos y desplazarse de árbol en árbol, el tucán va dejando semillas por el camino y ayuda a que el bosque se renueve. Verlo cerca de los cultivos es señal de un territorio vivo y bien cuidado.
Por eso cultivamos el cacao de forma orgánica y agroecológica: para que aves como él sigan siendo parte del paisaje.', '/photos/tucan.webp', 'seed/tucan', 720, 1440, 0),
  ('Búho', 'Aves', 'El búho, guardián de la noche', 'Mientras el campo descansa, el búho trabaja. Con su vuelo silencioso y su vista de noche, vigila los cultivos y se alimenta de roedores que, de otro modo, dañarían las mazorcas de cacao.
Es un aliado del agricultor: cuida la cosecha sin necesidad de venenos.
Esa es la idea detrás de la agroecología: dejar que la naturaleza haga parte del trabajo.', '/photos/buho.webp', 'seed/buho', 1200, 1600, 1),
  ('Armadillo', 'Fauna', 'El armadillo, arquitecto del suelo', 'Discreto y de hábitos nocturnos, el armadillo recorre el monte buscando insectos y larvas. Al escarbar, remueve y airea la tierra, y esos huecos terminan sirviendo de refugio a otros animales.
Un suelo vivo y suelto es la base de un buen cacao. Cuando el armadillo aparece, el terreno está sano.
Cuidar su hogar es cuidar la tierra de donde sale nuestro chocolate.', '/photos/armadillo.webp', 'seed/armadillo', 709, 945, 2),
  ('Ardilla', 'Fauna', 'La ardilla, vecina de las ramas', 'Ágil y curiosa, la ardilla se mueve por las copas de los árboles de la finca desde la mañana temprano. Entierra y olvida semillas, y así, sin proponérselo, siembra árboles nuevos.
Convivir con la fauna silvestre es parte de nuestra forma de producir: el cacao crece a la sombra de otros árboles y comparte el espacio con quienes ya vivían allí.', '/photos/ardilla.webp', 'seed/ardilla', 880, 1186, 3),
  ('Urraca', 'Aves', 'La urraca, la voz del monte', 'Inteligente y sociable, la urraca vive en grupos y es de las primeras en anunciar el día con su canto. Su presencia delata un bosque con buena comida y refugio.
Como ella, los agricultores de Santander trabajan en comunidad: se ayudan, se avisan y comparten la cosecha. Esa unión es la que queremos reconocer con cada barra de chocolate.', '/photos/urraca.webp', 'seed/urraca', 960, 1280, 4),
  ('Caballos', 'Paisaje', 'Los caballos, compañeros de trabajo', 'En las montañas de Santander hay caminos por donde los vehículos no llegan, y allí el caballo sigue siendo un compañero de trabajo: baja la cosecha, sube los insumos y acompaña a la familia campesina.
Cada grano de cacao que llega a nuestra planta empieza su viaje en un recorrido como este, entre potreros y senderos de monte.', '/photos/caballos.webp', 'seed/caballos', 1193, 896, 5),
  ('La casa', 'Paisaje', 'La casa, donde empieza todo', 'Casas como esta, entre cultivos y montaña, son el punto de partida de nuestra historia. En Landázuri, Santander, tierra de tradición cacaotera y de nuestro fundador, las familias han vivido del cacao por generaciones.
De allí viene la idea de ZURYCH: comprar directamente a los productores, reducir intermediarios y pagar de forma más justa por su trabajo.', '/photos/casa-montana.webp', 'seed/casa-montana', 1156, 671, 6),
  ('La iglesia', 'Paisaje', 'La iglesia, el centro del pueblo', 'En los pueblos cacaoteros, la iglesia y la plaza son el lugar de encuentro: allí se reúnen las familias, se cierran los tratos y se celebran las fiestas de la comunidad.
Cuando hablamos de comercio justo hablamos de esto: de relaciones cercanas, de conocer a quien cultiva y de que el trabajo del campo tenga el reconocimiento que merece.', '/photos/iglesia.webp', 'seed/iglesia', 1600, 1056, 7)
) as v(name, tag, title, story, image_url, image_path, width, height, sort_order)
where not exists (select 1 from land_tiles);
