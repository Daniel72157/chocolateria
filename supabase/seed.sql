-- Datos de ejemplo (contenido de muestra). Ejecutar DESPUÉS de schema.sql.
begin;

-- Ajustes de la tienda (reemplaza el número de WhatsApp por el real)
update store_settings set store_name='Chocolate Zurych', whatsapp_number='573132584586', email='zurychrb@hotmail.com', delivery_fee=0, free_delivery_from=null, address='Calle 5C # 53S-57, barrio Quirinal, Bogotá', opening_hours='[]'::jsonb, order_message_footer='¡Gracias por tu pedido!' where id=1;

-- Catálogos
update catalogs set name='Canasta familiar', tagline='Chocolate artesanal para el hogar', description='Chocolate elaborado con cacao de agricultores de Santander, cultivado con prácticas orgánicas y agroecológicas.', cover_url='/photos/mujer-desayuno.webp', accent='bosque', sort_order=1 where slug='canasta-familiar';
update catalogs set name='Snacks', tagline='El cacao de otras formas', description='Derivados del cacao para disfrutar, como nuestro helado elaborado con mucílago, un componente del fruto que tradicionalmente se desperdicia.', cover_url='/photos/postre-malteada.webp', accent='oro', sort_order=2 where slug='snacks';
update catalogs set name='Industrial', tagline='Calidad y trazabilidad del cacao colombiano', description='Para empresas y mercados que valoran la calidad, la trazabilidad, la sostenibilidad y el origen de sus alimentos. Escríbenos y coordinamos tu pedido.', cover_url='/photos/ciclista-brownie.webp', accent='ink', sort_order=3 where slug='industrial';

-- Categorías
insert into categories (id, catalog_slug, name, slug, sort_order) values ('de483dd7-ad94-46ed-aa36-dc9883a083b1', 'canasta-familiar', 'Chocolate artesanal', 'chocolate-artesanal', 0) on conflict do nothing;
insert into categories (id, catalog_slug, name, slug, sort_order) values ('093bf85a-d00a-461d-aff9-ced6e692a379', 'snacks', 'Helados', 'helados', 1) on conflict do nothing;
insert into categories (id, catalog_slug, name, slug, sort_order) values ('0efd8731-0723-41f0-a716-bf1caa5212af', 'industrial', 'Cacao y derivados', 'cacao-y-derivados', 2) on conflict do nothing;

-- Productos, imágenes y presentaciones
insert into products (id, catalog_slug, category_id, name, slug, short_description, description, ingredients, allergens, unit_label, price_cop, compare_at_price_cop, price_on_request, min_qty, is_active, is_available, is_featured, tags, sort_order) values ('e3d38bc5-c258-415b-af63-2ac5ece20cfb', 'canasta-familiar', 'de483dd7-ad94-46ed-aa36-dc9883a083b1', 'Chocolate artesanal ZURYCH', 'chocolate-artesanal-zurych', 'Chocolate de cacao de agricultores de Santander.', 'Chocolate artesanal elaborado en nuestra planta de Bogotá con cacao de agricultores de Santander, cultivado mediante prácticas orgánicas y agroecológicas. Escríbenos por WhatsApp para conocer presentaciones y precios.', '', '', 'unidad', null, null, true, 1, true, true, true, array[]::text[], 0) on conflict do nothing;
insert into product_images (product_id, url, path, alt, sort_order) values ('e3d38bc5-c258-415b-af63-2ac5ece20cfb', '/art/barra.webp', 'seed/barra.webp', 'Chocolate artesanal ZURYCH', 0);
insert into products (id, catalog_slug, category_id, name, slug, short_description, description, ingredients, allergens, unit_label, price_cop, compare_at_price_cop, price_on_request, min_qty, is_active, is_available, is_featured, tags, sort_order) values ('981cf4f3-ebff-4f0b-ad05-00edb76e352f', 'snacks', '093bf85a-d00a-461d-aff9-ced6e692a379', 'Helado de mucílago de cacao', 'helado-de-mucilago-de-cacao', 'Helado hecho con el mucílago del fruto del cacao.', 'Helado elaborado con mucílago, un componente del fruto del cacao que tradicionalmente se desperdicia. Es parte de nuestra apuesta por la economía circular. Escríbenos por WhatsApp para conocer presentaciones y precios.', '', '', 'unidad', null, null, true, 1, true, true, true, array[]::text[], 1) on conflict do nothing;
insert into product_images (product_id, url, path, alt, sort_order) values ('981cf4f3-ebff-4f0b-ad05-00edb76e352f', '/art/helado.webp', 'seed/helado.webp', 'Helado de mucílago de cacao', 0);
insert into products (id, catalog_slug, category_id, name, slug, short_description, description, ingredients, allergens, unit_label, price_cop, compare_at_price_cop, price_on_request, min_qty, is_active, is_available, is_featured, tags, sort_order) values ('330f771d-c5a3-45ef-a691-2fc199e48eb2', 'industrial', '0efd8731-0723-41f0-a716-bf1caa5212af', 'Cacao y derivados para empresas', 'cacao-y-derivados-para-empresas', 'Pedidos coordinados directamente con nosotros.', 'Para empresas y mercados que valoran la calidad, la trazabilidad, la sostenibilidad y el origen de sus alimentos. Cuéntanos qué necesitas por WhatsApp y coordinamos tu pedido.', '', '', 'pedido', null, null, true, 1, true, true, true, array[]::text[], 2) on conflict do nothing;
insert into product_images (product_id, url, path, alt, sort_order) values ('330f771d-c5a3-45ef-a691-2fc199e48eb2', '/art/mayorista.webp', 'seed/mayorista.webp', 'Cacao y derivados para empresas', 0);

-- Comunidad
insert into posts (id, body, is_pinned, created_at) values ('6758efda-b370-47a2-a7a4-62cfb6513070', 'ZURYCH: una historia que comienza en la tierra, se transforma a través del cacao y busca llegar al mundo.
Somos una empresa colombiana de carácter familiar y artesanal, dedicada a transformar el cacao en productos de chocolate que destacan por su calidad, origen y autenticidad.', true, '2026-11-04T09:02:23.006Z') on conflict do nothing;
insert into post_media (post_id, url, path, width, height, sort_order) values ('6758efda-b370-47a2-a7a4-62cfb6513070', '/photos/familia.webp', 'seed/photos/familia.webp', 1066, 1600, 0);
insert into posts (id, body, is_pinned, created_at) values ('66dc2a33-fd9f-40b0-a060-da512ba6fc2b', 'Nuestra trayectoria ha recibido reconocimientos:
• 2020: Premio Empresario Colombiano de la Universidad del Rosario, categoría Colibrí Esmeralda.
• 2021: Tercer puesto en los Premios Latinoamérica Verde, categoría Economía, subcategoría Finanzas Sostenibles.', false, '2026-11-02T07:02:23.006Z') on conflict do nothing;
insert into post_media (post_id, url, path, width, height, sort_order) values ('66dc2a33-fd9f-40b0-a060-da512ba6fc2b', '/photos/padre.webp', 'seed/photos/padre.webp', 1066, 1600, 0);
insert into posts (id, body, is_pinned, created_at) values ('6d533664-1cd7-4b78-a007-b3c3fa8b8954', 'En 2021 abrimos nuestra primera tienda física especializada en cacao y chocolate, en el barrio Quirinal de Bogotá: un lugar para descubrir diferentes presentaciones, preparaciones y derivados del cacao, con servicio a la mesa.', false, '2026-10-29T13:02:23.006Z') on conflict do nothing;
insert into post_media (post_id, url, path, width, height, sort_order) values ('6d533664-1cd7-4b78-a007-b3c3fa8b8954', '/photos/ciclistas-mesa.webp', 'seed/photos/ciclistas-mesa.webp', 1600, 1066, 0);
insert into posts (id, body, is_pinned, created_at) values ('b655d045-d7db-4017-a3f7-0ac319063181', 'También exploramos nuevas formas de aprovechar el cacao: desarrollamos helados elaborados con mucílago, un componente del fruto que tradicionalmente se desperdicia, y aprovechamos la cascarilla para aplicaciones innovadoras.', false, '2026-10-25T19:02:23.006Z') on conflict do nothing;
insert into post_media (post_id, url, path, width, height, sort_order) values ('b655d045-d7db-4017-a3f7-0ac319063181', '/photos/mujer-chocolate.webp', 'seed/photos/mujer-chocolate.webp', 1600, 1066, 0);
insert into posts (id, body, is_pinned, created_at) values ('545ef0e1-c957-4d5a-a6c0-60d1196cd30a', 'Tres pilares guían nuestra forma de hacer chocolate:
1. El cacao como alimento.
2. Comercio justo.
3. Economía circular.', false, '2026-10-22T11:02:23.006Z') on conflict do nothing;

-- Página Nosotros
insert into about_sections (id, title, body, image_url, sort_order) values ('19eeb485-a6a0-4e73-a360-0c2eff900259', 'Una empresa familiar y artesanal', 'ZURYCH es una empresa colombiana de carácter familiar y artesanal, dedicada a la transformación del cacao en productos de chocolate que destacan por su calidad, origen y autenticidad.
Nuestra esencia nace de una convicción: un chocolate extraordinario comienza mucho antes de su elaboración; comienza en el origen del cacao.
Trabajamos con cacao de agricultores de Santander, cultivado mediante prácticas orgánicas y agroecológicas, para reconocer el trabajo de los productores, promover prácticas sostenibles y contribuir al bienestar de las comunidades rurales.', '/photos/familia.webp', 1) on conflict do nothing;
insert into about_sections (id, title, body, image_url, sort_order) values ('dc8354f4-6ca3-45f1-ab90-8a9c029b27b8', 'Origen: Landázuri, Santander', 'La historia de ZURYCH está ligada a la vida de su fundador, Ricardo Bareño Mendoza, nacido en Landázuri, Santander, una región de tradición cacaotera.
Durante unos doce años trabajó como guarda de seguridad en Bogotá y, en paralelo, estudió Administración de Empresas en la UNAD. En 2017, durante sus estudios, surgió la idea de crear una empresa que transformara el cacao y contribuyera al desarrollo de su tierra natal.
Al recordar las dificultades de los agricultores de su región para comercializar sus cosechas, vio una oportunidad: comprar cacao directamente a los productores, reducir intermediarios y ofrecer una remuneración más justa.
En 2018, tras dejar su empleo, y con sus recursos y el apoyo de su familia, puso en marcha ZURYCH Chocolate Artesanal, con una planta de producción en Bogotá y conexión directa con los productores de Landázuri.', '/photos/casa-montana.webp', 2) on conflict do nothing;
insert into about_sections (id, title, body, image_url, sort_order) values ('f9846254-160a-4aa1-abe9-b004097d854b', 'Una filosofía diferente', 'Desde nuestros inicios nos fundamentamos en tres pilares:
1. El cacao como alimento: redescubrir el chocolate como un alimento de calidad, priorizando las características naturales del cacao y evitando depender de ingredientes innecesarios.
2. Comercio justo: establecer relaciones directas con los agricultores y reconocer el valor de su trabajo.
3. Economía circular: aprovechar integralmente los recursos del fruto del cacao, reduciendo desperdicios y desarrollando nuevas alternativas de transformación.', '/photos/mujer-chocolate.webp', 3) on conflict do nothing;
insert into about_sections (id, title, body, image_url, sort_order) values ('c6348e93-94ee-4c9d-a124-ec04b259485f', 'Innovación y reconocimientos', 'Hemos explorado nuevas posibilidades de aprovechar el cacao, como helados elaborados con mucílago —un componente del fruto que tradicionalmente se desperdicia— y el uso de la cascarilla en aplicaciones innovadoras.
2020: Premio Empresario Colombiano de la Universidad del Rosario, categoría Colibrí Esmeralda.
2021: Tercer puesto en los Premios Latinoamérica Verde, categoría Economía, subcategoría Finanzas Sostenibles.', '/photos/padre.webp', 4) on conflict do nothing;
insert into about_sections (id, title, body, image_url, sort_order) values ('f59575b5-feb1-4872-ac7e-c7373f64ab06', 'Tienda ZURYCH', 'Una experiencia alrededor del cacao.
En 2021 abrimos nuestra primera tienda física especializada en cacao y chocolate, en el barrio Quirinal de Bogotá.
Nació para acercar a los consumidores al mundo del cacao con una experiencia que va más allá de vender chocolate: un lugar para descubrir diferentes presentaciones, preparaciones y derivados, con servicio a la mesa y distintas formas de consumir el cacao.', '/photos/ciclistas-mesa.webp', 5) on conflict do nothing;

commit;
