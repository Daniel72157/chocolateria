import { Fragment } from 'react';

const URL_RE = /(https?:\/\/[^\s<>"]+[^\s<>".,;:!?)])/g;

/** Texto plano con saltos de línea y enlaces; nunca se inserta HTML. */
export default function Linkified({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line.split(URL_RE).map((part, j) =>
            /^https?:\/\//.test(part) ? <a key={j} href={part} target="_blank" rel="noopener nofollow ugc" className="break-all underline">{part}</a> : <Fragment key={j}>{part}</Fragment>,
          )}
        </Fragment>
      ))}
    </>
  );
}
