#!/usr/bin/env python3
"""Entra al panel de producción con una sesión real y comprueba qué devuelve.

Probar Supabase no basta: hay que ver qué renderiza Next.js. Y no se puede
comprobar buscando texto en el JavaScript del navegador —el panel es un
componente de servidor y su texto nunca llega ahí—, así que se pide la página
**con cookie de sesión**, como haría una persona.

Dos trampas ya pagadas, resueltas aquí:

  · React inserta `<!--…-->` entre un texto literal y una expresión, así que
    `Hola, {nombre}` llega al HTML como `Hola, <!-- -->Ana`. Buscar la cadena
    contigua da un falso negativo. Se limpian los comentarios antes de mirar.
  · La cuenta de prueba se borra en un `finally`. Una versión anterior murió a
    mitad y dejó una cuenta viva en producción.

    python3 scripts/prueba_panel_produccion.py --url https://<ref>.supabase.co \
        --web https://www.sapyria.com --publishable-file <ruta> --secret-file <ruta>
"""
from __future__ import annotations

import argparse
import base64
import json
import pathlib
import re
import secrets
import string
import sys
import urllib.error
import urllib.request

CORREO = "prueba-panel@sapyria.com"
NOMBRE = "Ana Torres"
PERFIL = "GSE228540"   # Sepsis
fallos: list[str] = []


def ok(etiqueta: str, condicion: bool, detalle: str = "") -> None:
    print(f"   {'✅' if condicion else '❌'} {etiqueta}{f'  ({detalle})' if detalle else ''}")
    if not condicion:
        fallos.append(etiqueta)


def clave_de(ruta: str, patron: str) -> str:
    hallado = re.search(patron, pathlib.Path(ruta).read_text())
    if not hallado:
        sys.exit(f"no encontré una clave {patron} en {ruta}")
    return hallado.group(0)


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--url", required=True)
    p.add_argument("--web", default="https://www.sapyria.com")
    p.add_argument("--publishable-file", required=True)
    p.add_argument("--secret-file", required=True)
    a = p.parse_args()

    pub = clave_de(a.publishable_file, r"sb_publishable_[A-Za-z0-9_-]+")
    secret = clave_de(a.secret_file, r"sb_secret_[A-Za-z0-9_-]+")
    ref = a.url.split("//")[1].split(".")[0]

    def api(ruta, datos=None, metodo=None, admin=False):
        k = secret if admin else pub
        h = {"apikey": k, "Authorization": f"Bearer {k}", "Content-Type": "application/json"}
        req = urllib.request.Request(f"{a.url}{ruta}",
                                     data=json.dumps(datos).encode() if datos is not None else None,
                                     headers=h, method=metodo)
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.status, json.loads(r.read() or b"{}")
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read() or b"{}")

    clave = "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(20))
    uid = None
    try:
        st, u = api("/auth/v1/admin/users",
                    {"email": CORREO, "password": clave, "email_confirm": True,
                     "user_metadata": {"full_name": NOMBRE}}, metodo="POST", admin=True)
        uid = u.get("id")
        ok("cuenta de prueba creada", st == 200 and bool(uid), f"HTTP {st}")
        if not uid:
            return 1

        st, sesion = api("/auth/v1/token?grant_type=password", {"email": CORREO, "password": clave}, metodo="POST")
        ok("login devuelve sesión", bool(sesion.get("access_token")), f"HTTP {st}")

        crudo = "base64-" + base64.b64encode(json.dumps(sesion).encode()).decode()
        trozos = [crudo[i:i + 3180] for i in range(0, len(crudo), 3180)]
        cookie = ("; ".join(f"sb-{ref}-auth-token.{i}={t}" for i, t in enumerate(trozos))
                  if len(trozos) > 1 else f"sb-{ref}-auth-token={crudo}")

        cabeceras = {"Cookie": cookie, "User-Agent": "Mozilla/5.0 (verificación Sapyria)"}

        def pedir_panel():
            req = urllib.request.Request(f"{a.web}/dashboard", headers=cabeceras)
            with urllib.request.urlopen(req, timeout=45) as r:
                # ← la trampa de React: separa el texto literal de la expresión
                return r.status, re.sub(r"<!--[^>]*-->", "", r.read().decode())

        print("\n── cuenta nueva: debe recibir la BIENVENIDA, no el informe ──")
        estado, html = pedir_panel()
        ok("GET /dashboard responde 200", estado == 200)
        ok("no rebotó a /login", "Espacio personal" not in html)
        ok("da la bienvenida por su nombre", f"Bienvenido, {NOMBRE.split()[0]}" in html)
        ok("explica que con Google no hay correo que confirmar",
           "no hay ningún correo que confirmar" in html)
        ok("ofrece elegir perfil", "Elige por dónde empezar" in html)
        ok("declara que los datos son reales", "Ninguna cifra está simulada" in html)
        ok("todavía NO muestra el informe", "Tus conjuntos biológicos" not in html)

        print("\n── elige un perfil ──")
        st, elegido = api("/rest/v1/rpc/elegir_perfil", {"p_cohorte": PERFIL}, metodo="POST", token=sesion["access_token"])
        ok("elegir_perfil funciona", st == 200 and elegido == PERFIL, f"HTTP {st} → {elegido}")

        print("\n── ahora sí: el informe del perfil elegido ──")
        estado, html = pedir_panel()
        ok("GET /dashboard responde 200", estado == 200)
        ok("saluda por su nombre", f"Hola, {NOMBRE.split()[0]}" in html)
        ok("titula con el perfil elegido", "Sepsis" in html)
        ok("declara la procedencia UNA vez", html.count("Ninguna cifra está simulada") == 1)
        for texto in ("Tus conjuntos biológicos", "Tu respuesta inflamatoria", "Inflamación aguda",
                      "Cómo se lee un perfil", "Qué sostiene cada lectura", "Hasta dónde llega"):
            ok(f"contiene «{texto}»", texto in html)
        ok("el límite NO se impone en el primer nivel", "Lo que esto no dice" not in html)
        ok("ya no grita «muestra sintética»", "MUESTRA SINTÉTICA" not in html)
        ok("ya no encabeza con un código de laboratorio", not re.search(r"DEMO-\d{4}", html))
    finally:
        if uid:
            st, _ = api(f"/auth/v1/admin/users/{uid}", metodo="DELETE", admin=True)
            _, todos = api("/auth/v1/admin/users?per_page=200", admin=True)
            ok("cuenta de prueba borrada", st == 200 and all(x["id"] != uid for x in todos["users"]),
               f"auth.users={len(todos['users'])}")

    print("\n" + ("✅ PANEL DE PRODUCCIÓN VERIFICADO" if not fallos else f"❌ fallaron: {fallos}"))
    return 1 if fallos else 0


if __name__ == "__main__":
    raise SystemExit(main())
