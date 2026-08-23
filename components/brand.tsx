import Image from "next/image";
import Link from "next/link";

/**
 * La marca, con el símbolo OFICIAL.
 *
 * Antes había una «S» azul en una caja redondeada: ni el color ni la forma
 * salían del manual, y el logotipo real no aparecía en ninguna parte del sitio.
 *
 * Se usa el **símbolo** y el nombre como texto, no el logotipo tipográfico en
 * imagen, por dos razones medidas: el lockup oficial es vertical y no cabe en
 * una barra de 64 px, y su tinta (`#192223`) sobre el fondo oscuro del manual
 * (`#002626`) da **1,01:1** — desaparece. El manual pide una versión inversa
 * aprobada, que todavía no existe; hasta entonces, el símbolo (3,13:1 sobre
 * oscuro, suficiente para un elemento gráfico) más el nombre en Inter.
 *
 * El símbolo sale de `scripts/extraer_marca.py`: píxeles del original, sin
 * filtros ni recoloreado. Ver `public/marca/PROCEDENCIA.json`.
 */
export function Brand({ compacto = false }: { compacto?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Sapyria — inicio">
      <Image
        src="/marca/sapyria-simbolo-72.png"
        alt=""
        width={38}
        height={72}
        className="h-7 w-auto"
        priority
      />
      {compacto ? null : (
        <span className="text-[17px] font-extrabold tracking-[-0.03em]">Sapyria</span>
      )}
    </Link>
  );
}
