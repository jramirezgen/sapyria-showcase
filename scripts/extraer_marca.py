#!/usr/bin/env python3
"""Deriva los activos de marca desde el logotipo oficial, por aritmética.

El manual de marca deja **pendientes** la versión transparente y el símbolo
aislado, y registra que un intento de extracción **generativa fue rechazado por
alterar el logotipo**. Esto es otra cosa: quitado de fondo por luminancia sobre
los píxeles del original. No redibuja, no filtra, no añade halo, no recolorea.

Y se comprueba: recompone el resultado sobre el lienzo medido y lo diferencia
contra el original **píxel a píxel**. Si la tinta cambia, aborta y no escribe
nada — que es lo que el manual pide al decir «aprobada contra el original».

    python3 scripts/extraer_marca.py --origen <ruta al png> --salida public/marca
"""
from __future__ import annotations

import argparse
import json
import pathlib

import numpy as np
from PIL import Image

# El lienzo tiene grano: su distancia al color de fondo llega a ~21/255 en los
# bordes. Por debajo de RUIDO es lienzo y se descarta; por encima de PLENO es
# tinta plena. Entre medias va el antialias, que se conserva en degradado —de ahí
# que no haga falta ningún halo—. La tinta real está a 390/255 de distancia, así
# que hay margen de sobra.
RUIDO, PLENO = 28.0, 70.0


def color_dominante(img: Image.Image) -> str:
    x = np.asarray(img).astype(np.float32)
    opaco = x[..., 3] > 200
    return "#" + "".join(f"{int(c):02x}" for c in x[..., :3][opaco].mean(axis=0))


# Una fila o columna cuenta como "con tinta" sólo si tiene varios píxeles. Con el
# criterio de un solo píxel, un artefacto suelto en el borde de la imagen estiraba
# la caja 320 px y hacía que la franja de separación pareciera estar al final.
MIN_PIXELES = 3


def caja(img: Image.Image, umbral: int = 60) -> Image.Image:
    a = np.asarray(img)[..., 3] > umbral
    filas = np.where(a.sum(axis=1) >= MIN_PIXELES)[0]
    cols = np.where(a.sum(axis=0) >= MIN_PIXELES)[0]
    return img.crop((int(cols.min()), int(filas.min()), int(cols.max()) + 1, int(filas.max()) + 1))


def banda_vacia(img: Image.Image, umbral: int = 60) -> tuple[int, int, int]:
    """La franja sin tinta más larga: separa el símbolo del logotipo."""
    filas = (np.asarray(img)[..., 3] > umbral).sum(axis=1) < MIN_PIXELES
    mejor, inicio = (0, 0, 0), None
    for i, vacia in enumerate(filas):
        if vacia and inicio is None:
            inicio = i
        elif not vacia and inicio is not None:
            if i - inicio > mejor[0]:
                mejor = (i - inicio, inicio, i)
            inicio = None
    return mejor


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--origen", required=True)
    p.add_argument("--salida", default="public/marca")
    a = p.parse_args()
    salida = pathlib.Path(a.salida)
    salida.mkdir(parents=True, exist_ok=True)

    im = Image.open(a.origen).convert("RGBA")
    rgb = np.asarray(im).astype(np.float32)[..., :3]

    # El lienzo no es blanco puro: se MIDE en las cuatro esquinas.
    esquinas = np.concatenate([rgb[:40, :40].reshape(-1, 3), rgb[:40, -40:].reshape(-1, 3),
                               rgb[-40:, :40].reshape(-1, 3), rgb[-40:, -40:].reshape(-1, 3)])
    fondo = esquinas.mean(axis=0)
    dist = np.linalg.norm(rgb - fondo, axis=-1)

    alpha = np.clip((dist - RUIDO) / (PLENO - RUIDO), 0, 1)
    # Se deshace la mezcla con el lienzo para recuperar el color puro de la tinta.
    seguro = np.maximum(alpha, 1e-4)[..., None]
    puro = np.clip((rgb - fondo * (1 - seguro)) / seguro, 0, 255)
    lockup = Image.fromarray(np.dstack([puro, alpha * 255]).astype(np.uint8), "RGBA")

    recompuesto = np.asarray(Image.alpha_composite(
        Image.new("RGBA", im.size, tuple(fondo.round().astype(int)) + (255,)), lockup)).astype(np.float32)
    d = np.abs(recompuesto[..., :3] - rgb).max(axis=-1)
    tinta = dist > PLENO
    fidelidad = {"tinta_maxima_255": round(float(d[tinta].max()), 3),
                 "tinta_media_255": round(float(d[tinta].mean()), 5),
                 "global_maxima_255": round(float(d.max()), 2)}
    print(f"lienzo medido      RGB {fondo.round(1).tolist()}")
    print(f"fidelidad (tinta)  máx {fidelidad['tinta_maxima_255']}/255 · media {fidelidad['tinta_media_255']}/255")
    print(f"fidelidad (global) máx {fidelidad['global_maxima_255']}/255 — es el grano del lienzo, que es lo que se quita")
    if d[tinta].max() > 3:
        raise SystemExit("❌ la extracción altera la tinta del logotipo: no se escribe nada")

    lockup = caja(lockup)
    largo, ini, fin = banda_vacia(lockup)
    print(f"lockup             {lockup.size} · franja sin tinta {largo}px [y={ini}..{fin}]")
    if not 20 < largo < lockup.height * 0.5:
        raise SystemExit("❌ no encuentro una separación clara entre símbolo y logotipo")

    simbolo = caja(lockup.crop((0, 0, lockup.width, ini)))
    logotipo = caja(lockup.crop((0, fin, lockup.width, lockup.height)))
    lockup.save(salida / "sapyria-lockup.png")
    simbolo.save(salida / "sapyria-simbolo.png")
    logotipo.save(salida / "sapyria-logotipo.png")
    simbolo.resize((512, round(512 * simbolo.height / simbolo.width)), Image.LANCZOS) \
           .save(salida / "sapyria-simbolo-512.png")

    c_sim, c_log = color_dominante(simbolo), color_dominante(logotipo)
    print(f"símbolo            {simbolo.size} · proporción {simbolo.width / simbolo.height:.3f} · {c_sim}")
    print(f"logotipo           {logotipo.size} · {c_log}")

    (salida / "PROCEDENCIA.json").write_text(json.dumps({
        "origen": f"{a.origen} ({im.width}x{im.height}, lienzo opaco RGB {fondo.round(1).tolist()})",
        "metodo": "quitado de fondo por luminancia con suelo de ruido; sin redibujar, sin filtros, sin recolorear",
        "umbrales": {"ruido": RUIDO, "pleno": PLENO},
        "fidelidad": fidelidad,
        "teal_medido_simbolo": c_sim,
        "tinta_medida_logotipo": c_log,
        "manual": {"teal": "#257F80", "tinta": "#002626"},
        "estado": "PENDIENTE DE APROBACION del propietario: el manual exige aprobar la versión transparente contra el original",
    }, indent=2, ensure_ascii=False) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
