#!/usr/bin/env python3
"""Create and seed the isolated Sapyria showcase dataset.

The database URL is read at execution time from the user-managed credential
file. It is never logged, written to a project file, or embedded in the site.
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path

import psycopg


CASES = (
    (
        "SR-014", "Perfil regulatorio exploratorio", "small_rna_seq",
        "Hipótesis sustentada",
        "Una firma coordinada de small RNAs orienta la exploración hacia rutas de neuroinflamación.",
        "Señal regulatoria consistente",
        "Recuperación de hipótesis con evidencia pública; interpretación phenotype-blind.",
        "Cobertura de señal", "0.81", "coherencia multi-miRNA", 2,
    ),
    (
        "WE-028", "Priorización de variante codificante", "wes", "Revisión técnica",
        "El recorrido conserva variantes relevantes y presenta contexto de calidad, frecuencia y evidencia.",
        "2 hallazgos para revisar",
        "Pipeline técnicamente operativo; cualquier conclusión requiere revisión clínica independiente.",
        "Cobertura objetivo", "98.4%", "bases objetivo ≥20×", 3,
    ),
    (
        "WG-006", "Piloto de amplitud genómica", "wgs", "Diseño exploratorio",
        "Un piloto orientado a SNV e indels germinales, con procedencia reproducible de extremo a extremo.",
        "SNV / indel germinal",
        "Arquitectura de piloto: no declara soporte para SV, CNV, MT, repeticiones ni mosaicismo.",
        "Profundidad planificada", "30×", "singleton de referencia", 1,
    ),
    (
        "SR-021", "Comparación de firma molecular", "small_rna_seq",
        "Exploración de cohorte",
        "La interfaz permite comparar una señal individual contra una cohorte de referencia sintética.",
        "Concordancia de patrón",
        "Tamizaje investigacional; no biomarcador clínicamente validado.",
        "Genes de ruta", "14", "hipótesis relacionadas", 2,
    ),
)


def database_url(credential_file: Path) -> str:
    match = re.search(r"postgres(?:ql)?://[^\s'\"]+", credential_file.read_text())
    if not match:
        raise SystemExit("No PostgreSQL URL found in the credential file.")
    return match.group(0)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--credential-file", type=Path, required=True)
    parser.add_argument("--schema", type=Path, default=Path(__file__).with_name("showcase_schema.sql"))
    args = parser.parse_args()

    with psycopg.connect(database_url(args.credential_file)) as conn:
        with conn.cursor() as cur:
            cur.execute(args.schema.read_text())
            cur.executemany(
                """
                insert into public.showcase_cases (
                  id, title, assay, status, summary, signal, evidence,
                  metric_label, metric_value, metric_detail, stage, is_public_demo
                ) values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, true)
                on conflict (id) do update set
                  title = excluded.title, assay = excluded.assay, status = excluded.status,
                  summary = excluded.summary, signal = excluded.signal,
                  evidence = excluded.evidence, metric_label = excluded.metric_label,
                  metric_value = excluded.metric_value, metric_detail = excluded.metric_detail,
                  stage = excluded.stage, updated_at = now(), is_public_demo = true
                """,
                CASES,
            )
        conn.commit()
    print(f"Seeded {len(CASES)} synthetic showcase cases.")


if __name__ == "__main__":
    main()
