const TONES = {
  gold: 'bg-arena text-ink',
  sage: 'bg-bosque text-papel',
  dark: 'bg-bosque text-papel',
  red: 'bg-rojo text-papel',
  light: 'bg-crema text-ink',
};
export default function Badge({ children, tone = 'gold' }: { children: React.ReactNode; tone?: keyof typeof TONES }) {
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold leading-none ${TONES[tone]}`}>{children}</span>;
}
