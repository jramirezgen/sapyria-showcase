import Image from "next/image";

/**
 * Una figura del pipeline, tal cual la generó.
 *
 * NO se recorta ni se re-estiliza: cada una lleva su etiqueta de alcance DENTRO
 * de la imagen, precisamente porque una figura circula sola y sin esa etiqueta
 * un volcano se lee como un contraste entre dos grupos que aquí no existe.
 */
export function FiguraPipeline({
  src, alt, pie,
}: { src: string; alt: string; pie: string }) {
  return (
    <figure className="rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--surface-0)" }}>
      <div className="overflow-x-auto rounded-lg" style={{ background: "#ffffff" }}>
        <Image
          src={`/showcase/${src}`}
          alt={alt}
          width={1400}
          height={1080}
          className="h-auto w-full"
          sizes="(max-width: 768px) 100vw, 700px"
        />
      </div>
      <figcaption className="ink-2 mt-3 text-sm leading-relaxed pretty">{pie}</figcaption>
    </figure>
  );
}
