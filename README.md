# Chocolate Zurych · tienda virtual con pedidos por WhatsApp

React 18 + TypeScript + Vite + Tailwind 3 · Express (función serverless en Vercel) · Supabase.

## Estructura del sitio
Inicio (información general) · Tienda virtual (Canasta familiar, Snacks, Industrial) · Dónde encontrarnos · Blog. Panel en `/admin`.
Rutas antiguas (`/catalogo`, `/comunidad`, `/nosotros`) redirigen a las nuevas.

## Probar ya (modo demo, sin Supabase)
```bash
npm install
npm run dev        # web en :5173, API en :3001
```
Sin `SUPABASE_URL` la API sirve datos de ejemplo en memoria. El panel `/admin` necesita Supabase.

## Con Supabase
1. SQL Editor: `supabase/schema.sql` y luego `supabase/seed.sql` (contenido de muestra, opcional).
2. Authentication: crea el admin y `insert into admins (user_id, name) values ('<uuid>', 'Nombre');`
3. Copia `.env.example` a `.env`. Despliegue en Vercel: sección 13 del documento técnico (`vercel.json` incluido).

## Marca
- Paleta (Tailwind): ink #3b1f1a · bosque #064e44 · oro #bb8833 · arena #e8c9b2 · crema #f2e9de (fondo) · rojo #a53d2b · papel #fbf6ef y tierra #6e4b40 (tonos derivados).
- Fuentes: Bubbleboddy Neue Trial (títulos), Intro Rust (palabras grandes), Monotype Corsiva (lema), Alice (texto).
  Bubbleboddy y Corsiva no se incluyen (licencia): sin ellas se ven Fredoka y Chancery Z003. Para usarlas, copia tus archivos a
  `public/fonts/BubbleboddyNeue-Trial.woff2` y `public/fonts/MonotypeCorsiva.woff2`.
  Verifica la licencia de Intro Rust y de Chancery Z003 (URW) antes de publicar.
- Logo y fotos en `public/brand` y `public/photos`. Ilustraciones de producto provisionales en `public/art` (`npm run art`).
- `estudio-paleta.jpg`: comparación de fondos sólidos con la paleta.

## Contenido
Los textos salen únicamente del documento de ZURYCH (historia, fundador, pilares, reconocimientos, tienda del Quirinal, teléfono 313 258 4586,
correo zurychrb@hotmail.com y dirección «Calle 5C # 53S-57, barrio Quirinal, Bogotá»).
Faltan datos que no venían en el documento y por eso no se inventaron: horarios, precios, catálogo de productos, costo de domicilio, redes sociales y mapa.
Los 3 productos del catálogo son marcadores «precio a convenir»: agrega los reales desde `/admin/productos`.
Las ilustraciones de producto (`public/art`) son provisionales. La política de privacidad es un texto base: revísala con un abogado.

## Scripts
`npm test` · `npm run typecheck` · `npm run build` · `npm run seed:sql`

## No incluido
Cuentas de cliente y correos promocionales (sección 15 del documento).
