"use client";

import { useState, type ReactNode } from "react";

/**
 * Pestañas accesibles: rol `tablist`, navegación con flechas y `aria-selected`.
 * La identidad de la pestaña activa nunca es sólo el color — lleva subrayado y
 * `aria-current`, para que se distinga sin depender del tono.
 */
export function Tabs({ items }: { items: { id: string; label: string; content: ReactNode }[] }) {
  const [activa, setActiva] = useState(items[0]?.id);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Secciones del resultado"
        className="flex gap-1 overflow-x-auto border-b"
        style={{ borderColor: "var(--border)" }}
        onKeyDown={(e) => {
          const i = items.findIndex((x) => x.id === activa);
          if (e.key === "ArrowRight") setActiva(items[(i + 1) % items.length].id);
          if (e.key === "ArrowLeft") setActiva(items[(i - 1 + items.length) % items.length].id);
        }}
      >
        {items.map((it) => {
          const on = it.id === activa;
          return (
            <button
              key={it.id}
              role="tab"
              type="button"
              id={`tab-${it.id}`}
              aria-selected={on}
              aria-controls={`panel-${it.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActiva(it.id)}
              className="-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors"
              style={{
                borderColor: on ? "var(--accent)" : "transparent",
                color: on ? "var(--accent)" : "var(--ink-2)",
              }}
            >
              {it.label}
            </button>
          );
        })}
      </div>
      {items.map((it) => (
        <div
          key={it.id}
          role="tabpanel"
          id={`panel-${it.id}`}
          aria-labelledby={`tab-${it.id}`}
          hidden={it.id !== activa}
          className="pt-8"
        >
          {it.id === activa ? it.content : null}
        </div>
      ))}
    </div>
  );
}
