import type { MetadataRoute } from "next";
import { cohortes } from "@/lib/showcase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://www.sapyria.com";
  const fijas = ["", "/como-funciona", "/tecnologia", "/demo", "/evidencia", "/sobre", "/privacidad", "/terminos"];
  const lista = await cohortes();
  return [
    ...fijas.map((r) => ({ url: `${base}${r}`, changeFrequency: "monthly" as const, priority: r === "" ? 1 : 0.8 })),
    ...lista.map((c) => ({ url: `${base}/demo/${c.id}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
