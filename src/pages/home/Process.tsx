import Reveal from '../../components/ui/Reveal';

const STAGES = [
  { title: 'En el campo', rows: [['Cacao orgánico y agroecológico', 'Santander'], ['Compra directa a los productores', 'Landázuri']] },
  { title: 'En la planta', rows: [['Transformación artesanal del cacao', 'Bogotá'], ['Aprovechamiento del fruto', 'Economía circular']] },
  { title: 'En la tienda', rows: [['Servicio a la mesa', 'Quirinal'], ['Distintas formas de consumir el cacao', 'Bogotá']] },
];

/** La cadena de trabajo de ZURYCH como un recibo: cada etapa con su lugar. */
export default function Process() {
  return (
    <section aria-labelledby="proceso-title" className="on-dark bg-bosque py-[clamp(72px,12vw,160px)]">
      <div className="wrap grid items-start gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <h2 id="proceso-title" className="text-[clamp(2.5rem,4.4vw,4.25rem)] text-papel">Del campo a la mesa</h2>
          <p className="t-lead mt-6 max-w-[30ch] text-papel">Cada producto representa una cadena de trabajo que comienza en el campo, continúa con la transformación del cacao y termina en una experiencia.</p>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-6 lg:col-start-7">
          <div className="paper zig-b mx-auto w-full max-w-[480px] p-7 sm:p-9">
            {STAGES.map((st) => (
              <div key={st.title} className="mt-7 first:mt-0">
                <h3 className="font-sans text-base font-extrabold tracking-normal">{st.title}</h3>
                <ul className="mt-2">
                  {st.rows.map(([what, time]) => (
                    <li key={what} className="num mt-2 flex items-end gap-2"><span>{what}</span><span className="leader" aria-hidden /><span className="font-bold">{time}</span></li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="num mt-8 flex h-11 items-center justify-between bg-ink px-4 font-bold text-papel"><span>Origen y trazabilidad</span><span>Santander · Bogotá</span></p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
