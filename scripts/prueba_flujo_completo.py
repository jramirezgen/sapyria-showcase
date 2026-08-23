#!/usr/bin/env python3
"""Recorre el flujo de acceso entero contra Supabase, y limpia lo que crea.

Comprueba lo que el SQL Editor NO puede comprobar: `claim_demo_sample()` sólo
hace algo cuando hay un `auth.uid()` detrás. Ejecutada sin sesión devuelve
`23502 null value in column "user_id"`, que es correcto y no prueba nada.

El usuario de prueba se borra en un `finally`. La primera versión de esta prueba
murió a mitad y dejó una cuenta viva en producción; de ahí el `finally`.

Uso:
    python3 scripts/prueba_flujo_completo.py \
        --url https://<ref>.supabase.co \
        --publishable-file <ruta> --secret-file <ruta>

Las claves se pasan SIEMPRE por ruta, nunca por valor: un token en la línea de
órdenes queda en el historial del intérprete y en la lista de procesos.
"""
from __future__ import annotations

import argparse
import json
import pathlib
import re
import secrets
import string
import sys
import urllib.error
import urllib.request

CORREO_PRUEBA = "prueba-flujo-completo@sapyria.com"


def leer_clave(ruta: str, patron: str) -> str:
    texto = pathlib.Path(ruta).read_text()
    hallado = re.search(patron, texto)
    if not hallado:
        sys.exit(f"no encontré una clave con la forma {patron} en {ruta}")
    return hallado.group(0)


class Api:
    def __init__(self, url: str, publishable: str, secret: str) -> None:
        self.url, self.pub, self.secret = url.rstrip("/"), publishable, secret

    def __call__(self, ruta, datos=None, metodo=None, token=None, admin=False):
        clave = self.secret if admin else self.pub
        cabeceras = {
            "apikey": clave,
            "Authorization": f"Bearer {token or clave}",
            "Content-Type": "application/json",
        }
        cuerpo = json.dumps(datos).encode() if datos is not None else None
        peticion = urllib.request.Request(f"{self.url}{ruta}", data=cuerpo,
                                          headers=cabeceras, method=metodo)
        try:
            with urllib.request.urlopen(peticion, timeout=30) as r:
                return r.status, json.loads(r.read() or b"{}")
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read() or b"{}")


fallos: list[str] = []


def comprobar(etiqueta: str, condicion: bool, detalle: str = "") -> None:
    print(f"   {'✅' if condicion else '❌'} {etiqueta}{f'  ({detalle})' if detalle else ''}")
    if not condicion:
        fallos.append(etiqueta)


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--url", required=True)
    p.add_argument("--publishable-file", required=True)
    p.add_argument("--secret-file", required=True)
    a = p.parse_args()

    api = Api(a.url,
              leer_clave(a.publishable_file, r"sb_publishable_[A-Za-z0-9_-]+"),
              leer_clave(a.secret_file, r"sb_secret_[A-Za-z0-9_-]+"))

    clave = "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(20))
    uid = None
    try:
        print("── 1. alta de cuenta ya confirmada (equivale al clic en el correo) ──")
        st, u = api("/auth/v1/admin/users",
                    {"email": CORREO_PRUEBA, "password": clave, "email_confirm": True,
                     "user_metadata": {"full_name": "Prueba de flujo"}},
                    metodo="POST", admin=True)
        uid = u.get("id")
        comprobar("la cuenta se crea", st == 200 and bool(uid), f"HTTP {st}")
        if not uid:
            print(f"      respuesta: {json.dumps(u)[:200]}")
            return 1

        print("\n── 2. login real (el endpoint que usa el formulario) ──")
        st, sesion = api("/auth/v1/token?grant_type=password",
                         {"email": CORREO_PRUEBA, "password": clave}, metodo="POST")
        jwt = sesion.get("access_token")
        comprobar("devuelve sesión", bool(jwt), f"HTTP {st}")
        if not jwt:
            return 1

        # El perfil se comprueba CON EL JWT DEL USUARIO, no con la clave de
        # servicio: es el camino que recorre la web, y el único que importa para
        # decir que el flujo funciona.
        print("\n── 3. el trigger creó el perfil ──")
        st, perfiles = api(f"/rest/v1/profiles?select=id,email,full_name", token=jwt)
        hay = isinstance(perfiles, list) and len(perfiles) == 1
        comprobar("el usuario ve su perfil (y sólo el suyo)", hay,
                  f"HTTP {st}" + ("" if hay else f" · {json.dumps(perfiles)[:120]}"))
        if hay:
            comprobar("guarda el full_name del formulario",
                      perfiles[0]["full_name"] == "Prueba de flujo", repr(perfiles[0]["full_name"]))

        print("\n── 4. claim_demo_sample() con el usuario autenticado ──")
        st, id1 = api("/rest/v1/rpc/claim_demo_sample", {}, metodo="POST", token=jwt)
        comprobar("asigna muestra", st == 200 and bool(id1), f"HTTP {st}")
        st, id2 = api("/rest/v1/rpc/claim_demo_sample", {}, metodo="POST", token=jwt)
        comprobar("es idempotente: la segunda llamada no crea otra", id1 == id2)

        print("\n── 5. la fila, leída POR EL PROPIO USUARIO a través de RLS ──")
        st, filas = api("/rest/v1/samples?select=sample_code,status,is_demo,user_id", token=jwt)
        ok = isinstance(filas, list) and len(filas) == 1
        comprobar("el usuario ve su muestra (y sólo la suya)", ok,
                  f"HTTP {st}" + ("" if ok else f" · {json.dumps(filas)[:140]}"))
        if ok:
            f = filas[0]
            comprobar("sample_code con formato DEMO-#### y distinto de 0000",
                      bool(re.fullmatch(r"DEMO-[0-9]{4}", f["sample_code"]))
                      and f["sample_code"] != "DEMO-0000", f["sample_code"])
            comprobar("status = ready", f["status"] == "ready", f["status"])
            comprobar("is_demo = true", f["is_demo"] is True)
            comprobar("user_id apunta a esta cuenta", f["user_id"] == uid)
    finally:
        if uid:
            print("\n── 6. limpieza y borrado en cascada ──")
            st, _ = api(f"/auth/v1/admin/users/{uid}", metodo="DELETE", admin=True)
            _, pr = api(f"/rest/v1/profiles?id=eq.{uid}&select=id", admin=True)
            _, sa = api(f"/rest/v1/samples?user_id=eq.{uid}&select=id", admin=True)
            comprobar("la cuenta de prueba se borra", st == 200, f"HTTP {st}")
            comprobar("la cascada se lleva perfil y muestra",
                      pr == [] and sa == [], f"perfiles={pr} muestras={sa}")

    print("\n" + ("✅ FLUJO COMPLETO VERIFICADO" if not fallos
                  else f"❌ {len(fallos)} comprobación(es) fallaron: {fallos}"))
    return 1 if fallos else 0


if __name__ == "__main__":
    raise SystemExit(main())
