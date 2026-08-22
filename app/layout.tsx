import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sapyria | Inteligencia molecular",
  description: "Interpretación molecular trazable para explorar señales ómicas.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
