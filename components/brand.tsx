import Link from "next/link";

export function Brand({ compacto = false }: { compacto?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Sapyria — inicio">
      <span
        aria-hidden
        className="grid size-7 place-items-center rounded-md text-[13px] font-extrabold text-white"
        style={{ background: "var(--accent)" }}
      >
        S
      </span>
      {compacto ? null : (
        <span className="text-[17px] font-extrabold tracking-[-0.03em]">Sapyria</span>
      )}
    </Link>
  );
}
