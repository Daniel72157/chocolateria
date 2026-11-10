import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

/** Aparición al entrar en pantalla: desvanecido + 12 px de desplazamiento, 400 ms, una sola vez.
 *  El contenido es visible por defecto (sin JS o con movimiento reducido no se oculta nada). */
export default function Reveal({ children, delay = 0, className = '', as = 'div' }: { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'li' | 'article' | 'section' | 'p' }) {
  const reduce = useReducedMotion();
  const M = motion[as] as typeof motion.div;
  if (reduce) return <M className={className}>{children}</M>;
  return (
    <M className={className} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-8% 0px' }} transition={{ duration: 0.4, ease: 'easeOut', delay }}>
      {children}
    </M>
  );
}
